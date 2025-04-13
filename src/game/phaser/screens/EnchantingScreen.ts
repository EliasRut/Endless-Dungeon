import {
	Buttons,
	Label,
	RoundRectangle,
	ScrollablePanel,
} from 'phaser3-rex-plugins/templates/ui/ui-components';
import { Enchantment, EnchantmentName } from '../../../data/enchantmentData';
import InventoryItemToken from '../drawables/tokens/InventoryItemToken';
import {
	ColorsOfMagic,
	NORMAL_ANIMATION_FRAME_RATE,
	statDisplayNames,
	UiDepths,
	UI_SCALE,
	EquipmentSlot,
} from '../helpers/constants';
import MainScene from '../scenes/MainScene';
import worldstate from '../worldState';
import OverlayScreen from './OverlayScreen';
import { getItemDataForName } from '../../../data/itemData';
import { Catalyst, ChestPiece, EquipmentKey, Ring, Source } from '../../../types/Item';
import { attachEnchantmentItem, getEquipmentDataForItemKey } from '../helpers/inventory';

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;
const SCALED_WINDOW_HEIGHT = window.innerHeight / UI_SCALE;

const SCREEN_WIDTH = 700;
const SCREEN_HEIGHT = 350;
const SCREEN_START_X = (SCALED_WINDOW_WIDTH - SCREEN_WIDTH) / 2;
const SCREEN_START_Y = (SCALED_WINDOW_HEIGHT - (SCREEN_HEIGHT - 60)) / 2;

const ENCHANT_BTN_X = (SCREEN_START_X + 540) * UI_SCALE;
const ENCHANT_BTN_Y = (SCREEN_START_Y + 305) * UI_SCALE;
const NOUN_START_X = (SCREEN_START_X + 490) * UI_SCALE;
const ITEM_NAME_Y = (SCREEN_START_Y + 12) * UI_SCALE;
2;
const CURRENT_ENCHANTMENT_START_Y = (SCREEN_START_Y + 30) * UI_SCALE;
const SELECTED_ENCHANTMENT_START_Y = (SCREEN_START_Y + 110) * UI_SCALE;

const LIST_START_X = (SCREEN_START_X + 248) * UI_SCALE;
const LIST_START_Y = (SCREEN_START_Y + 30) * UI_SCALE;
const LIST_WIDTH = 200 * UI_SCALE;
const LIST_HEIGHT = 295 * UI_SCALE;

const ESSENCE_START_X = (SCREEN_START_X + 490) * UI_SCALE;
const ESSENCE_START_Y = (SCREEN_START_Y + 215) * UI_SCALE;
const ESSENCE_SEPARATOR = 50 * UI_SCALE;
const ESSENCE_NUMBER_OFFSET = 15 * UI_SCALE;

const COLOR_PRIMARY = 0x4e342e;
const COLOR_BACKGROUND = 0x232323;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;

const EQUIPMENT_SLOT_SPRITESHEETS = {
	[EquipmentSlot.SOURCE]: 'empty-tile-large-portrait',
	[EquipmentSlot.CATALYST]: 'catalyst-spritesheet',
	[EquipmentSlot.CHESTPIECE]: 'armor-spritesheet',
	[EquipmentSlot.AMULET]: 'test-items-spritesheet',
	[EquipmentSlot.RIGHT_RING]: 'test-items-spritesheet',
	[EquipmentSlot.LEFT_RING]: 'test-items-spritesheet',
};

export default class EnchantingScreen extends OverlayScreen {
	title: Phaser.GameObjects.Text;
	itemTokens: InventoryItemToken[] = [];
	essenceNumbers: Phaser.GameObjects.Text[] = [];
	currentEnchantmentName: Phaser.GameObjects.Text;
	currentEnchantmentModifier: Phaser.GameObjects.Text;
	newEnchantmentName: Phaser.GameObjects.Text;
	newEnchantmentModifier: Phaser.GameObjects.Text;
	scrollablePanel: ScrollablePanel;
	enchantments: EnchantmentName[];
	selectedEnchantment: EnchantmentName = 'None';
	enchantmentButton: Phaser.GameObjects.Text;
	enchantmentBlocked: boolean = true;
	activeItem: EquipmentKey = Source.FIRE;

