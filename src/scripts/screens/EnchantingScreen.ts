import Button from 'phaser3-rex-plugins/plugins/button';
import {
	Buttons,
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
const NOUN_START_X = (SCREEN_START_X + 300) * UI_SCALE;
const NOUN_START_Y = (SCREEN_START_Y + 50) * UI_SCALE;

const ADJECTIVE_START_X = (SCREEN_START_X + 70) * UI_SCALE;
const ADJECTIVE_START_Y = (SCREEN_START_Y + 50) * UI_SCALE;

const LIST_START_X = (SCREEN_START_X + 25) * UI_SCALE;
const LIST_START_Y = (SCREEN_START_Y + 50) * UI_SCALE;

const ESSENCE_START_X = (SCREEN_START_X + 300) * UI_SCALE;
const ESSENCE_START_Y = (SCREEN_START_Y + 175) * UI_SCALE;
const ESSENCE_SEPARATOR = 50 * UI_SCALE;
const ESSENCE_NUMBER_OFFSET = 15 * UI_SCALE;

const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

export default class EnchantingScreen extends OverlayScreen {
	title: Phaser.GameObjects.Text;
	essenTokens: InventoryItemToken[];
	essenceNumbers: Phaser.GameObjects.Text[] = [];
	enchantmentName: Phaser.GameObjects.Text;
	enchantmentModifier: Phaser.GameObjects.Text;
	scrollablePanel: ScrollablePanel;
	enchantments: EnchantmentName[];
	selectedEnchantment: EnchantmentName = 'None';

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
				backgroundColor: 'black'
			}
		);
		this.title.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.title.setScrollFactor(0);
		this.title.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.title, true);
		
		this.enchantments = this.getEnchantments();
		this.scrollablePanel = this.createList(
			scene,
			LIST_START_X,
			LIST_START_Y,
			SCREEN_HEIGHT * UI_SCALE - (LIST_START_Y - SCREEN_START_Y),
			SCREEN_WIDTH / 2 * UI_SCALE,
			this.enchantments,
			() => {}
		);
		this.add(this.scrollablePanel, true);
		//----------------------------------------------------------------------------------------
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
		const enchantment = Enchantment[this.selectedEnchantment];
		this.enchantmentName = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			NOUN_START_Y,
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
		const stat = enchantment!.affectedStat;
		const string = stat ? `${statDisplayNames[enchantment!.affectedStat!.stat]}: `.padEnd(18) +
		`${enchantment?.affectedStat?.value}` : '';
		this.enchantmentModifier = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			NOUN_START_Y + ESSENCE_NUMBER_OFFSET,
			string,
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
		// let enchantment = Enchantment[(this.selectedAdjective + this.selectedNoun) as EnchantmentName];
		const enchantment = Enchantment[this.selectedEnchantment];
		this.enchantmentName.setText(`${enchantment?.name}`);
		const stat = enchantment!.affectedStat;		
		const string = stat ? `${statDisplayNames[enchantment!.affectedStat!.stat]}: `.padEnd(18) +
		`${enchantment?.affectedStat?.value}` : '';
		this.enchantmentModifier.setText(string);
	}

	createList(scene: Phaser.Scene, x: number, y: number, height: number, width: number, enchants: Array<EnchantmentName>, onClick: (button: any)=>any) {
		var items = enchants.map(function (enchant) { return { label: Enchantment[enchant]!.name } });
		const notSelf = this;
		// Note: Buttons and scrolling are at different touch targets
		scene.input.topOnly = false;
		var buttonSizer = new Buttons(scene, {
			orientation: 'y',
			buttons: items.map(function (item) {
				return notSelf.createButton(scene, item);
			}),
		})
			.on('button.over', function (button: any) {
				button.getElement('background').setStrokeStyle(1, 0xffffff);
			})
			.on('button.out', function (button: any) {
				button.getElement('background').setStrokeStyle();
			})
			.on('button.click', function (button: Label) {
				Object.entries(Enchantment).forEach(entry => {
					if(entry[1].name === button.text) {
						notSelf.selectedEnchantment = entry[0] as EnchantmentName;						
						notSelf.update();
					}
				});				
			})
			.layout();			

		var menu = new ScrollablePanel(scene, {
			x: x + (width / 2),
			y: y + (Math.min(height, buttonSizer.height) / 2),
			width: width,
			height: Math.min(height, buttonSizer.height),
			scrollMode: 'v',

			panel: {
				child: buttonSizer,
			},
			mouseWheelScroller: {
				focus: false,
				speed: 0.25,
			},
			slider: {
				track: scene.add.existing(new RoundRectangle(scene, 0, 0, 0, 0, 5 * UI_SCALE, COLOR_DARK)),
				thumb: scene.add.existing(new RoundRectangle(scene, 0, 0, 0, 0, 5 * UI_SCALE, COLOR_LIGHT)),
				// position: 'left'
			},
			clamplChildOY: true,

		}).layout();
	
			menu.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			menu.setScrollFactor(0);
			menu.setOrigin(0);
			menu.setVisible(false);
		return menu;
	}
	
	createButton(scene: Phaser.Scene, item: {label: string}) {
		const space = 10 * UI_SCALE;
		return new Label(scene, {
			background: scene.add.existing(new RoundRectangle(scene, 0, 0, space, space, 0, COLOR_DARK)),
	
			text: this.createTextObject(scene, space, item.label),

			space: {
				left: space,
				right: space,
				top: space,
				bottom: space,
			},
			align : 'center'
		})		
	}
	createTextObject(scene: Phaser.Scene, size: number, text: string) {
		var textObject = scene.add.text(0, 0, text, {
			fontSize: `${size}px`,
			fontFamily: 'endlessDungeon',
		})
		return textObject;
	}	
	getEnchantments(){
		let result: EnchantmentName[] = [];
		Object.keys(Enchantment).forEach(enchant => {
			result.push(enchant as EnchantmentName);
		});
		return result;
	}
}
// let enchantment = (adjective + this.selectedNoun) as EnchantmentName;
// this.scene.closeAllIconScreens();
// this.scene.icons.backpackIcon.openScreen(enchantment);
