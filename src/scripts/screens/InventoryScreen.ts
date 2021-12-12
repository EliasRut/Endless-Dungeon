import { AbilityKey, BAG_BOXES_X, EquipmentSlot, UiDepths } from '../helpers/constants';
import { AbilityType, Abilities } from '../abilities/abilityData';
import OverlayScreen from './OverlayScreen';
import InventoryItemToken from '../drawables/tokens/InventoryItemToken';
import globalState from '../worldstate';
import MainScene from '../scenes/MainScene';
import {
	AbilityLinkedItem,
	getItemDataForName,
	SourceData,
	CatalystData,
} from '../../items/itemData';
import { updateAbility } from '../worldstate/PlayerCharacter';
import { getCatalystAbility } from '../helpers/item';
import EquipmentSelectionWheel from '../drawables/ui/EquipmentSelectionWheel';
import {
	getEquippedItems,
	getItemKeyForEquipmentSlot,
	getItemDataForEquipmentSlot,
	getFullDataForEquipmentSlot,
	getEquipmentDataRecordForEquipmentSlot,
} from '../helpers/inventory';

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
	[EquipmentSlot.SOURCE]: [INVENTORY_START_X - 56, INVENTORY_START_Y + 1],
	[EquipmentSlot.CATALYST]: [INVENTORY_START_X - 22, INVENTORY_START_Y + 25],
	[EquipmentSlot.CHESTPIECE]: [INVENTORY_START_X - 16, INVENTORY_START_Y + 1],
	[EquipmentSlot.AMULET]: [INVENTORY_START_X - 0, INVENTORY_START_Y - 15],
	[EquipmentSlot.RIGHT_RING]: [INVENTORY_START_X + 56, INVENTORY_START_Y + 1],
	[EquipmentSlot.LEFT_RING]: [INVENTORY_START_X + 22, INVENTORY_START_Y + 25],
};

const EQUIPMENT_SLOT_COORDINATES = {
	[EquipmentSlot.SOURCE]: [INVENTORY_START_X - 42, INVENTORY_START_Y - 80],
	[EquipmentSlot.CATALYST]: [INVENTORY_START_X + 42, INVENTORY_START_Y - 80],
	[EquipmentSlot.CHESTPIECE]: [INVENTORY_START_X + 0, INVENTORY_START_Y - 70],
	[EquipmentSlot.AMULET]: [INVENTORY_START_X + 0, INVENTORY_START_Y - 107],
	[EquipmentSlot.RIGHT_RING]: [INVENTORY_START_X + 42.5, INVENTORY_START_Y - 45.5],
	[EquipmentSlot.LEFT_RING]: [INVENTORY_START_X - 41, INVENTORY_START_Y - 45.5],
};

const COORDINATES_TO_SLOT: { [id: string]: EquipmentSlot } = {
	'0_0': EquipmentSlot.SOURCE,
	'1_0': EquipmentSlot.AMULET,
	'2_0': EquipmentSlot.CATALYST,
	'0_1': EquipmentSlot.LEFT_RING,
	'1_1': EquipmentSlot.CHESTPIECE,
	'2_1': EquipmentSlot.RIGHT_RING,
};

const EQUIPMENT_SLOT_TO_ABILITY_KEY = {
	[EquipmentSlot.SOURCE]: AbilityKey.ONE,
	[EquipmentSlot.CATALYST]: AbilityKey.TWO,
	[EquipmentSlot.CHESTPIECE]: 5,
	[EquipmentSlot.AMULET]: AbilityKey.FIVE,
	[EquipmentSlot.RIGHT_RING]: AbilityKey.FOUR,
	[EquipmentSlot.LEFT_RING]: AbilityKey.THREE,
};
// tslint:enable

