import { NpcScript } from '../../../../typings/custom';
import {
	Faction,
	SCALE,
	UiDepths,
	NORMAL_ANIMATION_FRAME_RATE,
	DOOR_OFFSETS,
	DOOR_TYPE,
} from '../../helpers/constants';
import Door from '../../worldstate/Door';
import globalState from '../../worldstate/index';
import MainScene from '../../scenes/MainScene';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';

export default class DoorToken extends Phaser.Physics.Arcade.Sprite {
	id: string;
	doorName: string;
	script?: NpcScript;
	faction: Faction;
	tile?: Phaser.Tilemaps.Tile;

	constructor(scene: Phaser.Scene, x: number, y: number, doorName: string, id: string) {
		super(scene, x, y, `${doorName}_idle`);
		this.doorName = doorName;
		const tileX = Math.round(x / TILE_WIDTH / SCALE);
		const tileY = Math.round(y / TILE_HEIGHT / SCALE);
		this.tile = (this.scene as MainScene).tileLayer.getTileAt(tileX, tileY);
		const lastFrameTextureKey = this.anims.animationManager
			.get(`${doorName}_open`)
			.getLastFrame().textureKey;
		const lastFrameTexture = this.texture.get(lastFrameTextureKey);
		const textureWidth = lastFrameTexture.width;
		const textureHeight = lastFrameTexture.height;
		const doorOffset = DOOR_OFFSETS[doorName as DOOR_TYPE];
		this.x = x - (textureWidth * SCALE) / 2 + doorOffset.x * SCALE;
		this.y = y - (textureHeight * SCALE) / 2 + doorOffset.y * SCALE;
		this.setOrigin(0, 0);
		this.setScale(SCALE);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.id = id;
		this.body.immovable = true;
		const door = globalState.doors[id];
		this.body.checkCollision.none = door.open as any;
		if (door.open) {
			this.play({ key: `${doorName}_o`, frameRate: NORMAL_ANIMATION_FRAME_RATE });
		} else {
			this.play({ key: `${doorName}_c`, frameRate: NORMAL_ANIMATION_FRAME_RATE });
		}
	}

	open() {
		const door = globalState.doors[this.id];
		door.open = true;
		this.play({ key: `${this.doorName}_open`, frameRate: NORMAL_ANIMATION_FRAME_RATE });
		this.on('animationcomplete', () => {
			this.body.checkCollision.none = true as any;
		});
	}

	close() {
		const door = globalState.doors[this.id];
		door.open = false;
		this.play({ key: `${this.doorName}_c`, frameRate: NORMAL_ANIMATION_FRAME_RATE });
		this.body.checkCollision.none = false as any;
	}

	update(scene: MainScene) {
		if (scene?.dynamicLightingHelper && this.tile) {
			this.tint = this.tile?.tint;
		}
	}
}
