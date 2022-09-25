import { EquipmentSlot, UiDepths, UI_SCALE } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';
import { Abilities, AbilityType, getRelevantAbilityVersion } from '../abilities/abilityData';
import globalState from '../worldstate';
import { ItemData } from '../../items/itemData';
import { EquippedItemData } from '../worldstate/Inventory';
import { Enchantment } from '../../items/enchantmentData';
import { STAT_SCREEN_RIGHT_BORDER } from './StatScreen';
import { MENU_ICON_LEFT_BORDER } from '../drawables/ui/MenuIcon';
import { getEquipmentDataForSlot } from '../helpers/inventory';

const BASE_SIZE_NAME = 20;

const SCREEN_Y = 24;
const SCREEN_WIDTH = 200;
const SCREEN_HEIGHT = 280;
const FLAVOR_HEIGHT = 150;

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;

const AVAILABLE_WINDOW_WIDTH =
	SCALED_WINDOW_WIDTH - STAT_SCREEN_RIGHT_BORDER - MENU_ICON_LEFT_BORDER;

const SCREEN_X = STAT_SCREEN_RIGHT_BORDER + AVAILABLE_WINDOW_WIDTH / 2 - SCREEN_WIDTH - 10;

export default class ItemScreen extends OverlayScreen {
	itemName: Phaser.GameObjects.Text;
	lableLevel: Phaser.GameObjects.Text;
	lableEnchantment: Phaser.GameObjects.Text;
	lableEnchantmentValue: Phaser.GameObjects.Text;
	lableMovSpeedValue: Phaser.GameObjects.Text;
	flavorText: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(
			scene,
			SCREEN_X * UI_SCALE,
			SCREEN_Y * UI_SCALE,
			SCREEN_WIDTH * UI_SCALE,
			SCREEN_HEIGHT * UI_SCALE
		);

		const itemText = new Phaser.GameObjects.Image(
			scene,
			(SCREEN_X + 14) * UI_SCALE,
			(SCREEN_Y - 1) * UI_SCALE,
			'gui-text-info'
		);
		itemText.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		itemText.setScrollFactor(0);
		itemText.setOrigin(0);
		itemText.setScale(UI_SCALE);
		this.add(itemText, true);

