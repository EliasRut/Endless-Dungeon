import { EnchantmentName } from '../../items/enchantmentData';
import { UiDepths, UI_SCALE } from '../helpers/constants';
import MainScene from '../scenes/MainScene';
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

export default class EnchantingScreen extends OverlayScreen {
	title: Phaser.GameObjects.Text;
	bear: Phaser.GameObjects.Text;
	wolf: Phaser.GameObjects.Text;
	cat: Phaser.GameObjects.Text;
	rabbit: Phaser.GameObjects.Text;
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
		this.bear = new Phaser.GameObjects.Text(scene, NOUN_START_X, NOUN_START_Y, 'Bear', {
			color: 'white',
			fontSize: `${12 * UI_SCALE}pt`,
			fontFamily: 'endlessDungeon',
			align: 'center',
		});
		this.bear.setDepth(UiDepths.UI_ABOVE_FOREGROUND_LAYER);
		this.bear.setScrollFactor(0);
		this.bear.setInteractive();
		this.bear.setShadow(0, 1 * UI_SCALE, 'black');
		this.bear.on('pointerdown', () => {
			let enchantment = 'LesserBear' as EnchantmentName;
			this.scene.closeAllIconScreens();
			this.scene.icons.backpackIcon.openScreen(enchantment);
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
			let enchantment = 'LesserWolf' as EnchantmentName;
			this.scene.closeAllIconScreens();
			this.scene.icons.backpackIcon.openScreen(enchantment);
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
			let enchantment = 'LesserCat' as EnchantmentName;
			this.scene.closeAllIconScreens();
			this.scene.icons.backpackIcon.openScreen(enchantment);
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
			let enchantment = 'LesserRabbit' as EnchantmentName;
			this.scene.closeAllIconScreens();
			this.scene.icons.backpackIcon.openScreen(enchantment);
		});
		this.add(this.rabbit, true);
		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
	}
}
