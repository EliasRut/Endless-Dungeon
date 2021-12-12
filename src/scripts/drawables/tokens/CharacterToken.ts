import { NpcScript } from '../../../../typings/custom';
import { Faction, VISITED_TILE_TINT } from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import Character from '../../worldstate/Character';

const GREEN_DIFF = 0x003300;

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

	constructor(scene: MainScene, x: number, y: number, tileName: string, type: string, id: string) {
		super(scene, x, y, tileName);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.type = type;
		this.id = id;
		this.lastMovedTimestamp = -Infinity;
		this.lastNecroticEffectTimestamp = -Infinity;
		this.necroticEffectStacks = 0;
	}

	public onCollide(withEnemy: boolean) {}

	public receiveHit(damage: number){
		this.stateObject.health -= damage;
	}
	public receiveStun(duration: number){
		const time = globalState.gameTime;
		if (this.stateObject.stunnedAt + this.stateObject.stunDuration > time) {
			return false;
		}
		this.stateObject.stunned = true;
		this.stateObject.stunnedAt = time;
		this.stateObject.stunDuration = duration;
		return true;
	}

	public getDistance(px: number, py: number) {
		const x = this.x - px;
		const y = this.y - py;
		return Math.hypot(x, y);
	}

	protected getOccupiedTile() {
		if (this.body) {
			const x = Math.round(this.body.x / TILE_WIDTH);
			const y = Math.round(this.body.y / TILE_HEIGHT);
			return this.scene.tileLayer.getTileAt(x, y);
		}
		return null;
	}

	protected receiveDotDamage(deltaTime: number) {}

	// update from main Scene
	public update(time: number, deltaTime: number) {
		const tile = this.getOccupiedTile();
		if (tile) {
			// let the necrotic Effekt disapear after 2 sec
			if (this.lastNecroticEffectTimestamp <= time - 2000) {
				this.necroticEffectStacks = 0;
			}
			if (this.necroticEffectStacks > 0) {
				// Color the token green
				this.tint = Math.min(0x00ff00, 0x006600 + GREEN_DIFF * this.necroticEffectStacks);
				this.receiveDotDamage(deltaTime);
			} else {
				this.tint = tile.tint;
			}
			this.setVisible(tile.tint > VISITED_TILE_TINT);
		}
	}
}
