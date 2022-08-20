import { EnchantmentName } from '../../items/enchantmentData';
import InventoryItemToken from '../drawables/tokens/InventoryItemToken';
import {
	ColorsOfMagic,
	essenceNames,
	NORMAL_ANIMATION_FRAME_RATE,
	UiDepths,
	UI_SCALE,
} from '../helpers/constants';
import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import OverlayScreen from './OverlayScreen';

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;
const SCALED_WINDOW_HEIGHT = window.innerHeight / UI_SCALE;

const SCREEN_WIDTH = 500;
const SCREEN_HEIGHT = 260;
const SCREEN_START_X = (SCALED_WINDOW_WIDTH - SCREEN_WIDTH) / 2;
const SCREEN_START_Y = (SCALED_WINDOW_HEIGHT - SCREEN_HEIGHT) / 1.5;

const ELEMENT_SEPARATOR_X = 300;
const ELEMENT_SEPARATOR_Y = 100;
const NOUN_START_X = (SCREEN_START_X + 300) * UI_SCALE;
const NOUN_START_Y = (SCREEN_START_Y + 50) * UI_SCALE;

const ADJECTIVE_START_X = (SCREEN_START_X + 100) * UI_SCALE;
const ADJECTIVE_START_Y = (SCREEN_START_Y + 50) * UI_SCALE;

const ESSENCE_START_X = (SCREEN_START_X + 325) * UI_SCALE;
const ESSENCE_START_Y = (SCREEN_START_Y + 175) * UI_SCALE;
const ESSENCE_SEPARATOR = 100;
const ESSENCE_NUMBER_OFFSET = 30;

export default class EnchantingScreen extends OverlayScreen {
	title: Phaser.GameObjects.Text;
	bear: Phaser.GameObjects.Text;
	wolf: Phaser.GameObjects.Text;
	cat: Phaser.GameObjects.Text;
	rabbit: Phaser.GameObjects.Text;
	lesser: Phaser.GameObjects.Text;
	splendid: Phaser.GameObjects.Text;
	greater: Phaser.GameObjects.Text;
	mighty: Phaser.GameObjects.Text;
	selectedNoun: string;
	essenTokens: InventoryItemToken[];
	essenceNumbers: Phaser.GameObjects.Text[] = [];

	scene: MainScene;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers

		super(
			scene,
			SCREEN_START_X * UI_SCALE,
			SCREEN_START_Y * UI_SCALE,
			SCREEN_WIDTH * UI_SCALE,
			SCREEN_HEIGHT * UI_SCALE
		);

		this.scene = scene as MainScene;

