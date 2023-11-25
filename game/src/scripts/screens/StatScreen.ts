import { UiDepths, UI_SCALE } from '../helpers/constants';
import globalState from '../worldstate';
import OverlayScreen from './OverlayScreen';

const FONT_SIZE_HEADER = 20;
const FONT_SIZE_TEXT = 12;

const SCREEN_X = 8;
const SCREEN_Y = 96;

const SCREEN_WIDTH = 172;
export const STAT_SCREEN_RIGHT_BORDER = SCREEN_X + SCREEN_WIDTH;

export default class StatScreen extends OverlayScreen {
	lableHealthValue: Phaser.GameObjects.Text;
	lableDamageValue: Phaser.GameObjects.Text;
	lableMovSpeedValue: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, SCREEN_X * UI_SCALE, SCREEN_Y * UI_SCALE, SCREEN_WIDTH * UI_SCALE, 208 * UI_SCALE);

		const itemText = new Phaser.GameObjects.Image(
			scene,
			(SCREEN_X + 14) * UI_SCALE,
			(SCREEN_Y - 1) * UI_SCALE,
			'gui-text-stats'
		);
		itemText.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		itemText.setScrollFactor(0);
		itemText.setOrigin(0);
		itemText.setScale(UI_SCALE);
		this.add(itemText, true);

		// const header = new Phaser.GameObjects.Text(
		// 	scene,
		// 	(SCREEN_X + 16) * UI_SCALE,
		// 	(SCREEN_Y + 8) * UI_SCALE,
		// 	'Statistics',
		// 	{
		// 		color: 'white',
		// 		// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
		// 		fontSize: `${FONT_SIZE_HEADER * UI_SCALE}pt`,
		// 		fontFamily: 'endlessDungeon',
		// 		resolution: window.devicePixelRatio,
		// 	}
		// );
		// header.setOrigin(0);
		// header.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		// header.setScrollFactor(0);
		// header.setShadow(0, 1 * UI_SCALE, 'black');
		// this.add(header, true);

		const currentHealth = Math.round(globalState.playerCharacter.health);
		const maxHealth = Math.round(globalState.playerCharacter.maxHealth);
		const currentDamage = Math.round(globalState.playerCharacter.damage);
		const currentMovSpeed = Math.round(globalState.playerCharacter.movementSpeed);

		const lableHealth = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 16) * UI_SCALE,
			(SCREEN_Y + 12) * UI_SCALE,
			'Health',
			{
				color: 'white',
				// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
				fontSize: `${FONT_SIZE_TEXT * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				resolution: window.devicePixelRatio,
			}
		);
		this.lableHealthValue = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 74) * UI_SCALE,
			(SCREEN_Y + 12) * UI_SCALE,
			`${currentHealth}/${maxHealth}`,
			{
				color: 'white',
				// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				resolution: window.devicePixelRatio,
			}
		);
		lableHealth.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		lableHealth.setScrollFactor(0);
		lableHealth.setShadow(0, 1 * UI_SCALE, 'black');
		this.lableHealthValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableHealthValue.setScrollFactor(0);
		this.lableHealthValue.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(lableHealth, true);
		this.add(this.lableHealthValue, true);

		const lableDamage = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 16) * UI_SCALE,
			(SCREEN_Y + 28) * UI_SCALE,
			'Damage',
			{
				color: 'white',
				// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				resolution: window.devicePixelRatio,
			}
		);
		this.lableDamageValue = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 74) * UI_SCALE,
			(SCREEN_Y + 28) * UI_SCALE,
			`${currentDamage}`,
			{
				color: 'white',
				// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				resolution: window.devicePixelRatio,
			}
		);
		lableDamage.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		lableDamage.setScrollFactor(0);
		lableDamage.setShadow(0, 1 * UI_SCALE, 'black');
		this.lableDamageValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableDamageValue.setScrollFactor(0);
		this.lableDamageValue.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(lableDamage, true);
		this.add(this.lableDamageValue, true);

		const lableMovSpeed = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 16) * UI_SCALE,
			(SCREEN_Y + 46) * UI_SCALE,
			'Speed',
			{
				color: 'white',
				// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				resolution: window.devicePixelRatio,
			}
		);
		this.lableMovSpeedValue = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_X + 74) * UI_SCALE,

			(SCREEN_Y + 46) * UI_SCALE,
			`${currentMovSpeed}`,
			{
				color: 'white',
				// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				resolution: window.devicePixelRatio,
			}
		);
		lableMovSpeed.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		lableMovSpeed.setScrollFactor(0);
		lableMovSpeed.setShadow(0, 1 * UI_SCALE, 'black');
		this.lableMovSpeedValue.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.lableMovSpeedValue.setScrollFactor(0);
		this.lableMovSpeedValue.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(lableMovSpeed, true);
		this.add(this.lableMovSpeedValue, true);

		scene.add.existing(this);
		this.setVisible(false);
	}

	update() {
		const player = globalState.playerCharacter;
		this.lableHealthValue.setText(`${Math.round(player.health)}/${Math.round(player.maxHealth)}`);
		this.lableDamageValue.setText(`${Math.round(player.damage)}`);
		this.lableMovSpeedValue.setText(`${Math.round(player.movementSpeed)}`);
	}
}
