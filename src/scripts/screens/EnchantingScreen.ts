import {
	FixWidthSizer,
	Label,
	RoundRectangle,
	ScrollablePanel,
} from 'phaser3-rex-plugins/templates/ui/ui-components';
import { Enchantment, EnchantmentName } from '../../items/enchantmentData';
import InventoryItemToken from '../drawables/tokens/InventoryItemToken';
import {
	ColorsOfMagic,
	essenceNames,
	NORMAL_ANIMATION_FRAME_RATE,
	statDisplayNames,
	UiDepths,
	UI_SCALE,
} from '../helpers/constants';
import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import OverlayScreen from './OverlayScreen';

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;
const SCALED_WINDOW_HEIGHT = window.innerHeight / UI_SCALE;

const SCREEN_WIDTH = 500;
const SCREEN_HEIGHT = 300;
const SCREEN_START_X = (SCALED_WINDOW_WIDTH - SCREEN_WIDTH) / 2;
const SCREEN_START_Y = (SCALED_WINDOW_HEIGHT - SCREEN_HEIGHT) / 2;

const ELEMENT_SEPARATOR_X = 75 * UI_SCALE;
const ELEMENT_SEPARATOR_Y = 30 * UI_SCALE;
const NOUN_START_X = (SCREEN_START_X + 320) * UI_SCALE;
const NOUN_START_Y = (SCREEN_START_Y + 50) * UI_SCALE;

const ADJECTIVE_START_X = (SCREEN_START_X + 70) * UI_SCALE;
const ADJECTIVE_START_Y = (SCREEN_START_Y + 50) * UI_SCALE;

