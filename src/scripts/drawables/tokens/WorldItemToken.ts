import Item from '../../worldstate/Item';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import { UiDepths } from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';

const MAX_INTERACTION_DISTANCE = 30;
const MAX_EQUIPPABLE_ITEM_LOCATION = 80;

export default class ItemToken extends Phaser.Physics.Arcade.Sprite {
	stateObject: Item;
	isDestroyed: boolean = false;
	tileX: number;
	tileY: number;
	tile?: Phaser.Tilemaps.Tile;


	constructor(scene: MainScene, x: number, y: number, item: Item) {
		super(scene, x, y, 'test-items-spritesheet', item.iconFrame);
		const tileX = Math.round(x / TILE_WIDTH);
		const tileY = Math.round(y / TILE_HEIGHT);
		this.tile = (this.scene as MainScene).tileLayer.getTileAt(tileX, tileY)
		this.tileY = Math.round(y / TILE_HEIGHT);
		this.tileX = Math.round(x / TILE_WIDTH);
		this.stateObject = item;
		scene.add.existing(this);
	}

	public update(scene: MainScene) {
		const px = scene.mainCharacter.x;
		const py = scene.mainCharacter.y;
		const distance = Math.hypot(this.x - px, this.y - py);
		// if you run over item, put into inventory
		if (distance < MAX_INTERACTION_DISTANCE) {
			scene.overlayScreens.inventory.addToInventory(this.stateObject);
			this.isDestroyed = true;
			this.destroy(true);
		}
		if (scene?.dynamicLightingHelper && this.tile) {
			this.tint = this.tile?.tint;
		}
	}
}