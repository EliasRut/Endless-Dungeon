import { NpcScript } from '../../../../typings/custom';
import { facingToSpriteNameMap, Faction, SCALE, VISITED_TILE_TINT } from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import Character from '../../worldstate/Character';

// const GREEN_DIFF = 0x003300;
const DOT_TINT = [0xc8e44c, 0xb1db30, 0x98d023, 0x588800];
// const BLUE_DIFF = 0x000033;
// const ICE_TINT = [0xb3f1ff, 0x92d5ff, 0x4a9fff, 0x0085ff];
const ICE_TINT = [0xdbf3fa, 0xb7e9f7, 0x92dff3, 0x7ad7f0];

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
	}

	public onCollide(withEnemy: boolean) {}

	public receiveHit(damage: number) {
		this.stateObject.health -= damage;
		if(this.receiveStun(250)) {
			console.log(this.type);
			this.play({key: `${this.type}-damage-${facingToSpriteNameMap[this.stateObject.currentFacing]}`})
			.chain({key: `${this.type}-idle-${facingToSpriteNameMap[this.stateObject.currentFacing]}`});
		}
	}
	public receiveStun(duration: number) {
		const time = globalState.gameTime;
		if (this.stateObject.stunnedAt + this.stateObject.stunDuration > time) {
			return false;
		}
		this.stateObject.stunned = true;
		this.stateObject.stunnedAt = time;
		this.stateObject.stunDuration = duration;
		return true;
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

	protected receiveDotDamage(deltaTime: number) {}
	protected setSlowFactor() {}

	// update from main Scene
	public update(time: number, deltaTime: number) {
		const tile = this.getOccupiedTile();
		if (tile) {
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
			if (this.necroticEffectStacks > 0) {
				// Color the token green and deal damage over time
				this.tint = DOT_TINT[this.necroticEffectStacks - 1];
				// this.tint = Math.min(0x00ff00, 0x006600 + GREEN_DIFF * this.necroticEffectStacks);
				this.receiveDotDamage(deltaTime);
			} else if (this.iceEffectStacks > 0) {
				// Color the token blue and slows down
				this.tint = ICE_TINT[this.iceEffectStacks - 1];
				// this.tint = Math.min(0x0000ff, 0x000066 + BLUE_DIFF * this.iceEffectStacks);
				this.setSlowFactor();
			} else {
				this.tint = tile.tint;
			}
			this.setVisible(tile.tint > VISITED_TILE_TINT);
		}
	}
}
