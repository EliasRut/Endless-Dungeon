import MainScene from '../../scenes/MainScene';
import worldstate from '../../worldState';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import {
	isEquippable,
	getEquipmentDataForItemKey,
	equipItemIfNoneEquipped,
} from '../../helpers/inventory';
import { ColorsOfMagic, SCALE } from '../../helpers/constants';
import { EquipmentKey, ItemData, UneqippableItem } from '../../../../types/Item';

const MAX_INTERACTION_DISTANCE = 30;
const HEAL_PERCENTAGE = 1 / 4; // health

export default class ItemToken extends Phaser.Physics.Arcade.Sprite {
	declare scene: MainScene;
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
		level: number,
		texture: string = 'test-items-spritesheet'
	) {
		super(scene, x, y, texture, texture === 'test-items-spritesheet' ? item.iconFrame : 0);
		this.loadIcon();
		this.itemKey = itemKey;
		this.level = level;
		this.tileY = Math.round(y / TILE_HEIGHT / SCALE);
		this.tileX = Math.round(x / TILE_WIDTH / SCALE);
		this.tile = this.scene.tileLayer!.getTileAt(this.tileX, this.tileY);
		this.setScale(SCALE);
		scene.add.existing(this);
		this.playItemAnimation();
	}

	loadIcon() {}
	public update(scene: MainScene) {
		const px = scene.mainCharacter!.x;
		const py = scene.mainCharacter!.y;
		const distance = Math.hypot(this.x - px, this.y - py);
		// if you run over item, put into inventory
		if (distance < MAX_INTERACTION_DISTANCE * SCALE) {
			if (this.itemKey === 'health') {
				const heal = Math.round(worldstate.playerCharacter.maxHealth / HEAL_PERCENTAGE);
				worldstate.playerCharacter.health =
					worldstate.playerCharacter.health + heal > worldstate.playerCharacter.maxHealth
						? worldstate.playerCharacter.maxHealth
						: worldstate.playerCharacter.health + heal;
			} else if (this.isEssence()) {
				worldstate.inventory.essences[this.itemKey as ColorsOfMagic]++;
			} else {
				if (isEquippable(this.itemKey)) {
					const equipmentData = getEquipmentDataForItemKey(this.itemKey as EquipmentKey);
					if (this.level > equipmentData.level) {
						equipmentData.level = this.level;
						equipItemIfNoneEquipped(this.itemKey as EquipmentKey);
					}
					scene.overlayScreens!.inventory.update();
				} else {
					const unequippableItemKey = this.itemKey as UneqippableItem;
					worldstate.inventory.bag[unequippableItemKey] =
						(worldstate.inventory.bag[unequippableItemKey] || 0) + 1;
				}
			}

			this.isDestroyed = true;
			this.destroy(true);
		}
		if (scene?.dynamicLightingHelper && this.tile) {
			this.tint = this.tile?.tint;
		}
	}

	public playItemAnimation() {
		if (this.isEssence()) {
			this.play({ key: 'essence_' + this.itemKey, repeat: -1 });
		}
	}
	public isEssence() {
		if (Object.values(ColorsOfMagic).includes(this.itemKey as ColorsOfMagic)) {
			return true;
		} else return false;
	}
}
