import { AbilityKey, BAG_BOXES_X, EquipmentSlot, UiDepths, UI_SCALE } from '../helpers/constants';
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
	getItemTexture,
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
import { STAT_SCREEN_RIGHT_BORDER } from './StatScreen';
import { MENU_ICON_LEFT_BORDER } from '../drawables/ui/MenuIcon';

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;

const AVAILABLE_WINDOW_WIDTH =
	SCALED_WINDOW_WIDTH - STAT_SCREEN_RIGHT_BORDER - MENU_ICON_LEFT_BORDER;

const SCREEN_WIDTH = 200;
const SCREEN_HEIGHT = 280;

const ABILITY_BACKGROUND_START = 150;

const INVENTORY_START_X = STAT_SCREEN_RIGHT_BORDER + AVAILABLE_WINDOW_WIDTH / 2 + 10;

const INVENTORY_START_Y = 24;

const ABILITY_ICON_SIZE = 34;
// tslint:disable: no-magic-numbers
const ITEM_ABILITY_COORDINATES = {
	[EquipmentSlot.CHESTPIECE]: [-1, -1],
	[EquipmentSlot.AMULET]: [
		INVENTORY_START_X + 16,
		INVENTORY_START_Y + ABILITY_BACKGROUND_START + 4,
	],
	[EquipmentSlot.SOURCE]: [
		INVENTORY_START_X + 16,
		INVENTORY_START_Y + ABILITY_BACKGROUND_START + 4,
	],
	[EquipmentSlot.CATALYST]: [
		INVENTORY_START_X + 16,
		INVENTORY_START_Y + ABILITY_BACKGROUND_START + 32,
	],
	[EquipmentSlot.RIGHT_RING]: [
		INVENTORY_START_X + 16,
		INVENTORY_START_Y + ABILITY_BACKGROUND_START + 60,
	],
	[EquipmentSlot.LEFT_RING]: [
		INVENTORY_START_X + 16,
		INVENTORY_START_Y + ABILITY_BACKGROUND_START + 88,
	],
};

const EQUIPMENT_SLOT_COORDINATES = {
	[EquipmentSlot.SOURCE]: [INVENTORY_START_X + 48, INVENTORY_START_Y + 54],
	[EquipmentSlot.CATALYST]: [INVENTORY_START_X + 144, INVENTORY_START_Y + 54],
	[EquipmentSlot.CHESTPIECE]: [INVENTORY_START_X + 95, INVENTORY_START_Y + 74],
	[EquipmentSlot.AMULET]: [INVENTORY_START_X + 96, INVENTORY_START_Y + 30],
	[EquipmentSlot.RIGHT_RING]: [INVENTORY_START_X + 49, INVENTORY_START_Y + 100],
	[EquipmentSlot.LEFT_RING]: [INVENTORY_START_X + 144, INVENTORY_START_Y + 100],
};

