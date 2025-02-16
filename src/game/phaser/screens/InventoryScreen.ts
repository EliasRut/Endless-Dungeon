import {
	AbilityKey,
	BAG_BOXES_X,
	EquipmentSlot,
	UiDepths,
	UI_SCALE,
	NORMAL_ANIMATION_FRAME_RATE,
} from '../helpers/constants';
import OverlayScreen from './OverlayScreen';
import InventoryItemToken from '../drawables/tokens/InventoryItemToken';
import worldstate from '../worldState';
import MainScene from '../scenes/MainScene';
import {
	getItemDataForName,
	SourceData,
	CatalystData,
	getCatalystAbility,
} from '../../../data/itemData';
import { updateAbility } from '../../../types/PlayerCharacter';
import EquipmentSelectionWheel from '../drawables/ui/EquipmentSelectionWheel';
import {
	getEquippedItems,
	getItemKeyForEquipmentSlot,
	getItemDataForEquipmentSlot,
	getFullDataForEquipmentSlot,
	getEquipmentDataRecordForEquipmentSlot,
	getEquipmentDataForItemKey,
	getEquipmentDataForSlot,
} from '../helpers/inventory';
import { STAT_SCREEN_RIGHT_BORDER } from './StatScreen';
import { MENU_ICON_LEFT_BORDER } from '../drawables/ui/MenuIcon';
import { Enchantment, EnchantmentName } from '../../../data/enchantmentData';
import { AbilityType } from '../../../types/AbilityType';
import { AbilityLinkedItem } from '../../../types/Item';
import { Abilities } from '../helpers/abilities';
import { getRelevantAbilityVersion } from '../helpers/getRelevantAbilityVersion';

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

const EQUIPMENT_SLOT_SCALES = {
	[EquipmentSlot.SOURCE]: [2, 3],
	[EquipmentSlot.CATALYST]: [2, 3],
	[EquipmentSlot.CHESTPIECE]: [2, 3],
	[EquipmentSlot.AMULET]: [1, 1],
	[EquipmentSlot.RIGHT_RING]: [1, 1],
	[EquipmentSlot.LEFT_RING]: [1, 1],
};