		this.itemName = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 16) * UI_SCALE,
			(SCREEN_Y + 12) * UI_SCALE,
			'',
			{
				color: 'white',
				fontFamily: 'endlessDungeon',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${BASE_SIZE_NAME * UI_SCALE}pt`,
			}
		);
		// let textHeight = 100;
		// let textWidth = SCREEN_WIDTH;
		// let variableSize = BASE_SIZE_NAME;
		// while (textHeight > 40 || textWidth > SCREEN_WIDTH - 40) {
		// 	this.itemName.setFontSize(variableSize * UI_SCALE);
		// 	textHeight = this.itemName.getBounds().height;
		// 	textWidth = this.itemName.getBounds().width;
		// 	variableSize--;
		// }
		this.itemName.setOrigin(0);
		this.itemName.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.itemName.setScrollFactor(0);
		this.itemName.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.itemName, true);

		this.flavorText = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 16) * UI_SCALE,
			(SCREEN_Y + 48) * UI_SCALE,
			'',
			{
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
			}
		);
		this.flavorText.setShadow(0, 1 * UI_SCALE, 'black');
		this.flavorText.setOrigin(0);
		this.flavorText.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.flavorText.setScrollFactor(0);
		this.add(this.flavorText, true);

		this.lableEnchantment = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 16) * UI_SCALE,
			(SCREEN_Y + 120) * UI_SCALE,
			'',
			{
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				color: '#ffae00',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
			}
		);
		this.lableEnchantmentValue = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 16) * UI_SCALE,
			(SCREEN_Y + 156) * UI_SCALE,
			``,
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		this.lableEnchantment.setOrigin(0, 0);
		this.lableEnchantment.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableEnchantment.setScrollFactor(0);
		this.lableEnchantment.setShadow(0, 1 * UI_SCALE, 'black');
		this.lableEnchantmentValue.setOrigin(0, 0);
		this.lableEnchantmentValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableEnchantmentValue.setScrollFactor(0);
		this.lableEnchantmentValue.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.lableEnchantment, true);
		this.add(this.lableEnchantmentValue, true);

		this.lableLevel = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 16) * UI_SCALE,
			(SCREEN_Y + SCREEN_HEIGHT - 30) * UI_SCALE,
			'Level',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'right',
				fixedWidth: (SCREEN_WIDTH - 36) * UI_SCALE,
			}
		);
		this.lableLevel.setOrigin(0);
		this.lableLevel.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableLevel.setScrollFactor(0);
		this.lableLevel.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.lableLevel, true);

		scene.add.existing(this);
		this.setVisible(false);
	}

	update(itemData?: ItemData, equipmentData?: EquippedItemData) {
		if (itemData !== undefined) {
			if (equipmentData) {
				this.lableLevel.setText(`Level ${equipmentData.level}`);
				this.lableEnchantment.setText(Enchantment[equipmentData.enchantment]!.name);
				this.lableEnchantmentValue.setText(Enchantment[equipmentData.enchantment]!.description);
				// 	const eItem = item as EquippableItem;
				// 	this.lableHealthValue.setText(`${eItem.maxHealth.toFixed(2)}`);
				// 	this.lableDamageValue.setText(`${eItem.damage.toFixed(2)}`);
				// 	this.lableMovSpeedValue.setText(`${eItem.movementSpeed.toFixed(2)}`);
			} else {
				this.lableLevel.setText(``);
				this.lableEnchantment.setText('');
				this.lableEnchantmentValue.setText('');

				// 	this.lableHealthValue.setText(`${0}`);
				// 	this.lableDamageValue.setText(`${0}`);
				// 	this.lableMovSpeedValue.setText(`${0}`);
			}
			// center flavor text
			this.flavorText.setText(`${itemData.description}`);
			// let residualHeight = FLAVOR_HEIGHT - this.flavorText.getBounds().height;
			// residualHeight = residualHeight / 2;
			// this.flavorText.setY(SCREEN_Y);

			// update item name
			this.itemName.setText(`${itemData.name}`);
		} else {
			this.lableLevel.setText(``);
			this.lableEnchantment.setText(``);
			this.lableEnchantmentValue.setText(``);
			this.flavorText.setText(``);
			this.itemName.setText(``);
		}
	}

	updateAbility(ability: AbilityType, slotKey: EquipmentSlot) {
		const itemLevel = getEquipmentDataForSlot(slotKey)?.level ?? 0;
		const relevantAbility = getRelevantAbilityVersion(ability, itemLevel, 1);

		const damageValue = relevantAbility.damageMultiplier * globalState.playerCharacter.damage;
		this.lableEnchantmentValue.setText(`${damageValue.toFixed(2)}`);
		this.lableLevel.setText(`Level 1`);
		// this.lableMovSpeedValue.setText(`${0}`);
		// center flavor text

		this.flavorText.setText(`${relevantAbility.flavorText}`);
		let residualHeight = FLAVOR_HEIGHT - this.flavorText.getBounds().height;
		residualHeight = residualHeight / 2;
		// this.flavorText.setY(SCREEN_Y + 80 + residualHeight);

		// update item name
		this.itemName.setText(`${relevantAbility.abilityName}`);

		this.lableEnchantment.setText('');
		this.lableEnchantmentValue.setText('');

		// let textHeight = 100;
		// let textWidth = SCREEN_WIDTH;
		// let variableSize = BASE_SIZE_NAME;
		// while (textHeight > 40 || textWidth > SCREEN_WIDTH - 40) {
		// 	this.itemName.setFontSize(variableSize);
		// 	textHeight = this.itemName.getBounds().height;
		// 	textWidth = this.itemName.getBounds().width;
		// 	variableSize--;
		// }
	}
}