	detailLabel: Phaser.GameObjects.Text;

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
			(SCREEN_START_X + 24) * UI_SCALE,
			(SCREEN_START_Y - 7) * UI_SCALE,
			'ENCHANT',
			{
				color: 'white',
				fontSize: `${14 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		this.title.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.title.setScrollFactor(0);
		this.title.setShadow(1 * UI_SCALE, 1 * UI_SCALE, 'black');
		this.add(this.title, true);

		const lblSource = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_START_X + 12) * UI_SCALE,
			(SCREEN_START_Y + 12) * UI_SCALE,
			'Source',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		lblSource.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		lblSource.setScrollFactor(0);
		lblSource.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(lblSource, true);

		[Source.FIRE, Source.ICE, Source.ARCANE, Source.NECROTIC].forEach((source, index) => {
			const itemToken = this.createItemToken(
				EquipmentSlot.SOURCE,
				source,
				(SCREEN_START_X + 30 + index * 48) * UI_SCALE,
				(SCREEN_START_Y + 52) * UI_SCALE
			);
			this.itemTokens.push(itemToken);
			if (source === Source.FIRE) {
				itemToken.setScale(UI_SCALE * 1);
				itemToken.active = true;
			}
		});

		const lblCatalyst = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_START_X + 12) * UI_SCALE,
			(SCREEN_START_Y + 82) * UI_SCALE,
			'Catalyst',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		lblCatalyst.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		lblCatalyst.setScrollFactor(0);
		lblCatalyst.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(lblCatalyst, true);

		[Catalyst.CONE, Catalyst.NOVA, Catalyst.STORM, Catalyst.SUMMON].forEach((catalyst, index) => {
			const itemToken = this.createItemToken(
				EquipmentSlot.CATALYST,
				catalyst,
				(SCREEN_START_X + 30 + index * 48) * UI_SCALE,
				(SCREEN_START_Y + 117) * UI_SCALE
			);
			this.itemTokens.push(itemToken);
		});

		const lblRobe = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_START_X + 12) * UI_SCALE,
			(SCREEN_START_Y + 152) * UI_SCALE,
			'Robe',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		lblRobe.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		lblRobe.setScrollFactor(0);
		lblRobe.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(lblRobe, true);

		[ChestPiece.ROBE, ChestPiece.CLOAK, ChestPiece.GARB, ChestPiece.ARMOR].forEach(
			(robe, index) => {
				const itemToken = this.createItemToken(
					EquipmentSlot.CHESTPIECE,
					robe,
					(SCREEN_START_X + 30 + index * 48) * UI_SCALE,
					(SCREEN_START_Y + 187) * UI_SCALE
				);
				this.itemTokens.push(itemToken);
			}
		);

		const lblRing = new Phaser.GameObjects.Text(
			scene,
			(SCREEN_START_X + 12) * UI_SCALE,
			(SCREEN_START_Y + 222) * UI_SCALE,
			'Ring',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		lblRing.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		lblRing.setScrollFactor(0);
		lblRing.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(lblRing, true);

		[Ring.BLOOD, Ring.CHANGE, Ring.DEATH, Ring.FLUX].forEach((ring, index) => {
			const itemToken = this.createItemToken(
				EquipmentSlot.RIGHT_RING,
				ring,
				(SCREEN_START_X + 30 + index * 48) * UI_SCALE,
				(SCREEN_START_Y + 262) * UI_SCALE
			);
			this.itemTokens.push(itemToken);
		});
		[Ring.METAL, Ring.PASSION, Ring.ROYAL, Ring.WILD].forEach((ring, index) => {
			const itemToken = this.createItemToken(
				EquipmentSlot.RIGHT_RING,
				ring,
				(SCREEN_START_X + 30 + index * 48) * UI_SCALE,
				(SCREEN_START_Y + 292) * UI_SCALE
			);
			this.itemTokens.push(itemToken);
		});

		const lblEnchantments = new Phaser.GameObjects.Text(
			scene,
			LIST_START_X,
			(SCREEN_START_Y + 12) * UI_SCALE,
			'Enchantments',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		lblEnchantments.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		lblEnchantments.setScrollFactor(0);
		lblEnchantments.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(lblEnchantments, true);

		this.enchantmentButton = new Phaser.GameObjects.Text(
			scene,
			ENCHANT_BTN_X,
			ENCHANT_BTN_Y,
			'Enchant',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
				backgroundColor: 'black',
				padding: { x: 8 * UI_SCALE, y: 4 * UI_SCALE },
			}
		);
		this.enchantmentButton.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.enchantmentButton.setScrollFactor(0);
		this.enchantmentButton.setShadow(0, 1 * UI_SCALE, 'black');
		this.enchantmentButton.setInteractive();
		this.enchantmentButton.on('pointerdown', () => {
			if (this.enchantmentBlocked) {
				console.log('NOT ENOUGH RESOURCES!');
				return;
			} else {
				console.log('Enchanting!');
				attachEnchantmentItem(this.activeItem, this.selectedEnchantment);
				this.applyEnchantment(this.selectedEnchantment);
				this.scene.closeAllIconScreens();
			}
		});
		this.add(this.enchantmentButton, true);

		this.enchantments = this.getEnchantments();
		this.scrollablePanel = this.createList(
			scene,
			LIST_START_X,
			LIST_START_Y,
			LIST_HEIGHT,
			LIST_WIDTH,
			this.enchantments
		);
		this.add(this.scrollablePanel, true);
		// ----------------------------------------------------------------------------------------
		let counter = 0;
		Object.values(ColorsOfMagic).forEach((essence) => {
			const essenceToken = new InventoryItemToken(
				this.scene,
				ESSENCE_START_X + ESSENCE_SEPARATOR * (counter % (Object.values(ColorsOfMagic).length / 2)),
				ESSENCE_START_Y +
					ESSENCE_SEPARATOR * Math.round(counter / Object.values(ColorsOfMagic).length),
				'empty-tile',
				-1
			);

			essenceToken.setDepth(UiDepths.UI_FOREGROUND_LAYER);
			essenceToken.setScrollFactor(0);
			essenceToken.setVisible(false);
			this.playEssenceAnimation(essenceToken, essence);
			essenceToken.setScale(UI_SCALE);
			this.add(essenceToken, true);
			counter++;
		});
		// -------------------------------------------------------------------------------------
		counter = 0;
		Object.values(ColorsOfMagic).forEach((essence) => {
			this.essenceNumbers[counter] = new Phaser.GameObjects.Text(
				this.scene,
				ESSENCE_START_X + ESSENCE_SEPARATOR * (counter % (Object.values(ColorsOfMagic).length / 2)),
				ESSENCE_START_Y +
					ESSENCE_SEPARATOR * Math.round(counter / Object.values(ColorsOfMagic).length) +
					ESSENCE_NUMBER_OFFSET,
				`${worldstate.inventory.essences[essence]}`,
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
		const currentItem = getEquipmentDataForItemKey(Source.FIRE);
		const currentEnchantment = Enchantment[currentItem.enchantment];
		this.currentEnchantmentName = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			CURRENT_ENCHANTMENT_START_Y + ESSENCE_NUMBER_OFFSET,
			`${currentEnchantment?.name || 'No Enchantment'}`,
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		this.currentEnchantmentName.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.currentEnchantmentName.setScrollFactor(0);
		this.currentEnchantmentName.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.currentEnchantmentName, true);
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		// -------------------------------------------------------------------------------------
		const currentStat = currentEnchantment?.affectedStat;
		const currentStatText = currentStat
			? `${statDisplayNames[currentEnchantment?.affectedStat!.stat]}: `.padEnd(18) +
			  `${currentEnchantment?.affectedStat?.value}`
			: '';
		this.currentEnchantmentModifier = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			CURRENT_ENCHANTMENT_START_Y + 2 * ESSENCE_NUMBER_OFFSET,
			currentStatText,
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		this.currentEnchantmentModifier.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.currentEnchantmentModifier.setScrollFactor(0);
		this.currentEnchantmentModifier.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.currentEnchantmentModifier, true);
		scene.add.existing(this);

		// -------------------------------------------------------------------------------------
		const newEnchantment = Enchantment[this.selectedEnchantment];
		this.newEnchantmentName = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			SELECTED_ENCHANTMENT_START_Y + ESSENCE_NUMBER_OFFSET,
			`${newEnchantment?.name}`,
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		this.newEnchantmentName.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.newEnchantmentName.setScrollFactor(0);
		this.newEnchantmentName.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.newEnchantmentName, true);
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
		// -------------------------------------------------------------------------------------
		const stat = newEnchantment!.affectedStat;
		const statText = stat
			? `${statDisplayNames[newEnchantment!.affectedStat!.stat]}: `.padEnd(18) +
			  `${newEnchantment?.affectedStat?.value}`
			: '';
		this.newEnchantmentModifier = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			SELECTED_ENCHANTMENT_START_Y + 2 * ESSENCE_NUMBER_OFFSET,
			statText,
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
			}
		);
		this.newEnchantmentModifier.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.newEnchantmentModifier.setScrollFactor(0);
		this.newEnchantmentModifier.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.newEnchantmentModifier, true);
		scene.add.existing(this);

		// -------------------------------------------------------------------------------------
		this.detailLabel = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			ITEM_NAME_Y,
			getItemDataForName(Source.FIRE).name,
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		this.detailLabel.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.detailLabel.setScrollFactor(0);
		this.detailLabel.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.detailLabel, true);

		const currentEnchantmentLbl = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			CURRENT_ENCHANTMENT_START_Y,
			'Current Enchantment',
			{
				color: 'grey',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		currentEnchantmentLbl.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		currentEnchantmentLbl.setScrollFactor(0);
		currentEnchantmentLbl.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(currentEnchantmentLbl, true);

		const nextEnchantmentLbl = new Phaser.GameObjects.Text(
			scene,
			NOUN_START_X,
			SELECTED_ENCHANTMENT_START_Y,
			'Selected Enchantment',
			{
				color: 'grey',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'left',
			}
		);
		nextEnchantmentLbl.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		nextEnchantmentLbl.setScrollFactor(0);
		nextEnchantmentLbl.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(nextEnchantmentLbl, true);

		this.setVisible(false);
		this.visibility = false;
	}

	playEssenceAnimation(itemToken: InventoryItemToken, essenceName: string) {
		const animation = 'essence_' + essenceName;
		if (this.scene.game.anims.exists(animation)) {
			itemToken.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE, repeat: -1 });
		}
	}

	update() {
		const essences = worldstate.inventory.essences;
		const enchantment = Enchantment[this.selectedEnchantment];
		let counter = 0;
		let blocking = false;
		Object.values(ColorsOfMagic).forEach((essence) => {
			const available = essences[essence];
			let required = 0;
			if (enchantment && enchantment.cost) {
				enchantment.cost.forEach((cost) => {
					if (cost.essence == essence) required = cost.amount;
				});
			}
			let text = `${available}`;
			if (required > 0) {
				text += `(${required})`;
				if (required > available) {
					blocking = true;
					this.essenceNumbers[counter].setColor('red');
				} else this.essenceNumbers[counter].setColor('green');
			} else this.essenceNumbers[counter].setColor('white');
			this.enchantmentBlocked = blocking;
			this.essenceNumbers[counter].setText(text);
			counter++;
		});
		this.newEnchantmentName.setText(`${enchantment?.name}`);
		const stat = enchantment!.affectedStat;
		const modifierText = stat
			? `${statDisplayNames[enchantment!.affectedStat!.stat]}: `.padEnd(18) +
			  `${enchantment?.affectedStat?.value}`
			: '';
		this.newEnchantmentModifier.setText(modifierText);
	}

	createList(
		scene: Phaser.Scene,
		x: number,
		y: number,
		height: number,
		width: number,
		enchants: EnchantmentName[]
	) {
		const enchantmentNames = enchants.map((enchant) => {
			return { label: Enchantment[enchant]!.name };
		});
		const notSelf = this;
		// Note: Buttons and scrolling are at different touch targets
		scene.input.topOnly = false;
		const enchantmentButtons = enchantmentNames.map((enchantment) =>
			this.createButton(scene, enchantment)
		);
		const buttonSizer = new Buttons(scene, {
			orientation: 'y',
			buttons: enchantmentButtons,
		})
			.on('button.over', (button: any) => {
				button.getElement('background').setStrokeStyle(1, 0xffffff);
			})
			.on('button.out', (button: any) => {
				button.getElement('background').setStrokeStyle();
			})
			.on('button.click', (button: Label) => {
				let clickedEnchantment = Object.entries(Enchantment).find((entry) => {
					return entry[1].name === button.text;
				});
				if (clickedEnchantment) {
					notSelf.selectedEnchantment = clickedEnchantment[0] as EnchantmentName;
					notSelf.update();
				}
			})
			.layout();

		const menu = new ScrollablePanel(scene, {
			x: x + width / 2,
			y: y + Math.min(height, buttonSizer.height) / 2,
			width,
			height, //500, //Math.min(height, buttonSizer.height),
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
			clampChildOY: true,
		}).layout();

		menu.setDepth(UiDepths.UI_ABOVE_FOREGROUND_LAYER);
		menu.setScrollFactor(0);
		menu.setOrigin(0);
		menu.setVisible(false);
		return menu;
	}

	createButton(scene: Phaser.Scene, item: { label: string }) {
		const space = 10 * UI_SCALE;
		const lbl = new Label(scene, {
			background: scene.add.existing(
				new RoundRectangle(scene, 0, 0, space, space, 0, COLOR_BACKGROUND)
			),

			text: this.createTextObject(scene, space, item.label),

			space: {
				left: space,
				right: space,
				top: space / 2,
				bottom: space / 2,
			},
			align: 'left',
		});
		scene.add.existing(lbl);
		lbl.setDepth(UiDepths.UI_ABOVE_FOREGROUND_LAYER);
		return lbl;
	}

	createTextObject(scene: Phaser.Scene, size: number, text: string) {
		const textObject = scene.add.text(0, 0, text, {
			fontSize: `${size}px`,
			fontFamily: 'endlessDungeon',
		});
		return textObject;
	}

	getEnchantments() {
		const result: EnchantmentName[] = [];
		Object.keys(Enchantment).forEach((enchant) => {
			result.push(enchant as EnchantmentName);
		});
		return result;
	}

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

	playItemAnimation(itemToken: InventoryItemToken, itemName?: string) {
		const animation = itemName + '1';
		if (this.scene.game.anims.exists(animation)) {
			itemToken.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE, repeat: -1 });
		}
	}

	createItemToken(slotName: EquipmentSlot, itemName: EquipmentKey, x: number, y: number) {
		const itemData = getItemDataForName(itemName);

		const itemToken = new InventoryItemToken(
			this.scene,
			x,
			y,
			EQUIPMENT_SLOT_SPRITESHEETS[slotName] || 'empty-tile',
			itemData?.iconFrame || -1
		);

		itemToken.setDepth(UiDepths.UI_ABOVE_FOREGROUND_LAYER);
		itemToken.setScrollFactor(0);
		itemToken.setInteractive();
		itemToken.setVisible(true);
		this.playItemAnimation(itemToken, itemName);
		itemToken.setScale(UI_SCALE * 0.8);
		this.add(itemToken, true);
		itemToken.on('pointerdown', () => {
			console.log('Clicked on item token!');
			this.activeItem = itemName;
			itemToken.setScale(UI_SCALE * 1);
			this.itemTokens.forEach((token) => {
				if (token !== itemToken) {
					token.setScale(UI_SCALE * 0.8);
					token.isSelected = false;
				}
			});
			itemToken.isSelected = true;
			this.detailLabel.setText(itemData.name);
			const itemActiveData = getEquipmentDataForItemKey(itemName);
			const enchantment = itemActiveData.enchantment
				? Enchantment[itemActiveData.enchantment]
				: undefined;
			this.currentEnchantmentName.setText(enchantment?.name || 'No Enchantment');
			if (enchantment) {
				const stat = enchantment.affectedStat;
				const modifierText = stat
					? `${statDisplayNames[enchantment.affectedStat!.stat]}: `.padEnd(18) +
					  `${enchantment.affectedStat!.value}`
					: '';
				this.currentEnchantmentModifier.setText(modifierText);
			} else {
				this.currentEnchantmentModifier.setText('');
			}
		});
		itemToken.on('pointerover', () => {
			itemToken.setScale(UI_SCALE * 0.9);
		});
		itemToken.on('pointerout', () => {
			if (!itemToken.isSelected) {
				itemToken.setScale(UI_SCALE * 0.8);
			}
		});
		return itemToken;
	}
}
