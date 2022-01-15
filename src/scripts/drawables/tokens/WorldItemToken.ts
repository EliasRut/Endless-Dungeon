import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import { ItemData, EquipmentKey, UneqippableItem } from '../../../items/itemData';
import {
	isEquippable,
	getEquipmentDataForItemKey,
	equipItemIfNoneEquipped,
} from '../../helpers/inventory';
import { SCALE } from '../../helpers/constants';

const MAX_INTERACTION_DISTANCE = 30;
const HEAL_PERCENTAGE = 1 / 4; // health

export default class ItemToken extends Phaser.Physics.Arcade.Sprite {
	isDestroyed: boolean = false;
	itemKey: string;
	level: number;
	tileX: number;
	tileY: number;
	tile?: Phaser.Tilemaps.Tile;

	constructor(
		scene: MainScene,
		x: number,
		y: number,
		itemKey: string,
		item: ItemData,
		level: number
	) {
		super(scene, x * SCALE, y * SCALE, 'test-items-spritesheet', item.iconFrame);
		const tileX = Math.round(x / TILE_WIDTH);
		const tileY = Math.round(y / TILE_HEIGHT);
		this.itemKey = itemKey;
		this.level = level;
		this.tile = (this.scene as MainScene).tileLayer.getTileAt(tileX, tileY);
		this.tileY = Math.round(y / TILE_HEIGHT);
		this.tileX = Math.round(x / TILE_WIDTH);
		scene.add.existing(this);
	}

	public update(scene: MainScene) {
		const px = scene.mainCharacter.x;
		const py = scene.mainCharacter.y;
		const distance = Math.hypot(this.x - px, this.y - py);
		// if you run over item, put into inventory
		if (distance < MAX_INTERACTION_DISTANCE * SCALE) {
			if (this.itemKey === 'health') {
				const heal = Math.round(globalState.playerCharacter.maxHealth / HEAL_PERCENTAGE);
				globalState.playerCharacter.health =
					globalState.playerCharacter.health + heal > globalState.playerCharacter.maxHealth
						? globalState.playerCharacter.maxHealth
						: globalState.playerCharacter.health + heal;
			} else {
				if (isEquippable(this.itemKey)) {
					const equipmentData = getEquipmentDataForItemKey(this.itemKey as EquipmentKey);
					if (this.level > equipmentData.level) {
						equipmentData.level = this.level;
						equipItemIfNoneEquipped(this.itemKey as EquipmentKey);
					}
					scene.overlayScreens.inventory.update();
				} else {
					const unequippableItemKey = this.itemKey as UneqippableItem;
					globalState.inventory.bag[unequippableItemKey] =
						(globalState.inventory.bag[unequippableItemKey] || 0) + 1;
				}
			}

			this.isDestroyed = true;
			this.destroy(true);
		}
		if (scene?.dynamicLightingHelper && this.tile) {
			this.tint = this.tile?.tint;
		}
	}
}