const COORDINATES_TO_SLOT: { [id: string]: EquipmentSlot } = {
	'0_0': EquipmentSlot.SOURCE,
	'1_0': EquipmentSlot.AMULET,
	'2_0': EquipmentSlot.CATALYST,
	'0_1': EquipmentSlot.RIGHT_RING,
	'1_1': EquipmentSlot.CHESTPIECE,
	'2_1': EquipmentSlot.LEFT_RING,
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
	abilityTextMap: { [slot: string]: Phaser.GameObjects.Text } = {};
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
		super(
			scene,
			INVENTORY_START_X * UI_SCALE,
			INVENTORY_START_Y * UI_SCALE,
			SCREEN_WIDTH * UI_SCALE,
			SCREEN_HEIGHT * UI_SCALE
		);
		this.scene = scene as MainScene;
		this.focusedSlot = EquipmentSlot.SOURCE;
		const inventoryField = new Phaser.GameObjects.Image(
			scene,
			(INVENTORY_START_X + 14) * UI_SCALE,
			(INVENTORY_START_Y + 6) * UI_SCALE,
			'inventory-borders'
		);
		inventoryField.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		inventoryField.setScrollFactor(0);
		inventoryField.setOrigin(0);
		inventoryField.setScale(UI_SCALE);
		this.add(inventoryField, true);

		const equipmentText = new Phaser.GameObjects.Image(
			scene,
			(INVENTORY_START_X + 14) * UI_SCALE,
			(INVENTORY_START_Y - 1) * UI_SCALE,
			'gui-text-equipment'
		);
		equipmentText.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		equipmentText.setScrollFactor(0);
		equipmentText.setOrigin(0);
		equipmentText.setScale(UI_SCALE);
		this.add(equipmentText, true);

		// tslint:enable
		this.inventorySelection = new Phaser.GameObjects.Image(
			scene,
			EQUIPMENT_SLOT_COORDINATES.source[0] * UI_SCALE,
			EQUIPMENT_SLOT_COORDINATES.source[1] * UI_SCALE,
			'inventory-selection'
		);
		this.inventorySelection.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.inventorySelection.setScrollFactor(0);
		this.inventorySelection.setScale(UI_SCALE);
		this.add(this.inventorySelection, true);

		const abilityIconBackgrounds = [
			new Phaser.GameObjects.Image(
				scene,
				(INVENTORY_START_X + 12) * UI_SCALE,
				(INVENTORY_START_Y + ABILITY_BACKGROUND_START - 28) * UI_SCALE,
				'ability-background-p'
			),
			new Phaser.GameObjects.Image(
				scene,
				(INVENTORY_START_X + 12) * UI_SCALE,
				(INVENTORY_START_Y + ABILITY_BACKGROUND_START) * UI_SCALE,
				'ability-background-1'
			),
			new Phaser.GameObjects.Image(
				scene,
				(INVENTORY_START_X + 12) * UI_SCALE,
				(INVENTORY_START_Y + ABILITY_BACKGROUND_START + 28) * UI_SCALE,
				'ability-background-2'
			),
			new Phaser.GameObjects.Image(
				scene,
				(INVENTORY_START_X + 12) * UI_SCALE,
				(INVENTORY_START_Y + ABILITY_BACKGROUND_START + 56) * UI_SCALE,
				'ability-background-3'
			),
			new Phaser.GameObjects.Image(
				scene,
				(INVENTORY_START_X + 12) * UI_SCALE,
				(INVENTORY_START_Y + ABILITY_BACKGROUND_START + 84) * UI_SCALE,
				'ability-background-4'
			),
		];
		abilityIconBackgrounds.forEach((iconBackground) => {
			this.add(iconBackground, true);
			iconBackground.setOrigin(0);
			iconBackground.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			iconBackground.setScrollFactor(0);
			iconBackground.setScale(UI_SCALE);
			scene.add.existing(iconBackground);
		});

		scene.add.existing(this);
		this.setVisible(false);

		Object.entries(EQUIPMENT_SLOT_COORDINATES).forEach(([slotName, [x, y]]) => {
			this.equipmentSlotTokenMap[slotName as EquipmentSlot] = this.createItemToken(
				slotName as EquipmentSlot,
				x * UI_SCALE,
				y * UI_SCALE
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
		const itemToken = new InventoryItemToken(
			this.scene,
			x * UI_SCALE,
			y * UI_SCALE,
			itemData?.iconFrame || -1
		);

		itemToken.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		itemToken.setScrollFactor(0);
		itemToken.setInteractive();
		itemToken.setVisible(this.visiblity);
		this.playItemAnimation(itemToken, itemName);
		itemToken.setScale(UI_SCALE);
		this.add(itemToken, true);
		itemToken.on('pointerdown', () => {
			this.handleEquipmentSlotInteraction(slotName);
		});
		return itemToken;
	}

	playItemAnimation( itemToken: InventoryItemToken, itemName?: string) {
		const animation = itemName + '1';
		if (this.scene.game.anims.exists(animation))
			itemToken.play({ key: animation, repeat : -1});

		// if('test-items-spritesheet' !== getItemTexture(itemName)){
		// 	itemToken.play({ key: getItemTexture(itemName), repeat : -1});
		// }
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
				this.equipmentSelectionWheel.closeSelection();
			} else {
				this.showEquipmentSelectionWheel();
			}
		} else {
			this.focusedSlot = slotName;
			const [itemData, equipmentData] = getFullDataForEquipmentSlot(slotName);
			this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
			const [x, y] = EQUIPMENT_SLOT_COORDINATES[slotName];
			this.inventorySelection.setX(x * UI_SCALE);
			this.inventorySelection.setY(y * UI_SCALE);
		}
	}

	// select next item in bag. Handles cd for key press
	interactInventory(directions: string[], globalTime: number) {
		if (directions.includes('nothing')) return;

		if (this.equipmentSelectionWheel.visiblity) {
			if (directions.includes('enter')) {
				this.equipmentSelectionWheel.executeSelection();
				return;
			}
			const yAxis = directions.includes('up') ? -1 : directions.includes('down') ? 1 : 0;
			const xAxis = directions.includes('left') ? -1 : directions.includes('right') ? 1 : 0;
			this.equipmentSelectionWheel.updateSelection(xAxis, yAxis);
			return;
		}

		if (globalTime - this.keyLastPressed > this.keyCD) this.keyLastPressed = globalTime;
		else return;
		if (directions.includes('enter') && this.focusedSlot) {
			if (this.equipmentSelectionWheel.visiblity) {
			} else {
				this.showEquipmentSelectionWheel();
			}
			return;
		}

		const x = this.currentXY[0];
		const y = this.currentXY[1];
		if (directions.includes('up')) {
			this.currentXY[1] = y === 0 ? 1 : 0;
		} else if (directions.includes('down')) {
			this.currentXY[1] = y === 1 ? 0 : 1;
		}
		if (directions.includes('left')) {
			this.currentXY[0] = x === 0 ? 2 : x - 1;
		} else if (directions.includes('right')) {
			this.currentXY[0] = x === 2 ? 0 : x + 1;
		}
		this.focusedSlot = COORDINATES_TO_SLOT[`${this.currentXY[0]}_${this.currentXY[1]}`];
		const [itemData, equipmentData] = getFullDataForEquipmentSlot(this.focusedSlot);
		this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
		const selectionPos = EQUIPMENT_SLOT_COORDINATES[this.focusedSlot];

		this.inventorySelection.setX(selectionPos[0] * UI_SCALE);
		this.inventorySelection.setY(selectionPos[1] * UI_SCALE);
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
				if (this.abilityTextMap[slotKey]) this.abilityTextMap[slotKey].destroy();
				if (slotKey === EquipmentSlot.SOURCE) {
					updateAbility(this.scene, globalState.playerCharacter, 0, AbilityType.FIREBALL);
					const newAbilityIcon = this.createAbilityIcon();
					this.handleIconOptions(constructor, newAbilityIcon, AbilityType.FIREBALL);
					this.abilityIconMap[EquipmentSlot.SOURCE] = newAbilityIcon;
					const newAbilityText = this.createAbilityText();
					this.abilityTextMap[slotKey] = newAbilityText;
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

			const abilityText = this.createAbilityText(slotKey, ability);
			if (this.abilityTextMap[slotKey]) this.abilityTextMap[slotKey].destroy();
			this.abilityTextMap[slotKey] = abilityText;

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
			iconX * UI_SCALE,
			iconY * UI_SCALE,
			Abilities[ability].icon![0],
			Abilities[ability].icon![1]
		);
		abilityIcon.displayWidth = ABILITY_ICON_SIZE;
		abilityIcon.displayHeight = ABILITY_ICON_SIZE;
		abilityIcon.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		abilityIcon.setScrollFactor(0);
		abilityIcon.setScale(UI_SCALE);
		abilityIcon.setInteractive();
		abilityIcon.setVisible(this.visiblity);
		abilityIcon.setOrigin(0);
		this.add(abilityIcon, true);
		return abilityIcon;
	}

	createAbilityText(
		slotKey: EquipmentSlot = EquipmentSlot.SOURCE,
		ability: AbilityType = AbilityType.FIREBALL
	) {
		const [iconX, iconY] = ITEM_ABILITY_COORDINATES[slotKey];
		const abilityText = new Phaser.GameObjects.Text(
			this.scene,
			(iconX + 28) * UI_SCALE,
			(iconY - 3) * UI_SCALE,
			Abilities[ability].abilityName,
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		abilityText.setOrigin(0);
		abilityText.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		abilityText.setScrollFactor(0);
		abilityText.setShadow(0, 1 * UI_SCALE, 'black');
		abilityText.setVisible(this.visiblity);
		this.add(abilityText, true);
		return abilityText;
	}

	handleIconOptions(
		constructor: boolean,
		abilityIcon: Phaser.GameObjects.Image,
		ability: AbilityType
	) {
		abilityIcon.setVisible(this.visiblity);

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
