import { UiDepths } from '../helpers/constants';
import EquippableItem from '../worldstate/EquippableItem';
import Item from '../worldstate/Item';
import OverlayScreen from './OverlayScreen';
import { isEquippable } from '../helpers/inventory';
import { Abilities, AbilityType } from '../abilities/abilityData';
import globalState from '../worldstate';

const BASE_SIZE_NAME = 25;
const FONT_SIZE_TEXT = 10;

const SCREEN_X = 250;
const SCREEN_Y = 95;
const SCREEN_WIDTH = 200;
const FLAVOR_HEIGHT = 150;
export default class ItemScreen extends OverlayScreen {
	itemName: Phaser.GameObjects.Text;
	lableHealthValue: Phaser.GameObjects.BitmapText;
	lableDamageValue: Phaser.GameObjects.BitmapText;
	lableMovSpeedValue: Phaser.GameObjects.BitmapText;
	flavorText: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, SCREEN_X, SCREEN_Y, SCREEN_WIDTH, 280);

		this.itemName = new Phaser.GameObjects.Text(
			scene,
			SCREEN_X - 10,
			SCREEN_Y - 15,
			'Frostmourne\'s forgotten little brother',
			{
				color: 'purple',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true }
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

		const lableHealth = new Phaser.GameObjects.BitmapText(
			scene,
			SCREEN_X - 10,
			SCREEN_Y + 30,
			'pixelfont',
			'Health',
			FONT_SIZE_TEXT);
		this.lableHealthValue = new Phaser.GameObjects.BitmapText(
			scene,
			SCREEN_X + 74,
			SCREEN_Y + 30,
			'pixelfont',
			``,
			FONT_SIZE_TEXT);
		lableHealth.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		lableHealth.setScrollFactor(0);
		this.lableHealthValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableHealthValue.setScrollFactor(0);
		this.add(lableHealth, true);
		this.add(this.lableHealthValue, true);

		const lableDamage = new Phaser.GameObjects.BitmapText(
			scene,
			SCREEN_X - 10,
			SCREEN_Y + 48,
			'pixelfont',
			'Damage',
			FONT_SIZE_TEXT);
		this.lableDamageValue = new Phaser.GameObjects.BitmapText(
			scene,
			SCREEN_X + 74,
			SCREEN_Y + 48,
			'pixelfont',
			``,
			FONT_SIZE_TEXT);
		lableDamage.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		lableDamage.setScrollFactor(0);
		this.lableDamageValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableDamageValue.setScrollFactor(0);
		this.add(lableDamage, true);
		this.add(this.lableDamageValue, true);

		const lableMovSpeed = new Phaser.GameObjects.BitmapText(
			scene,
			SCREEN_X - 10,
			SCREEN_Y + 66,
			'pixelfont',
			'Speed',
			FONT_SIZE_TEXT);
		this.lableMovSpeedValue = new Phaser.GameObjects.BitmapText(
			scene,
			SCREEN_X + 74,
			SCREEN_Y + 66,
			'pixelfont',
			``,
			FONT_SIZE_TEXT);
		lableMovSpeed.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		lableMovSpeed.setScrollFactor(0);
		this.lableMovSpeedValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableMovSpeedValue.setScrollFactor(0);
		this.add(lableMovSpeed, true);
		this.add(this.lableMovSpeedValue, true);

		this.flavorText = new Phaser.GameObjects.Text(
			scene,
			SCREEN_X - 10,
			SCREEN_Y + 80,
			'',
			{
				fontSize: '12px',
				color: 'orange',
				wordWrap: { width: SCREEN_WIDTH - 30, useAdvancedWrap: true }
			});
		this.flavorText.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.flavorText.setScrollFactor(0);
		this.add(this.flavorText, true);
		scene.add.existing(this);
		this.setVisible(false);
	}

	update(item?: Item) {
		if (item !== undefined) {
			if (isEquippable(item)) {
				const eItem = item as EquippableItem;
				this.lableHealthValue.setText(`${(eItem.maxHealth).toFixed(2)}`);
				this.lableDamageValue.setText(`${(eItem.damage).toFixed(2)}`);
				this.lableMovSpeedValue.setText(`${(eItem.movementSpeed).toFixed(2)}`);
			} else {
				this.lableHealthValue.setText(`${0}`);
				this.lableDamageValue.setText(`${0}`);
				this.lableMovSpeedValue.setText(`${0}`);
			}
			// center flavor text
			this.flavorText.setText(`${item.flavorText}`);
			let residualHeight = FLAVOR_HEIGHT - this.flavorText.getBounds().height;
			residualHeight = residualHeight / 2;
			this.flavorText.setY(SCREEN_Y + 80 + residualHeight);

			// update item name
			this.itemName.setText(`${item.name}`);
			let textHeight = 100;
			let textWidth = SCREEN_WIDTH;
			let variableSize = BASE_SIZE_NAME;
			while (textHeight > 40 || textWidth > SCREEN_WIDTH - 40) {
				this.itemName.setFontSize(variableSize);
				textHeight = this.itemName.getBounds().height;
				textWidth = this.itemName.getBounds().width;
				variableSize--;
			}
		}
	}

	updateAbility(ability: AbilityType) {
		this.lableDamageValue.setText(`${(Abilities[ability].damageMultiplier * globalState.playerCharacter.damage).toFixed(2)}`);
		this.lableHealthValue.setText(`${0}`);
		this.lableMovSpeedValue.setText(`${0}`);
		// center flavor text
		this.flavorText.setText(`${Abilities[ability].flavorText}`);
		let residualHeight = FLAVOR_HEIGHT - this.flavorText.getBounds().height;
		residualHeight = residualHeight / 2;
		this.flavorText.setY(SCREEN_Y + 80 + residualHeight);

		// update item name
		this.itemName.setText(`${ability}`);
		let textHeight = 100;
		let textWidth = SCREEN_WIDTH;
		let variableSize = BASE_SIZE_NAME;
		while (textHeight > 40 || textWidth > SCREEN_WIDTH - 40) {
			this.itemName.setFontSize(variableSize);
			textHeight = this.itemName.getBounds().height;
			textWidth = this.itemName.getBounds().width;
			variableSize--;
		}
	}
}
