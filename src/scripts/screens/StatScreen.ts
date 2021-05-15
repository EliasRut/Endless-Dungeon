import { UiDepths } from '../helpers/constants';
import globalState from '../worldstate';
import OverlayScreen from './OverlayScreen';

const FONT_SIZE_HEADER = 16;
const FONT_SIZE_TEXT = 10;

const SCREEN_X = 50;
const SCREEN_Y = 120;
export default class StatScreen extends OverlayScreen {
	lableHealthValue: Phaser.GameObjects.BitmapText;
	lableDamageValue: Phaser.GameObjects.BitmapText;
	lableMovSpeedValue: Phaser.GameObjects.BitmapText;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, SCREEN_X, SCREEN_Y, 200, 220);

		const header = new Phaser.GameObjects.BitmapText(
			scene,
			SCREEN_X - 10,
			SCREEN_Y - 10,
			'pixelfont',
			'Statistics',
			FONT_SIZE_HEADER);
		header.setOrigin(0);
		header.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		header.setScrollFactor(0);
		this.add(header, true);

		const currentHealth = Math.round(globalState.playerCharacter.health);
		const maxHealth = Math.round(globalState.playerCharacter.maxHealth);
		const currentDamage = Math.round(globalState.playerCharacter.damage);
		const currentMovSpeed = Math.round(globalState.playerCharacter.movementSpeed);

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
			`${currentHealth}/${maxHealth}`,
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
			`${currentDamage}`,
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
			`${currentMovSpeed}`,
			FONT_SIZE_TEXT);
		lableMovSpeed.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		lableMovSpeed.setScrollFactor(0);
		this.lableMovSpeedValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableMovSpeedValue.setScrollFactor(0);
		this.add(lableMovSpeed, true);
		this.add(this.lableMovSpeedValue, true);

		scene.add.existing(this);
		this.setVisible(false);
	}

	update () {
		const player = globalState.playerCharacter;
		this.lableHealthValue.setText(`${Math.round(player.health)}/${Math.round(player.maxHealth)}`);
		this.lableDamageValue.setText(`${Math.round(player.damage)}`);
		this.lableMovSpeedValue.setText(`${Math.round(player.movementSpeed)}`);
	}
}