		this.title = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_START_X + 12) * UI_SCALE,
			(SCREEN_START_Y + 18) * UI_SCALE,
			'Enchant',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
				fixedWidth: (SCREEN_WIDTH - 28) * UI_SCALE,
			}
		);
		this.title.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.title.setScrollFactor(0);
		this.title.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.title, true);
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		this.bear = new Phaser.GameObjects.Text(scene, NOUN_START_X, NOUN_START_Y, 'Bear', {
			color: 'white',
			fontSize: `${12 * UI_SCALE}pt`,
			fontFamily: 'endlessDungeon',
			align: 'center',
		});
		this.bear.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.bear.setScrollFactor(0);
		this.bear.setInteractive();
		this.bear.setShadow(0, 1 * UI_SCALE, 'black');
		this.bear.on('pointerdown', () => {
			this.selectedNoun = 'Bear';
		});
		this.add(this.bear, true);

		//-------------------------------------------------------------------------------------
		this.wolf = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			NOUN_START_Y + ELEMENT_SEPARATOR_Y,
			'Wolf',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		this.wolf.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.wolf.setScrollFactor(0);
		this.wolf.setInteractive();
		this.wolf.setShadow(0, 1 * UI_SCALE, 'black');
		this.wolf.on('pointerdown', () => {
			this.selectedNoun = 'Wolf';
		});
		this.add(this.wolf, true);

		//-------------------------------------------------------------------------------------
		this.cat = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X + ELEMENT_SEPARATOR_X,
			NOUN_START_Y + ELEMENT_SEPARATOR_Y,
			'Cat',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.cat.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.cat.setScrollFactor(0);
		this.cat.setInteractive();
		this.cat.setShadow(0, 1 * UI_SCALE, 'black');
		this.cat.on('pointerdown', () => {
			this.selectedNoun = 'Cat';
		});
		this.add(this.cat, true);

		//-------------------------------------------------------------------------------------
		this.rabbit = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X + ELEMENT_SEPARATOR_X,
			NOUN_START_Y,
			'Rabbit',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.rabbit.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.rabbit.setScrollFactor(0);
		this.rabbit.setInteractive();
		this.rabbit.setShadow(0, 1 * UI_SCALE, 'black');
		this.rabbit.on('pointerdown', () => {
			this.selectedNoun = 'Rabbit';
		});
		this.add(this.rabbit, true);
		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		this.lesser = new Phaser.GameObjects.Text(
			scene,
			ADJECTIVE_START_X,
			ADJECTIVE_START_Y,
			'Lesser',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.lesser.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.lesser.setScrollFactor(0);
		this.lesser.setInteractive();
		this.lesser.setShadow(0, 1 * UI_SCALE, 'black');
		this.lesser.on('pointerdown', () => {
			if (this.selectedNoun !== undefined) {
				let adjective = 'Lesser';
				let enchantment = (adjective + this.selectedNoun) as EnchantmentName;
				this.scene.closeAllIconScreens();
				this.scene.icons.backpackIcon.openScreen(enchantment);
			}
		});
		this.add(this.lesser, true);
		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		//-------------------------------------------------------------------------------------
		this.splendid = new Phaser.GameObjects.Text(
			scene,
			ADJECTIVE_START_X + ELEMENT_SEPARATOR_X,
			ADJECTIVE_START_Y,
			'Splendid',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.splendid.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.splendid.setScrollFactor(0);
		this.splendid.setInteractive();
		this.splendid.setShadow(0, 1 * UI_SCALE, 'black');
		this.splendid.on('pointerdown', () => {
			if (this.selectedNoun !== undefined) {
				let adjective = 'Splendid';
				let enchantment = (adjective + this.selectedNoun) as EnchantmentName;
				this.scene.closeAllIconScreens();
				this.scene.icons.backpackIcon.openScreen(enchantment);
			}
		});
		this.add(this.splendid, true);
		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		//-------------------------------------------------------------------------------------
		this.greater = new Phaser.GameObjects.Text(
			scene,
			ADJECTIVE_START_X,
			ADJECTIVE_START_Y + ELEMENT_SEPARATOR_Y,
			'Greater',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.greater.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.greater.setScrollFactor(0);
		this.greater.setInteractive();
		this.greater.setShadow(0, 1 * UI_SCALE, 'black');
		this.greater.on('pointerdown', () => {
			if (this.selectedNoun !== undefined) {
				let adjective = 'Greater';
				let enchantment = (adjective + this.selectedNoun) as EnchantmentName;
				this.scene.closeAllIconScreens();
				this.scene.icons.backpackIcon.openScreen(enchantment);
			}
		});
		this.add(this.greater, true);
		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		//-------------------------------------------------------------------------------------
		this.mighty = new Phaser.GameObjects.Text(
			scene,
			ADJECTIVE_START_X + ELEMENT_SEPARATOR_X,
			ADJECTIVE_START_Y + ELEMENT_SEPARATOR_Y,
			'Mighty',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.mighty.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.mighty.setScrollFactor(0);
		this.mighty.setInteractive();
		this.mighty.setShadow(0, 1 * UI_SCALE, 'black');
		this.mighty.on('pointerdown', () => {
			if (this.selectedNoun !== undefined) {
				let adjective = 'Mighty';
				let enchantment = (adjective + this.selectedNoun) as EnchantmentName;
				this.scene.closeAllIconScreens();
				this.scene.icons.backpackIcon.openScreen(enchantment);
			}
		});
		this.add(this.mighty, true);
		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		//-------------------------------------------------------------------------------------
		let counter = 0;
		essenceNames.forEach((essence) => {
			const essenceToken = new InventoryItemToken(
				this.scene,
				ESSENCE_START_X + ESSENCE_SEPARATOR * (counter % (essenceNames.length / 2)),
				ESSENCE_START_Y + ESSENCE_SEPARATOR * Math.round(counter / essenceNames.length),
				-1
			);

			essenceToken.setDepth(UiDepths.UI_FOREGROUND_LAYER);
			essenceToken.setScrollFactor(0);
			essenceToken.setVisible(false);
			this.playItemAnimation(essenceToken, essence);
			essenceToken.setScale(UI_SCALE);
			this.add(essenceToken, true);
			counter++;
		});
		//-------------------------------------------------------------------------------------
		counter = 0;
		essenceNames.forEach((essence) => {
			this.essenceNumbers[counter] = new Phaser.GameObjects.Text(
				this.scene,
				ESSENCE_START_X + ESSENCE_SEPARATOR * (counter % (essenceNames.length / 2)),
				ESSENCE_START_Y + ESSENCE_SEPARATOR * Math.round(counter / essenceNames.length) + ESSENCE_NUMBER_OFFSET,
				`${globalState.inventory.essences[essence as ColorsOfMagic]}`,
				{
					color: 'white',
					// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
					fontSize: `${12 * UI_SCALE}pt`,
					fontFamily: 'endlessDungeon',
					resolution: window.devicePixelRatio,
				}
			);
			this.essenceNumbers[counter].setDepth(UiDepths.UI_BACKGROUND_LAYER);
			this.essenceNumbers[counter].setScrollFactor(0);
			this.essenceNumbers[counter].setShadow(0, 1 * UI_SCALE, 'black');
			this.essenceNumbers[counter].setVisible(false);
			this.add(this.essenceNumbers[counter], true);
			counter++;
		});
	}

	playItemAnimation(itemToken: InventoryItemToken, essenceName: string) {
		const animation = 'essence_' + essenceName;
		if (this.scene.game.anims.exists(animation)) {
			itemToken.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE, repeat: -1 });
		}
	}

	update() {
		const essences = globalState.inventory.essences;
		let counter = 0;
		essenceNames.forEach((essence) => {
			this.essenceNumbers[counter].setText(`${essences[essence as ColorsOfMagic]}`);
			counter++;
		});
	}
}
