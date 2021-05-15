import { NpcScript } from '../../../../typings/custom';
import { Faction } from '../../helpers/constants';
import Door from '../../worldstate/Door';
import globalState from '../../worldstate/index';
import MainScene from '../../scenes/MainScene';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';

export default class CharacterToken extends Phaser.Physics.Arcade.Sprite {
	id: string;
	type: string;
	script?: NpcScript;
	faction: Faction;
	tile?: Phaser.Tilemaps.Tile;

	constructor(
			scene: Phaser.Scene,
			x: number,
			y: number,
			tileName: string,
			id: string
		) {
		super(scene, x, y, tileName);
		const tileX = Math.round(x / TILE_WIDTH);
		const tileY = Math.round(y / TILE_HEIGHT);
		this.tile = (this.scene as MainScene).tileLayer.getTileAt(tileX, tileY);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.id = id;
		this.body.immovable = true;
		const door = globalState.doors[id];
		this.body.checkCollision.none = (door.open as any);
	}

	open() {
		const door = globalState.doors[this.id];
		door.open = true;
		this.setFrame(1);
		this.body.checkCollision.none = (true as any);
	}

	close() {
		const door = globalState.doors[this.id];
		door.open = false;
		this.setFrame(0);
		this.body.checkCollision.none = (false as any);
	}

	update(scene: MainScene) {
		if (scene?.dynamicLightingHelper && this.tile) {
			this.tint = this.tile?.tint;
		}
	}
}
