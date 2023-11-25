import { Game } from 'phaser';
import { NpcScript } from '../../../../typings/custom';
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
import globalState from '../../worldstate';
import Character from '../../worldstate/Character';

// const GREEN_DIFF = 0x003300;
const DOT_TINT = [0xc8e44c, 0xb1db30, 0x98d023, 0x588800];
// const BLUE_DIFF = 0x000033;
// const ICE_TINT = [0xb3f1ff, 0x92d5ff, 0x4a9fff, 0x0085ff];
const ICE_TINT = [0xdbf3fa, 0xb7e9f7, 0x92dff3, 0x7ad7f0];

const HEALTHBAR_MAX_WIDTH = 16 * SCALE;
const HEALTHBAR_Y_OFFSET = 2 * SCALE;
export default class CharacterToken extends Phaser.Physics.Arcade.Sprite {
	stateObject: Character;
	scene: MainScene;
	id: string;
	type: string;
	script?: NpcScript;
	faction: Faction;
	isBeingMoved?: boolean;
	lastMovedTimestamp: number;
	lastNecroticEffectTimestamp: number;
	necroticEffectStacks: number;
	hitAt: number;
	lastIceEffectTimestamp: number;
	iceEffectStacks: number;
	tokenName: string;
	healthbar: Phaser.GameObjects.Image;
	charmedTime: number;
	healedTime: number;

	isSpawning: boolean = false;

	protected showHealthbar() {
		return false;
	}

	constructor(scene: MainScene, x: number, y: number, tileName: string, type: string, id: string) {
		super(scene, x * SCALE, y * SCALE, tileName);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setScale(SCALE);
		this.type = type;
		this.id = id;
		this.lastMovedTimestamp = -Infinity;
		this.lastNecroticEffectTimestamp = -Infinity;
		this.necroticEffectStacks = 0;
		this.lastIceEffectTimestamp = -Infinity;
		this.iceEffectStacks = 0;
		this.tokenName = tileName;
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
		this.charmedTime = -Infinity;
	}

	public onCollide(withEnemy: boolean) {}

	public receiveHit() {
		if (this.isSpawning) {
			return;
		}
		if (this.stateObject.health > 0) {
			if (!this.receiveStun(250)) {
				this.play({
					key: `${this.type}-damage-${facingToSpriteNameMap[this.stateObject.currentFacing]}`,
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
				}).chain({
					key: `${this.type}-idle-${facingToSpriteNameMap[this.stateObject.currentFacing]}`,
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
				});
			}
		}
	}
	public receiveHealing() {
		if (this.isSpawning) {
			return;
		}
		this.tint = 0x00ff00;
		this.healedTime = globalState.gameTime;
	}
	public receiveStun(duration: number) {
		if (this.isSpawning) {
			return;
		}
		if (this.stateObject.health > 0) {
			const time = globalState.gameTime;
			if (this.stateObject.stunnedAt + this.stateObject.stunDuration > time) {
				return true;
			}
			this.stateObject.stunned = true;
			this.stateObject.stunnedAt = time;
			this.stateObject.stunDuration = duration;
			this.stateObject.isWalking = false;
			const animation = `${this.type}-stun-${
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

	public getDistanceToWorldStatePosition(px: number, py: number) {
		const x = this.x - px * SCALE;
		const y = this.y - py * SCALE;
		return Math.hypot(x, y);
	}

	protected getOccupiedTile() {
		if (this.body) {
			const x = Math.round(this.body.x / TILE_WIDTH / SCALE);
			const y = Math.round(this.body.y / TILE_HEIGHT / SCALE);
			return this.scene.tileLayer.getTileAt(x, y);
		}
		return null;
	}

	public takeDamage(damage: number) {
		this.scene.addFadingLabel(
			`${Math.round(damage)}`,
			FadingLabelSize.NORMAL,
			'#FFFF00',
			this.x,
			this.y - this.body.height,
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
			this.y - this.body.height,
			1000
		);
		this.stateObject.health += healing;
		if (this.showHealthbar()) {
			this.updateHealthbar();
		}
	}

	destroy(fromScene?: boolean) {
		if (this.showHealthbar()) {
			this.healthbar.destroy(fromScene);
		}
		super.destroy(fromScene);
	}

	die() {
		if (this.showHealthbar()) {
			this.healthbar.scaleX = 0;
			this.healthbar.setVisible(false);
		}
	}

	public updateHealthbar() {
		this.healthbar.scaleX =
			(Math.max(0, this.stateObject.health) / this.stateObject.maxHealth) * HEALTHBAR_MAX_WIDTH;
	}

	protected receiveDotDamage(deltaTime: number) {
		// dot = damage over time, deltatime is in ms so we have to devide it by 1000
		const dot =
			(globalState.playerCharacter.damage * this.necroticEffectStacks * deltaTime) / 1000 / 4;
		this.stateObject.health = this.stateObject.health - dot;
		this.updateHealthbar();
	}

	protected setSlowFactor() {
		this.stateObject.slowFactor = Math.max(1 - this.iceEffectStacks / 4, 0.01);
	}

	// update from main Scene
	public update(time: number, deltaTime: number) {
		const tile = this.getOccupiedTile();
		if (tile) {
			const hasHealthbar = this.showHealthbar();
			// let the necrotic Effekt disapear after 2 sec
			if (this.lastNecroticEffectTimestamp <= time - 2000) {
				this.necroticEffectStacks = 0;
			}
			if (this.necroticEffectStacks > 4) {
				this.necroticEffectStacks = 4;
			}
			if (this.lastIceEffectTimestamp <= time - 2000) {
				this.iceEffectStacks = 0;
			}
			if (this.iceEffectStacks > 4) {
				this.iceEffectStacks = 4;
			}
			if (this.charmedTime + 6000 >= time) {
				this.tint = 0xffcccc;
				if (hasHealthbar) {
					this.healthbar.tint = 0xffcccc;
				}
			} else if (this.healedTime + 300 >= time) {
				this.tint = 0x00ff00;
			} else if (this.necroticEffectStacks > 0) {
				// Color the token green and deal damage over time
				this.tint = DOT_TINT[this.necroticEffectStacks - 1];
				if (hasHealthbar) {
					this.healthbar.tint = DOT_TINT[this.necroticEffectStacks - 1];
				}
				// this.tint = Math.min(0x00ff00, 0x006600 + GREEN_DIFF * this.necroticEffectStacks);
				this.receiveDotDamage(deltaTime);
			} else if (this.iceEffectStacks > 0) {
				// Color the token blue and slows down
				this.tint = ICE_TINT[this.iceEffectStacks - 1];
				if (hasHealthbar) {
					this.healthbar.tint = ICE_TINT[this.iceEffectStacks - 1];
				}
				// this.tint = Math.min(0x0000ff, 0x000066 + BLUE_DIFF * this.iceEffectStacks);
				this.setSlowFactor();
			} else {
				this.tint = tile.tint;
				if (hasHealthbar) {
					this.healthbar.tint = tile.tint;
				}
			}
			this.setVisible(tile.tint > VISITED_TILE_TINT);
			if (hasHealthbar) {
				this.healthbar.setVisible(tile.tint > VISITED_TILE_TINT);
				this.healthbar.x = this.x;
				this.healthbar.y = this.y - this.height - HEALTHBAR_Y_OFFSET;
			}
		}
	}
}