export default class InventoryScreen extends OverlayScreen {
	equipmentSlotTokenMap: Partial<Record<EquipmentSlot, InventoryItemToken>> = {};
	abilityIconMap: { [slot: string]: Phaser.GameObjects.Image } = {};
	focusedSlot?: EquipmentSlot;
	scene: MainScene;
	keyLastPressed: number = 0;
	keyCD: number = 150;
	currentXY: [number, number];
	inventorySelection: Phaser.GameObjects.Image;
	equipmentSelectionWheel: EquipmentSelectionWheel;
	isEquipmentSelectionWheelShown: boolean;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, INVENTORY_BORDER_X, INVENTORY_BORDER_Y, 175, 280);
		this.scene = scene as MainScene;
		this.focusedSlot = EquipmentSlot.SOURCE;
		const inventoryField = new Phaser.GameObjects.Image(
			scene,
			INVENTORY_START_X,
			INVENTORY_START_Y,
			'inventory-borders'
		);
		inventoryField.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		inventoryField.setScrollFactor(0);
		this.add(inventoryField, true);
		// tslint:enable
		this.inventorySelection = new Phaser.GameObjects.Image(
			scene,
			EQUIPMENT_SLOT_COORDINATES.source[0],
			EQUIPMENT_SLOT_COORDINATES.source[1],
			'inventory-selection'
		);
		this.inventorySelection.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.inventorySelection.setScrollFactor(0);
		this.add(this.inventorySelection, true);

		scene.add.existing(this);
		this.setVisible(false);

		Object.entries(EQUIPMENT_SLOT_COORDINATES).forEach(([slotName, [x, y]]) => {
			this.equipmentSlotTokenMap[slotName as EquipmentSlot] = this.createItemToken(
				slotName as EquipmentSlot,
				x,
				y
			);
		});

		this.equipmentSelectionWheel = new EquipmentSelectionWheel(scene);
		this.equipmentSelectionWheel.toggleVisibility();

		this.updateAbilities(true);

		this.currentXY = [0, 0];
	}

	createItemToken(slotName: EquipmentSlot, x: number, y: number) {
		const itemName = getItemKeyForEquipmentSlot(slotName);
		const itemData = itemName ? getItemDataForName(itemName) : undefined;
		const itemToken = new InventoryItemToken(this.scene, x, y, itemData?.iconFrame || -1);

		itemToken.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		itemToken.setScrollFactor(0);
		itemToken.setInteractive();
		itemToken.setVisible(this.visiblity);
		this.add(itemToken, true);
		itemToken.on('pointerdown', () => {
			this.handleEquipmentSlotInteraction(slotName);
		});
		return itemToken;
	}

	showEquipmentSelectionWheel() {
		if (!this.focusedSlot) {
			return;
		}
		const [centerX, centerY] = EQUIPMENT_SLOT_COORDINATES[this.focusedSlot];
		this.equipmentSelectionWheel.toggleVisibility();
		this.equipmentSelectionWheel.update(
			centerX,
			centerY,
			this.focusedSlot,
			getEquipmentDataRecordForEquipmentSlot(this.focusedSlot)
		);
	}

	handleEquipmentSlotInteraction(slotName: EquipmentSlot) {
		if (this.focusedSlot === slotName) {
			if (this.equipmentSelectionWheel.visiblity) {
				this.equipmentSelectionWheel.toggleVisibility();
			} else {
				this.showEquipmentSelectionWheel();
			}
		} else {
			this.focusedSlot = slotName;
			const [itemData, equipmentData] = getFullDataForEquipmentSlot(slotName);
			this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
			const [x, y] = EQUIPMENT_SLOT_COORDINATES[slotName];
			this.inventorySelection.setX(x);
			this.inventorySelection.setY(y);
		}
	}

	// select next item in bag. Handles cd for key press
	interactInventory(direction: string, globalTime: number) {
		if (direction === 'nothing') return;
		if (globalTime - this.keyLastPressed > this.keyCD) this.keyLastPressed = globalTime;
		else return;
		if (direction === 'enter' && this.focusedSlot) {
			if (this.equipmentSelectionWheel.visiblity) {
				this.equipmentSelectionWheel.toggleVisibility();
			} else {
				this.showEquipmentSelectionWheel();
			}
			return;
		}

		const x = this.currentXY[0];
		const y = this.currentXY[1];
		if (direction === 'up') {
			this.currentXY[1] = y === 0 ? 1 : 0;
		} else if (direction === 'down') {
			this.currentXY[1] = y === 1 ? 0 : 1;
		} else if (direction === 'left') {
			this.currentXY[0] = x === 0 ? 2 : x - 1;
		} else if (direction === 'right') {
			this.currentXY[0] = x === 2 ? 0 : x + 1;
		}
		this.focusedSlot = COORDINATES_TO_SLOT[`${this.currentXY[0]}_${this.currentXY[1]}`];
		const [itemData, equipmentData] = getFullDataForEquipmentSlot(this.focusedSlot);
		this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
		const selectionPos = EQUIPMENT_SLOT_COORDINATES[this.focusedSlot];

		this.inventorySelection.setX(selectionPos[0]);
		this.inventorySelection.setY(selectionPos[1]);
	}

	// hard coded for inventory highlighting, special cases when 0 > y
	checkXBoundary() {
		if (this.currentXY[1] >= 0) {
			if (this.currentXY[0] > BAG_BOXES_X - 1 || 0 > this.currentXY[0]) return true;
		} else if (this.currentXY[1] >= -2) {
			if (this.currentXY[0] > 2 || 0 > this.currentXY[0]) return true;
		}
		return false;
	}

	// updates all abilities and icons at once.
	updateAbilities(constructor: boolean) {
		const equippedItems = getEquippedItems();
		Object.keys(equippedItems).forEach((key) => {
			const slotKey = key as EquipmentSlot;
			if (slotKey === EquipmentSlot.CHESTPIECE) return;
			// TODO: NECKLACE
			if (slotKey === EquipmentSlot.AMULET) return;

			// Remove ability if no item is equipped in slot
			if (equippedItems[slotKey] === undefined) {
				if (this.abilityIconMap[slotKey]) this.abilityIconMap[slotKey].destroy();
				if (slotKey === EquipmentSlot.SOURCE) {
					updateAbility(this.scene, globalState.playerCharacter, 0, AbilityType.FIREBALL);
					const newAbilityIcon = this.createAbilityIcon();
					this.handleIconOptions(constructor, newAbilityIcon, AbilityType.FIREBALL);
					this.abilityIconMap[EquipmentSlot.SOURCE] = newAbilityIcon;
				} else {
					updateAbility(
						this.scene,
						globalState.playerCharacter,
						EQUIPMENT_SLOT_TO_ABILITY_KEY[slotKey],
						AbilityType.NOTHING
					);
				}
				return;
			}
			let ability: AbilityType | undefined;
			if (slotKey === EquipmentSlot.CATALYST) {
				const sourceType = globalState.inventory.equippedSource;
				const catalystType = globalState.inventory.equippedCatalyst;

				const sourceAbility = sourceType ? SourceData[sourceType].ability : AbilityType.FIREBALL;
				const catalystData = catalystType ? CatalystData[catalystType] : undefined;
				ability = catalystData ? getCatalystAbility(sourceAbility, catalystData) : undefined;
			} else {
				const abilityLinkedItem = getItemDataForEquipmentSlot(slotKey) as
					| AbilityLinkedItem
					| undefined;
				ability = abilityLinkedItem?.ability;
			}

			if (!ability) {
				return;
			}
			const abilityIcon = this.createAbilityIcon(slotKey, ability);
			if (this.abilityIconMap[slotKey]) this.abilityIconMap[slotKey].destroy();
			this.abilityIconMap[slotKey] = abilityIcon;

			updateAbility(
				this.scene,
				globalState.playerCharacter,
				EQUIPMENT_SLOT_TO_ABILITY_KEY[slotKey],
				ability
			);
			this.handleIconOptions(constructor, abilityIcon, ability);
		});
	}

	createAbilityIcon(
		slotKey: EquipmentSlot = EquipmentSlot.SOURCE,
		ability: AbilityType = AbilityType.FIREBALL
	) {
		const [iconX, iconY] = ITEM_ABILITY_COORDINATES[slotKey];
		const abilityIcon = new Phaser.GameObjects.Image(
			this.scene,
			iconX,
			iconY,
			Abilities[ability].icon![0],
			Abilities[ability].icon![1]
		);
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
			if (this.focusedSlot !== undefined) this.focusedSlot = undefined;
			this.scene.overlayScreens.itemScreen.updateAbility(ability);
		});
	}

	update() {
		Object.entries(EQUIPMENT_SLOT_COORDINATES).forEach(([slotName, [x, y]]) => {
			this.equipmentSlotTokenMap[slotName as EquipmentSlot]?.destroy(true);
			this.equipmentSlotTokenMap[slotName as EquipmentSlot] = this.createItemToken(
				slotName as EquipmentSlot,
				x,
				y
			);
		});

		this.updateAbilities(false);
		const [itemData, equipmentData] = this.focusedSlot
			? getFullDataForEquipmentSlot(this.focusedSlot)
			: [undefined, undefined];
		this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
	}
}
