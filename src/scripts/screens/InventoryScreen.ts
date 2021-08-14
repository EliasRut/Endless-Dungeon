import { AbilityKey, BAG_BOXES_X, BAG_BOXES_Y, EquipmentSlot, UiDepths } from '../helpers/constants';
import { AbilityType, Abilities } from '../abilities/abilityData';
import OverlayScreen from './OverlayScreen';
import Item from '../worldstate/Item';
import {
	getEquippedItems,
	getUnequippedItemsWithPositions,
	isEquipped,
	unequipItem,
	equipItem,
	placeItemInNextFreeBagSlot,
	removeItemFromBagById
} from '../helpers/inventory';
import InventoryItemToken from '../drawables/tokens/InventoryItemToken';
import { isEquippable } from '../helpers/inventory';
import EquippableItem from '../worldstate/EquippableItem';
import globalState from '../worldstate';
import MainScene from '../scenes/MainScene';
import { AbilityLinkedItem, CatalystItem } from '../../items/itemData';
import { updateAbility } from '../worldstate/PlayerCharacter';
import { getCatalystAbility } from '../helpers/item';

const INVENTORY_START_X = 500;
const INVENTORY_START_Y = 198;
const INVENTORY_BORDER_OFFSET_X = 53;
const INVENTORY_BORDER_OFFSET_Y = 103;
const INVENTORY_BORDER_X = INVENTORY_START_X - INVENTORY_BORDER_OFFSET_X;
const INVENTORY_BORDER_Y = INVENTORY_START_Y - INVENTORY_BORDER_OFFSET_Y;

const BOX_SIZE = 16;

const BAG_OFFSET_X = 56;
const BAG_OFFSET_Y = -61;
const BAG_START_X = INVENTORY_START_X - BAG_OFFSET_X;
const BAG_START_Y = INVENTORY_START_Y - BAG_OFFSET_Y;

const ABILITY_ICON_SIZE = 34;
// tslint:disable: no-magic-numbers
const ITEM_ABILITY_COORDINATES = {
	[EquipmentSlot.MAIN_HAND]: [INVENTORY_START_X - 56, INVENTORY_START_Y + 1],
	[EquipmentSlot.OFF_HAND]: [INVENTORY_START_X - 22, INVENTORY_START_Y + 25],
	[EquipmentSlot.CHESTPIECE]: [INVENTORY_START_X - 16, INVENTORY_START_Y + 1],
	[EquipmentSlot.NECKLACE]: [INVENTORY_START_X - 0, INVENTORY_START_Y - 15],
	[EquipmentSlot.RIGHT_RING]: [INVENTORY_START_X + 56, INVENTORY_START_Y + 1],
	[EquipmentSlot.LEFT_RING]: [INVENTORY_START_X + 22, INVENTORY_START_Y + 25],
};

const EQUIPMENT_SLOT_COORDINATES = {
	[EquipmentSlot.MAIN_HAND]: [INVENTORY_START_X - 42, INVENTORY_START_Y - 80],
	[EquipmentSlot.OFF_HAND]: [INVENTORY_START_X + 42, INVENTORY_START_Y - 80],
	[EquipmentSlot.CHESTPIECE]: [INVENTORY_START_X + 0, INVENTORY_START_Y - 70],
	[EquipmentSlot.NECKLACE]: [INVENTORY_START_X + 0, INVENTORY_START_Y - 107],
	[EquipmentSlot.RIGHT_RING]: [INVENTORY_START_X + 42.5, INVENTORY_START_Y - 45.5],
	[EquipmentSlot.LEFT_RING]: [INVENTORY_START_X - 41, INVENTORY_START_Y - 45.5]
};

const COORDINATES_TO_SLOT: { [id: string]: EquipmentSlot } = {
	'0_-2': EquipmentSlot.MAIN_HAND,
	'2_-2': EquipmentSlot.OFF_HAND,
	'1_-1': EquipmentSlot.CHESTPIECE,
	'1_-2': EquipmentSlot.NECKLACE,
	'2_-1': EquipmentSlot.RIGHT_RING,
	'0_-1': EquipmentSlot.LEFT_RING
};