const EQUIPMENT_SLOT_SPRITESHEETS = {
	[EquipmentSlot.SOURCE]: 'empty-tile-large-portrait',
	[EquipmentSlot.CATALYST]: 'catalyst-spritesheet',
	[EquipmentSlot.CHESTPIECE]: 'armor-spritesheet',
	[EquipmentSlot.AMULET]: 'test-items-spritesheet',
	[EquipmentSlot.RIGHT_RING]: 'test-items-spritesheet',
	[EquipmentSlot.LEFT_RING]: 'test-items-spritesheet',
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
	keyCD: number = 250;
	currentXY: [number, number];
	inventorySelection: Phaser.GameObjects.Image;
	equipmentSelectionWheel: EquipmentSelectionWheel;
	isEquipmentSelectionWheelShown: boolean = false;
	currentEnchantment?: EnchantmentName;

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

		this.applyEquipped();

		this.currentXY = [0, 0];
	}

	createItemToken(slotName: EquipmentSlot, x: number, y: number) {
		const itemName = getItemKeyForEquipmentSlot(slotName);
		const itemData = itemName ? getItemDataForName(itemName) : undefined;

		const itemToken = new InventoryItemToken(
			this.scene,
			x * UI_SCALE,
			y * UI_SCALE,
			EQUIPMENT_SLOT_SPRITESHEETS[slotName] || 'empty-tile',
			itemData?.iconFrame || -1
		);

		itemToken.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		itemToken.setScrollFactor(0);
		itemToken.setInteractive();
		itemToken.setVisible(this.visibility);
		this.playItemAnimation(itemToken, itemName);
		itemToken.setScale(UI_SCALE);
		this.add(itemToken, true);
		itemToken.on('pointerdown', () => {
			this.interactInventory(['enter', 'mouse'], worldstate.gameTime);
		});
		itemToken.on('pointerover', () => {
			if (!this.equipmentSelectionWheel.visibility) {
				Object.entries(COORDINATES_TO_SLOT).forEach((pair) => {
					if (pair[1] == slotName) {
						const [x, y] = pair[0].split('_');
						this.currentXY[0] = Number(x);
						this.currentXY[1] = Number(y);
					}
				});
				this.interactInventory(['mouse'], worldstate.gameTime);
			}
		});
		return itemToken;
	}

	playItemAnimation(itemToken: InventoryItemToken, itemName?: string) {
		const animation = itemName + '1';
		if (this.scene.game.anims.exists(animation)) {
			itemToken.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE, repeat: -1 });
		}
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

	// select next item in bag. Handles cd for key press
	interactInventory(directions: string[], globalTime: number) {
		if (directions.includes('nothing')) return;

		if (this.equipmentSelectionWheel.visibility) {
			if (directions.includes('enter')) {
				this.equipmentSelectionWheel.executeSelection(this.currentEnchantment); // <= place enchantment as arg here
				return;
			}
			const yAxis = directions.includes('up') ? -1 : directions.includes('down') ? 1 : 0;
			const xAxis = directions.includes('left') ? -1 : directions.includes('right') ? 1 : 0;
			this.equipmentSelectionWheel.updateSelection(xAxis, yAxis);
			return;
		}

		if (globalTime - this.keyLastPressed > this.keyCD) this.keyLastPressed = globalTime;
		else if (!directions.includes('mouse')) return;
		if (directions.includes('enter') && this.focusedSlot) {
			if (this.equipmentSelectionWheel.visibility) {
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
		this.scene.overlayScreens!.itemScreen.update(itemData, equipmentData);
		const selectionPos = EQUIPMENT_SLOT_COORDINATES[this.focusedSlot];

		this.inventorySelection.setX(selectionPos[0] * UI_SCALE);
		this.inventorySelection.setY(selectionPos[1] * UI_SCALE);
		this.inventorySelection.setScale(
			EQUIPMENT_SLOT_SCALES[this.focusedSlot][0] * UI_SCALE,
			EQUIPMENT_SLOT_SCALES[this.focusedSlot][1] * UI_SCALE
		);
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

	// Cycles through all equipped items. Updates all abilities, icons and stats at once.
	applyEquipped() {
		this.applyEnchantment();
		const equippedItems = getEquippedItems();
		Object.keys(equippedItems).forEach((key) => {
			const slotKey = key as EquipmentSlot;
			const stats = getEquipmentDataForItemKey(equippedItems[slotKey]!);
			this.applyEnchantment(stats.enchantment);
			if (slotKey === EquipmentSlot.CHESTPIECE) return;
			// TODO: NECKLACE
			if (slotKey === EquipmentSlot.AMULET) return;

			// Remove ability if no item is equipped in slot
			if (equippedItems[slotKey] === undefined) {
				if (this.abilityIconMap[slotKey]) this.abilityIconMap[slotKey].destroy();
				if (this.abilityTextMap[slotKey]) this.abilityTextMap[slotKey].destroy();
				if (slotKey === EquipmentSlot.SOURCE) {
					updateAbility(this.scene, worldstate.playerCharacter, 0, AbilityType.FIREBALL);
					const newAbilityIcon = this.createAbilityIcon();
					this.handleIconOptions(newAbilityIcon, AbilityType.FIREBALL, slotKey);
					this.abilityIconMap[EquipmentSlot.SOURCE] = newAbilityIcon;
					const newAbilityText = this.createAbilityText();
					this.abilityTextMap[slotKey] = newAbilityText;
				} else {
					updateAbility(
						this.scene,
						worldstate.playerCharacter,
						EQUIPMENT_SLOT_TO_ABILITY_KEY[slotKey],
						AbilityType.NOTHING
					);
				}
				return;
			}
			let ability: AbilityType | undefined;
			if (slotKey === EquipmentSlot.CATALYST) {
				const sourceType = worldstate.inventory.equippedSource;
				const catalystType = worldstate.inventory.equippedCatalyst;

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
				worldstate.playerCharacter,
				EQUIPMENT_SLOT_TO_ABILITY_KEY[slotKey],
				ability
			);
			this.handleIconOptions(abilityIcon, ability, slotKey);
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
		abilityIcon.setVisible(this.visibility);
		abilityIcon.setOrigin(0);
		this.add(abilityIcon, true);
		return abilityIcon;
	}

	createAbilityText(
		slotKey: EquipmentSlot = EquipmentSlot.SOURCE,
		ability: AbilityType = AbilityType.FIREBALL
	) {
		const [iconX, iconY] = ITEM_ABILITY_COORDINATES[slotKey];
		const itemLevel = getEquipmentDataForSlot(slotKey)?.level ?? 0;
		const relevantAbility = getRelevantAbilityVersion(ability, itemLevel, 1);
		const abilityText = new Phaser.GameObjects.Text(
			this.scene,
			(iconX + 28) * UI_SCALE,
			(iconY - 3) * UI_SCALE,
			relevantAbility.abilityName,
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
		abilityText.setVisible(this.visibility);
		this.add(abilityText, true);
		return abilityText;
	}

	handleIconOptions(
		abilityIcon: Phaser.GameObjects.Image,
		ability: AbilityType,
		slotKey: EquipmentSlot
	) {
		abilityIcon.setVisible(this.visibility);

		abilityIcon.on('pointerdown', () => {
			if (this.focusedSlot !== undefined) this.focusedSlot = undefined;
			this.scene.overlayScreens!.itemScreen.updateAbility(ability, slotKey);
		});
	}

	// enchantment = undefined => erase all enchantment modifiers.
	applyEnchantment(enchantment?: EnchantmentName) {
		let enchantmentModifiers = worldstate.playerCharacter.enchantmentModifiers;
		if (enchantment === undefined) {
			Object.entries(enchantmentModifiers).forEach((mod) => {
				let stat = mod[0] as keyof typeof enchantmentModifiers;
				worldstate.playerCharacter[stat] -= mod[1];
				enchantmentModifiers[stat] -= mod[1];
				if (stat === 'maxHealth') {
					if (worldstate.playerCharacter.health > mod[1])
						worldstate.playerCharacter.health -= mod[1];
					else worldstate.playerCharacter.health = 1;
				}
			});
		} else {
			if (enchantment === 'None') return;
			let stat = Enchantment[enchantment]?.affectedStat?.stat! as keyof typeof enchantmentModifiers;
			let value = Enchantment[enchantment]?.affectedStat?.value!;
			worldstate.playerCharacter[stat] += value!;
			enchantmentModifiers[stat] += value!;
			if (stat === 'maxHealth') {
				worldstate.playerCharacter.health += value!;
			}
		}
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

		this.applyEquipped();
		const [itemData, equipmentData] = this.focusedSlot
			? getFullDataForEquipmentSlot(this.focusedSlot)
			: [undefined, undefined];
		this.scene.overlayScreens!.itemScreen.update(itemData, equipmentData);
	}

	modify(enchantment?: EnchantmentName): void {
		this.currentEnchantment = enchantment;
	}

	setVisible(value: boolean, index?: number, direction?: number): this {
		super.setVisible(value, index, direction);
		if (!value) {
			this.equipmentSelectionWheel?.setVisible(false);
		}
		return this;
	}
}