const ESSENCE_START_X = (SCREEN_START_X + 300) * UI_SCALE;
const ESSENCE_START_Y = (SCREEN_START_Y + 175) * UI_SCALE;
const ESSENCE_SEPARATOR = 50 * UI_SCALE;
const ESSENCE_NUMBER_OFFSET = 15 * UI_SCALE;

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

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
	selectedNoun: string = 'Bear';
	selectedAdjective: string = 'Lesser';
	essenTokens: InventoryItemToken[];
	essenceNumbers: Phaser.GameObjects.Text[] = [];
	enchantmentName: Phaser.GameObjects.Text;
	enchantmentModifier: Phaser.GameObjects.Text;
	scrollablePanel: ScrollablePanel;

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

		this.scrollablePanel = this.createScrollableList(scene);
		this.add(this.scrollablePanel, true);
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
			this.update();
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
			this.update();
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
			this.update();
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
			this.update();
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
				this.selectedAdjective = 'Lesser';
				this.update();
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
				this.selectedAdjective = 'Splendid';
				this.update();
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
				this.selectedAdjective = 'Greater';
				this.update();
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
				this.selectedAdjective = 'Mighty';
				this.update();
			}
		});
		this.add(this.mighty, true);
		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		// -------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------
		// -------------------------------------------------------------------------------------
		let counter = 0;
		essenceNames.forEach((essence) => {
			const essenceToken = new InventoryItemToken(
				this.scene,
				ESSENCE_START_X + ESSENCE_SEPARATOR * (counter % (essenceNames.length / 2)),
				ESSENCE_START_Y + ESSENCE_SEPARATOR * Math.round(counter / essenceNames.length),
				'empty-tile',
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
		// -------------------------------------------------------------------------------------
		counter = 0;
		essenceNames.forEach((essence) => {
			this.essenceNumbers[counter] = new Phaser.GameObjects.Text(
				this.scene,
				ESSENCE_START_X + ESSENCE_SEPARATOR * (counter % (essenceNames.length / 2)),
				ESSENCE_START_Y +
					ESSENCE_SEPARATOR * Math.round(counter / essenceNames.length) +
					ESSENCE_NUMBER_OFFSET,
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
		// -------------------------------------------------------------------------------------
		let currentEnchantment = (this.selectedAdjective + this.selectedNoun) as EnchantmentName;
		let enchantment = Enchantment[currentEnchantment];
		this.enchantmentName = new Phaser.GameObjects.Text(
			scene,
			ADJECTIVE_START_X,
			ESSENCE_START_Y,
			`${enchantment?.name}`,
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		this.enchantmentName.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.enchantmentName.setScrollFactor(0);
		this.enchantmentName.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.enchantmentName, true);
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		// -------------------------------------------------------------------------------------
		this.enchantmentModifier = new Phaser.GameObjects.Text(
			scene,
			ADJECTIVE_START_X,
			ESSENCE_START_Y + ESSENCE_NUMBER_OFFSET,
			`${statDisplayNames[enchantment!.affectedStat!.stat]}: `.padEnd(18) +
				`${enchantment?.affectedStat?.value}`,
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		this.enchantmentModifier.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.enchantmentModifier.setScrollFactor(0);
		this.enchantmentModifier.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.enchantmentModifier, true);
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
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
		let enchantment = Enchantment[(this.selectedAdjective + this.selectedNoun) as EnchantmentName];
		this.enchantmentName.setText(`${enchantment?.name}`);
		this.enchantmentModifier.setText(
			`${statDisplayNames[enchantment!.affectedStat!.stat]}: `.padEnd(18) +
				`${enchantment?.affectedStat?.value}`
		);
	}

	createScrollableList(scene: Phaser.Scene) {
		var panel = new ScrollablePanel(scene, {
			x: ADJECTIVE_START_X + SCREEN_WIDTH / 2 / 2,
			y: ADJECTIVE_START_Y + SCREEN_HEIGHT / 2,
			width: SCREEN_WIDTH / 2,
			height: SCREEN_HEIGHT,

			scrollMode: 0,

			background: new RoundRectangle(scene, 0, 0, 2, 2, 10, COLOR_PRIMARY),

			panel: {
				child: this.createGrid(scene),
				mask: {
					padding: 0,
				},
			},

			slider: {
				track: new RoundRectangle(scene, 0, 0, 20, 10, 10, COLOR_DARK),
				thumb: new RoundRectangle(scene, 0, 0, 0, 0, 13, COLOR_LIGHT),
				// position: 'left'
			},

			mouseWheelScroller: {
				focus: false,
				speed: 0.1,
			},

			header: new Label(scene, {
				height: 30,

				orientation: 0,
				background: new RoundRectangle(scene, 0, 0, 20, 20, 0, COLOR_DARK),
				text: scene.add.text(0, 0, 'Header'),
			}),

			footer: new Label(scene, {
				height: 30,

				orientation: 0,
				background: new RoundRectangle(scene, 0, 0, 20, 20, 0, COLOR_DARK),
				text: scene.add.text(0, 0, 'Footer'),
			}),

			space: {
				left: 10,
				right: 10,
				top: 10,
				bottom: 10,

				panel: 10,
				header: 10,
				footer: 10,
			},
		}).layout();

		panel.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		panel.setScrollFactor(0);
		panel.setOrigin(0);
		panel.setScale(UI_SCALE);
		panel.setVisible(false);
		return panel;
	}
	createGrid(scene: Phaser.Scene) {
		// Create table body
		var sizer = new FixWidthSizer(scene, {
			space: {
				left: 3,
				right: 3,
				top: 3,
				bottom: 3,
				item: 8,
				line: 8,
			},
		}).addBackground(new RoundRectangle(scene, 0, 0, 10, 10, 0, COLOR_DARK));

		for (var i = 0; i < 30; i++) {
			sizer.add(
				new Label(scene, {
					width: 30,
					height: 30,

					background: new RoundRectangle(scene, 0, 0, 0, 0, 14, COLOR_LIGHT),
					text: scene.add.text(0, 0, `${i}`, {
						fontSize: `${12 * UI_SCALE}`,
					}),

					align: 'center',
					space: {
						left: 5,
						right: 5,
						top: 5,
						bottom: 5,
					},
				})
			);
		}
		return sizer;
	}
}
// let enchantment = (adjective + this.selectedNoun) as EnchantmentName;
// this.scene.closeAllIconScreens();
// this.scene.icons.backpackIcon.openScreen(enchantment);
