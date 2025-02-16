import { NpcScript } from '../../../../../typings/custom';
import {
	facingToSpriteNameMap,
	Faction,
	SCALE,
	VISITED_TILE_TINT,
	NORMAL_ANIMATION_FRAME_RATE,
	FadingLabelSize,
	UiDepths,
} from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import MainScene from '../../scenes/MainScene';
import worldstate from '../../worldState';
import Character from '../../../../types/Character';
import {
	CharacterTokenData,
	DefaultCharacterTokenData,
} from '../../../../types/CharacterTokenData';
import { AiStepResult } from '../../../../types/CharacterTokenUpdateEffect';
import { getOccupiedTile } from '../../helpers/getOccupiedTile';

// const GREEN_DIFF = 0x003300;
const DOT_TINT = [0xc8e44c, 0xb1db30, 0x98d023, 0x588800];
// const BLUE_DIFF = 0x000033;
// const ICE_TINT = [0xb3f1ff, 0x92d5ff, 0x4a9fff, 0x0085ff];
const ICE_TINT = [0xdbf3fa, 0xb7e9f7, 0x92dff3, 0x7ad7f0];

const HEALTHBAR_MAX_WIDTH = 16 * SCALE;
const HEALTHBAR_Y_OFFSET = 2 * SCALE;
export default class CharacterToken extends Phaser.Physics.Arcade.Sprite {
	declare scene: MainScene;
	declare stateObject: Character;
	tokenData: CharacterTokenData = { ...DefaultCharacterTokenData };
	healthbar?: Phaser.GameObjects.Image;

	protected getTokenData() {
		return this.tokenData;
	}

	protected showHealthbar() {
		return false;
	}

	constructor(scene: MainScene, x: number, y: number, tileName: string, type: string, id: string) {
		super(scene, x * SCALE, y * SCALE, tileName);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setScale(SCALE);
		this.tokenData.type = type;
		this.tokenData.id = id;
		this.tokenData.lastMovedTimestamp = -Infinity;
		this.tokenData.lastNecroticEffectTimestamp = -Infinity;
		this.tokenData.hitAt = -Infinity;
		this.tokenData.healedTime = -Infinity;
		this.tokenData.necroticEffectStacks = 0;
		this.tokenData.lastIceEffectTimestamp = -Infinity;
		this.tokenData.iceEffectStacks = 0;
		this.tokenData.tokenName = tileName;
		if (this.showHealthbar()) {
			this.healthbar = new Phaser.GameObjects.Image(
				scene,
				x * SCALE,
				y * SCALE - this.height - HEALTHBAR_Y_OFFSET,
				'icon-healthbar'
			);
			this.healthbar.scaleX = HEALTHBAR_MAX_WIDTH;
			this.healthbar.setDepth(UiDepths.FLOATING_HEALTHBAR_LAYER);
			scene.add.existing(this.healthbar);
		}
		this.tokenData.charmedTime = -Infinity;
	}

	public onCollide(withEnemy: boolean) {}

	public receiveHit() {
		if (this.tokenData.isSpawning) {
			return;
		}
		if (this.stateObject.health > 0) {
			if (!this.receiveStun(250)) {
				this.play({
					key: `${this.tokenData.type}-damage-${
						facingToSpriteNameMap[this.stateObject.currentFacing]
					}`,
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
				}).chain({
					key: `${this.tokenData.type}-idle-${
						facingToSpriteNameMap[this.stateObject.currentFacing]
					}`,
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
				});
			}
		}
	}
	public receiveHealing() {
		if (this.tokenData.isSpawning) {
			return;
		}
		this.tint = 0x00ff00;
		this.tokenData.healedTime = worldstate.gameTime;
	}
	public receiveStun(duration: number) {
		if (this.tokenData.isSpawning) {
			return;
		}
		if (this.stateObject.health > 0) {
			const time = worldstate.gameTime;
			if (this.stateObject.stunnedAt + this.stateObject.stunDuration > time) {
				return true;
			}
			this.stateObject.stunned = true;
			this.stateObject.stunnedAt = time;
			this.stateObject.stunDuration = duration;
			this.stateObject.isWalking = false;
			const animation = `${this.tokenData.type}-stun-${
				facingToSpriteNameMap[this.stateObject.currentFacing]
			}`;
			if (duration >= 500 && this.scene.game.anims.exists(animation)) {
				this.play({
					key: animation,
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
					// 1 run = 500ms
					repeat: Math.floor((2 * duration) / 1000),
				});
				return true;
			}
			return false;
		}
	}