const EQUIPMENT_SLOT_TO_ABILITY_KEY = {
	[EquipmentSlot.MAIN_HAND]: AbilityKey.ONE,
	[EquipmentSlot.OFF_HAND]: AbilityKey.TWO,
	[EquipmentSlot.CHESTPIECE]: 5,
	[EquipmentSlot.NECKLACE]: AbilityKey.FIVE,
	[EquipmentSlot.RIGHT_RING]: AbilityKey.FOUR,
	[EquipmentSlot.LEFT_RING]: AbilityKey.THREE,
};
// tslint:enable

export default class InventoryScreen extends OverlayScreen {
	itemTokenMap: { [id: string]: InventoryItemToken } = {};
	abilityIconMap: { [slot: string]: Phaser.GameObjects.Image } = {};
	focusedItem?: Item;
	scene: MainScene;
	keyLastPressed: number = 0;
	keyCD: number = 150;
	currentXY: [number, number];
	inventorySelection: Phaser.GameObjects.Image;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, INVENTORY_BORDER_X, INVENTORY_BORDER_Y, 175, 280);
		this.scene = scene as MainScene;
		const inventoryField = new Phaser.GameObjects.Image(scene, INVENTORY_START_X, INVENTORY_START_Y, 'inventory-borders');
		inventoryField.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		inventoryField.setScrollFactor(0);
		this.add(inventoryField, true);
		// tslint:enable
		this.inventorySelection = new Phaser.GameObjects.Image(scene, BAG_START_X, BAG_START_Y, "inventory-selection");
		this.inventorySelection.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.inventorySelection.setScrollFactor(0);
		this.add(this.inventorySelection, true);

		scene.add.existing(this);
		this.setVisible(false);

		const equippedItems = getEquippedItems();
		Object.keys(equippedItems)
			.filter((slotKey) => !!equippedItems[slotKey as EquipmentSlot])
			.forEach((key) => {
				const slotKey = key as EquipmentSlot;
				const item = equippedItems[slotKey]!;
				const [x, y] = EQUIPMENT_SLOT_COORDINATES[slotKey];
				if (!this.itemTokenMap[item.id]) {
					this.createItemToken(item, x, y);
				}
			});
		this.updateAbilities(true);

		const uneqippedItemList = getUnequippedItemsWithPositions();
		uneqippedItemList.forEach((itemPosition) => {
			const x = BAG_START_X + itemPosition.x * BOX_SIZE;
			const y = BAG_START_Y + itemPosition.y * BOX_SIZE;
			const item = itemPosition.item;
			if (!this.itemTokenMap[item.id]) {
				this.createItemToken(item, x, y);
			}
		});
		this.currentXY = [0, 0];
	}

	createItemToken(item: Item, x: number, y: number) {
		const itemToken = new InventoryItemToken(this.scene, x, y, item.iconFrame);
		this.itemTokenMap[item.id] = itemToken;
		itemToken.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		itemToken.setScrollFactor(0);
		itemToken.setInteractive();
		itemToken.setVisible(false);
		this.add(itemToken, true);
		itemToken.on('pointerdown', () => {
			this.handleInvetoryItemInteraction(item);
		});
	}

	handleInvetoryItemInteraction(item: Item) {
		if (this.focusedItem === item) {
			if (isEquippable(item)) {
				const equippableItem = item as EquippableItem;
				if (isEquipped(equippableItem)) {
					unequipItem(equippableItem);
				} else {
					equipItem(equippableItem);
				}
				this.update();
				this.updateAbilities(false);
			}
		} else {
			this.focusedItem = item;
			this.scene.overlayScreens.itemScreen.update(item);
		}
	}

	//select next item in bag. Handles cd for key press
	interactInventory(direction: string, globalTime: number) {
		if (direction == "nothing") return;
		if (globalTime - this.keyLastPressed > this.keyCD) this.keyLastPressed = globalTime;
		else return;
		if (direction == "enter") {
			if (this.focusedItem != undefined) this.handleInvetoryItemInteraction(this.focusedItem);
			else return;
		}

		let item = this.getNextBagItem(direction);
		if (item == this.focusedItem) return;
		if (item != undefined) this.handleInvetoryItemInteraction(item);
		else {
			this.focusedItem = undefined;
			this.scene.overlayScreens.itemScreen.update(undefined);
		}
	}

	getNextBagItem(direction: string) {
		let x = this.currentXY[0];
		let y = this.currentXY[1];
		if (direction == "up") {
			this.currentXY[1] -= 1
			if (y == 0) {
				this.currentXY[0] = Math.floor(this.currentXY[0] / 3);
			}
		}
		else if (direction == "down") { this.currentXY[1] += 1 }
		else if (direction == "left") { this.currentXY[0] -= 1 }
		else if (direction == "right") { this.currentXY[0] += 1 }
		if (this.checkXBoundary()
			|| this.currentXY[1] > BAG_BOXES_Y - 1 || 0 - 2 > this.currentXY[1]) {
			this.currentXY[0] = x;
			this.currentXY[1] = y;
			return this.focusedItem;
		}
		this.moveSelection(this.currentXY[0], this.currentXY[1]);
		return this.getItemAtXY(this.currentXY[0], this.currentXY[1]);
	}

	// hard coded for inventory highlighting, special cases when 0 > y
	checkXBoundary() {
		if (this.currentXY[1] >= 0) {
			if (this.currentXY[0] > BAG_BOXES_X - 1 || 0 > this.currentXY[0])
				return true;
		}
		else if (this.currentXY[1] >= -2) {
			if (this.currentXY[0] > 2 || 0 > this.currentXY[0])
				return true;
		}
		return false;
	}
	
	getItemAtXY(x: number, y: number) {
		let item = undefined;
		if (y >= 0) {
			const uneqippedItemList = getUnequippedItemsWithPositions();
			uneqippedItemList.forEach((itemPosition) => {
				if (itemPosition.x == x
					&& itemPosition.y == y) {
					item = itemPosition.item;
				}
			});
		} else {
			const equippedItems = getEquippedItems();
			let coordinates = `${x}_${y}`;
			item = equippedItems[COORDINATES_TO_SLOT[coordinates]];
		}
		return item;
	}

	getXYofItem(item: Item) {
		let result = undefined;
		const uneqippedItemList = getUnequippedItemsWithPositions();
		uneqippedItemList.forEach((itemPosition) => {
			if (item == itemPosition.item) {
				result = [itemPosition.x, itemPosition.y]
			}
		});
		return result;
	}

	// move highlighted field
	moveSelection(x: number, y: number) {		
		if (y >= 0) {
			this.inventorySelection.setX(BAG_START_X + (BOX_SIZE * x));
			this.inventorySelection.setY(BAG_START_Y + (BOX_SIZE * y));
		} else {
			let coordinates = `${x}_${y}`;
			this.inventorySelection.setX(EQUIPMENT_SLOT_COORDINATES[COORDINATES_TO_SLOT[coordinates]][0]);
			this.inventorySelection.setY(EQUIPMENT_SLOT_COORDINATES[COORDINATES_TO_SLOT[coordinates]][1]);
		}
	}

	// updates all abilities and icons at once.
	updateAbilities(constructor: boolean) {
		const equippedItems = getEquippedItems();
		Object.keys(equippedItems)
			.forEach((key) => {
				const slotKey = key as EquipmentSlot;
				if (slotKey === EquipmentSlot.CHESTPIECE) return;
				// TODO: NECKLACE
				if (slotKey === EquipmentSlot.NECKLACE) return;

				// Remove ability if no item is equipped in slot
				if (equippedItems[slotKey] === undefined) {
					if (this.abilityIconMap[slotKey]) this.abilityIconMap[slotKey].destroy();
					if (slotKey === EquipmentSlot.MAIN_HAND) {
						updateAbility(this.scene, globalState.playerCharacter, 0, AbilityType.FIREBALL);
						const abilityIcon = this.createAbilityIcon();
						this.handleIconOptions(constructor, abilityIcon, AbilityType.FIREBALL);
						this.abilityIconMap[EquipmentSlot.MAIN_HAND] = abilityIcon;
					}
					else {
						updateAbility(
							this.scene,
							globalState.playerCharacter,
							EQUIPMENT_SLOT_TO_ABILITY_KEY[slotKey],
							AbilityType.NOTHING
						);
					}
					return;
				}
				let ability: AbilityType;
				if (slotKey === EquipmentSlot.OFF_HAND) {
					const catalystItem = equippedItems[slotKey]!.data as CatalystItem;

					const baseAbility = equippedItems.mainhand ?
						(equippedItems.mainhand.data as AbilityLinkedItem).ability :
						AbilityType.FIREBALL;
					ability = getCatalystAbility(baseAbility, catalystItem);
				} else {
					const abilityLinkedItem = equippedItems[slotKey]!.data as AbilityLinkedItem;
					ability = abilityLinkedItem.ability;
				}

				const abilityIcon = this.createAbilityIcon(slotKey, ability);
				if (this.abilityIconMap[slotKey]) this.abilityIconMap[slotKey].destroy();
				this.abilityIconMap[slotKey] = abilityIcon;

				updateAbility(
					this.scene,
					globalState.playerCharacter,
					EQUIPMENT_SLOT_TO_ABILITY_KEY[slotKey],
					ability);
				this.handleIconOptions(constructor, abilityIcon, ability);
			});
	}

	createAbilityIcon(
		slotKey: EquipmentSlot = EquipmentSlot.MAIN_HAND,
		ability: AbilityType = AbilityType.FIREBALL
	) {
		const [iconX, iconY] = ITEM_ABILITY_COORDINATES[slotKey];
		const abilityIcon = new Phaser.GameObjects.Image(
			this.scene,
			iconX,
			iconY,
			Abilities[ability].icon![0], Abilities[ability].icon![1]);
		abilityIcon.displayWidth = ABILITY_ICON_SIZE;
		abilityIcon.displayHeight = ABILITY_ICON_SIZE;
		abilityIcon.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		abilityIcon.setScrollFactor(0);
		abilityIcon.setInteractive();
		this.add(abilityIcon, true);
		return abilityIcon;
	}
	handleIconOptions(
		constructor: boolean,
		abilityIcon: Phaser.GameObjects.Image,
		ability: AbilityType
	) {
		if (constructor) abilityIcon.setVisible(false);
		else abilityIcon.setVisible(true);

		abilityIcon.on('pointerdown', () => {
			if (this.focusedItem !== undefined) this.focusedItem = undefined;
			this.scene.overlayScreens.itemScreen.updateAbility(ability);
		});
	}
	addToInventory(item: Item) {
		const [x, y] = placeItemInNextFreeBagSlot(item);
		if (x >= 0) this.createItemToken(
			item,
			BAG_START_X + x * BOX_SIZE,
			BAG_START_Y + y * BOX_SIZE);
		else return false;
		return true;
	}

	// We currently ignore amount.
	removeFromInventory(itemId: string, amount: number) {
		removeItemFromBagById(itemId);
		this.itemTokenMap[itemId].destroy(true);
	}

	update() {
		const equippedItems = getEquippedItems();
		Object.keys(equippedItems)
			.filter((slotKey) => !!equippedItems[slotKey as EquipmentSlot])
			.forEach((key) => {
				const slotKey = key as EquipmentSlot;
				const item = equippedItems[slotKey]!;
				const [x, y] = EQUIPMENT_SLOT_COORDINATES[slotKey];
				this.itemTokenMap[item.id].x = x;
				this.itemTokenMap[item.id].y = y;
			});

		const uneqippedItemList = getUnequippedItemsWithPositions();
		uneqippedItemList.forEach((itemPosition) => {
			const x = BAG_START_X + itemPosition.x * BOX_SIZE;
			const y = BAG_START_Y + itemPosition.y * BOX_SIZE;
			const item = itemPosition.item;
			this.itemTokenMap[item.id].x = x;
			this.itemTokenMap[item.id].y = y;
		});
	}
}
