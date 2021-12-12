import { UiDepths } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';
import { Abilities, AbilityType } from '../abilities/abilityData';
import globalState from '../worldstate';
import { ItemData } from '../../items/itemData';
import { EquippedItemData } from '../worldstate/Inventory';
import { Enchantment } from '../../items/enchantmentData';

const BASE_SIZE_NAME = 25;

const SCREEN_X = 250;
const SCREEN_Y = 95;
const SCREEN_WIDTH = 200;
const FLAVOR_HEIGHT = 150;
export default class ItemScreen extends OverlayScreen {
	itemName: Phaser.GameObjects.Text;
	lableLevel: Phaser.GameObjects.Text;
	lableEnchantment: Phaser.GameObjects.Text;
	lableEnchantmentValue: Phaser.GameObjects.Text;
	lableMovSpeedValue: Phaser.GameObjects.Text;
	flavorText: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, SCREEN_X, SCREEN_Y, SCREEN_WIDTH, 280);

		this.itemName = new Phaser.GameObjects.Text(scene, SCREEN_X - 15, SCREEN_Y - 15, '', {
			color: 'purple',
			wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
		});
		let textHeight = 100;
		let textWidth = SCREEN_WIDTH;
		let variableSize = BASE_SIZE_NAME;
		while (textHeight > 40 || textWidth > SCREEN_WIDTH - 40) {
			this.itemName.setFontSize(variableSize);
			textHeight = this.itemName.getBounds().height;
			textWidth = this.itemName.getBounds().width;
			variableSize--;
		}
		this.itemName.setOrigin(0);
		this.itemName.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.itemName.setScrollFactor(0);
		this.add(this.itemName, true);

		this.flavorText = new Phaser.GameObjects.Text(scene, SCREEN_X - 15, SCREEN_Y + 28, '', {
			fontSize: '12px',
			color: '#333',
			wordWrap: { width: SCREEN_WIDTH - 30, useAdvancedWrap: true },
		});
		this.flavorText.setOrigin(0, 0);
		this.flavorText.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.flavorText.setScrollFactor(0);
		this.add(this.flavorText, true);

		this.lableEnchantment = new Phaser.GameObjects.Text(scene, SCREEN_X - 15, SCREEN_Y + 120, '', {
			fontSize: '12px',
			color: 'purple',
			wordWrap: { width: SCREEN_WIDTH - 30, useAdvancedWrap: true },
		});
		this.lableEnchantmentValue = new Phaser.GameObjects.Text(
			scene,
			SCREEN_X - 15,
			SCREEN_Y + 148,
			``,
			{
				fontSize: '12px',
				color: '#333',
				wordWrap: { width: SCREEN_WIDTH - 30, useAdvancedWrap: true },
			}
		);
		this.lableEnchantment.setOrigin(0, 0);
		this.lableEnchantment.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableEnchantment.setScrollFactor(0);
		this.lableEnchantmentValue.setOrigin(0, 0);
		this.lableEnchantmentValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableEnchantmentValue.setScrollFactor(0);
		this.add(this.lableEnchantment, true);
		this.add(this.lableEnchantmentValue, true);

		this.lableLevel = new Phaser.GameObjects.Text(scene, SCREEN_X - 15, SCREEN_Y + 216, 'Level', {
			fontSize: '12px',
			color: 'black',
			align: 'right',
			fixedWidth: SCREEN_WIDTH - 36,
		});
		this.lableLevel.setOrigin(0, 0);
		this.lableLevel.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableLevel.setScrollFactor(0);
		this.add(this.lableLevel, true);

		// const lableMovSpeed = new Phaser.GameObjects.BitmapText(
		// 	scene,
		// 	SCREEN_X - 10,
		// 	SCREEN_Y + 66,
		// 	'pixelfont',
		// 	'Speed',
		// 	FONT_SIZE_TEXT
		// );
		// this.lableMovSpeedValue = new Phaser.GameObjects.BitmapText(
		// 	scene,
		// 	SCREEN_X + 74,
		// 	SCREEN_Y + 66,
		// 	'pixelfont',
		// 	``,
		// 	FONT_SIZE_TEXT
		// );
		// lableMovSpeed.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		// lableMovSpeed.setScrollFactor(0);
		// this.lableMovSpeedValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		// this.lableMovSpeedValue.setScrollFactor(0);
		// this.add(lableMovSpeed, true);
		// this.add(this.lableMovSpeedValue, true);

		scene.add.existing(this);
		this.setVisible(false);
	}

	update(itemData?: ItemData, equipmentData?: EquippedItemData) {
		if (itemData !== undefined) {
			if (equipmentData) {
				this.lableLevel.setText(`Level ${equipmentData.level}`);
				this.lableEnchantment.setText(Enchantment[equipmentData.enchantment].name);
				this.lableEnchantmentValue.setText(Enchantment[equipmentData.enchantment].description);
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
			let textHeight = 100;
			let textWidth = SCREEN_WIDTH;
			let variableSize = BASE_SIZE_NAME;
			while (textHeight > 40 || textWidth > SCREEN_WIDTH - 40) {
				this.itemName.setFontSize(variableSize);
				textHeight = this.itemName.getBounds().height;
				textWidth = this.itemName.getBounds().width;
				variableSize--;
			}
		} else {
			this.lableLevel.setText(``);
			this.lableEnchantment.setText(``);
			this.lableEnchantmentValue.setText(``);
			this.flavorText.setText(``);
			this.itemName.setText(``);
		}
	}

	updateAbility(ability: AbilityType) {
		const damageValue = Abilities[ability].damageMultiplier * globalState.playerCharacter.damage;
		this.lableEnchantmentValue.setText(`${damageValue.toFixed(2)}`);
		this.lableLevel.setText(`Level 1`);
		// this.lableMovSpeedValue.setText(`${0}`);
		// center flavor text
		this.flavorText.setText(`${Abilities[ability].flavorText}`);
		let residualHeight = FLAVOR_HEIGHT - this.flavorText.getBounds().height;
		residualHeight = residualHeight / 2;
		// this.flavorText.setY(SCREEN_Y + 80 + residualHeight);

		// update item name
		this.itemName.setText(`${Abilities[ability].abilityName}`);

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