	public takeDamage(damage: number) {
		this.scene.addFadingLabel(
			`${Math.round(damage)}`,
			FadingLabelSize.NORMAL,
			'#FFFF00',
			this.x,
			this.y - this.body!.height,
			1000
		);
		this.stateObject.health -= damage;
		if (this.showHealthbar()) {
			this.updateHealthbar();
		}
	}

	public healDamage(healing: number) {
		this.scene.addFadingLabel(
			`${Math.round(healing)}`,
			FadingLabelSize.NORMAL,
			'#00FF00',
			this.x,
			this.y - this.body!.height,
			1000
		);
		this.stateObject.health += healing;
		if (this.showHealthbar()) {
			this.updateHealthbar();
		}
	}

	destroy(fromScene?: boolean) {
		if (this.showHealthbar()) {
			this.healthbar!.destroy(fromScene);
		}
		super.destroy(fromScene);
	}

	die() {
		if (this.showHealthbar()) {
			this.healthbar!.scaleX = 0;
			this.healthbar!.setVisible(false);
		}
	}

	public updateHealthbar() {
		this.healthbar!.scaleX =
			(Math.max(0, this.stateObject.health) / this.stateObject.maxHealth) * HEALTHBAR_MAX_WIDTH;
	}

	protected receiveDotDamage(deltaTime: number) {
		// dot = damage over time, deltatime is in ms so we have to devide it by 1000
		const dot =
			(worldstate.playerCharacter.damage * this.tokenData.necroticEffectStacks * deltaTime) /
			1000 /
			4;
		this.stateObject.health = this.stateObject.health - dot;
		this.updateHealthbar();
	}

	protected setSlowFactor() {
		this.stateObject.slowFactor = Math.max(1 - this.tokenData.iceEffectStacks / 4, 0.01);
	}

	// update from main Scene
	public update(time: number, deltaTime: number) {
		const tile = getOccupiedTile(this.body?.x, this.body?.y, this.scene);
		if (tile) {
			const hasHealthbar = this.showHealthbar();
			// let the necrotic Effekt disapear after 2 sec
			if (this.tokenData.lastNecroticEffectTimestamp <= time - 2000) {
				this.tokenData.necroticEffectStacks = 0;
			}
			if (this.tokenData.necroticEffectStacks > 4) {
				this.tokenData.necroticEffectStacks = 4;
			}
			if (this.tokenData.lastIceEffectTimestamp <= time - 2000) {
				this.tokenData.iceEffectStacks = 0;
			}
			if (this.tokenData.iceEffectStacks > 4) {
				this.tokenData.iceEffectStacks = 4;
			}
			if (this.tokenData.charmedTime + 6000 >= time) {
				this.tint = 0xffcccc;
				if (hasHealthbar) {
					this.healthbar!.tint = 0xffcccc;
				}
			} else if (this.tokenData.healedTime + 300 >= time) {
				this.tint = 0x00ff00;
			} else if (this.tokenData.necroticEffectStacks > 0) {
				// Color the token green and deal damage over time
				this.tint = DOT_TINT[this.tokenData.necroticEffectStacks - 1];
				if (hasHealthbar) {
					this.healthbar!.tint = DOT_TINT[this.tokenData.necroticEffectStacks - 1];
				}
				// this.tint = Math.min(0x00ff00, 0x006600 + GREEN_DIFF * this.necroticEffectStacks);
				this.receiveDotDamage(deltaTime);
			} else if (this.tokenData.iceEffectStacks > 0) {
				// Color the token blue and slows down
				this.tint = ICE_TINT[this.tokenData.iceEffectStacks - 1];
				if (hasHealthbar) {
					this.healthbar!.tint = ICE_TINT[this.tokenData.iceEffectStacks - 1];
				}
				// this.tint = Math.min(0x0000ff, 0x000066 + BLUE_DIFF * this.iceEffectStacks);
				this.setSlowFactor();
			} else {
				this.tint = tile.tint;
				if (hasHealthbar) {
					this.healthbar!.tint = tile.tint;
				}
			}
			this.setVisible(tile.tint > VISITED_TILE_TINT);
			if (hasHealthbar) {
				this.healthbar!.setVisible(tile.tint > VISITED_TILE_TINT);
				this.healthbar!.x = this.x;
				this.healthbar!.y = this.y - this.height - HEALTHBAR_Y_OFFSET;
			}
		}
	}
}
