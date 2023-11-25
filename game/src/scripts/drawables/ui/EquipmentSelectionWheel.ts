import { EquippedItemData } from '../../worldstate/Inventory';
import {
	EquipmentSlot,
	UiDepths,
	UI_SCALE,
	NORMAL_ANIMATION_FRAME_RATE,
} from '../../helpers/constants';
import { EquipmentKey, getItemDataForName, getItemTexture } from '../../../items/itemData';
import {
	attachEnchantmentItem,
	equipItem,
	getFullDataForEquipmentSlot,
	getFullDataForItemKey,
} from '../../helpers/inventory';
import MainScene from '../../scenes/MainScene';
import ItemToken from '../tokens/WorldItemToken';
import { ScriptPlaceItem } from '../../../../typings/custom';
import { EnchantmentName } from '../../../items/enchantmentData';
import globalState from '../../worldstate';

const EIGHT_ITEMS_OFFSETS = [
	[0, -40],
	[28, -28],
	[40, 0],
	[28, 28],
	[0, 40],
	[-28, 28],
	[-40, 0],
	[-28, -28],
];

const FOUR_ITEMS_OFFSETS = [
	[0, -40],
	[40, 0],
	[0, 40],
	[-40, 0],
];

export default class EquipmentSelectionWheel extends Phaser.GameObjects.Group {
	visibility: boolean;
	scene: MainScene;
	leftBorderX: number;
	topBorderY: number;
	selection?: Phaser.GameObjects.Image;
	equipmentSlot?: EquipmentSlot;
	itemMap: { [key: string]: EquippedItemData };
	selectedItem?: number;

	constructor(scene: Phaser.Scene) {
		super(scene);
		this.scene = scene as MainScene;

		this.setDepth(UiDepths.UI_ABOVE_FOREGROUND_LAYER);
		this.visibility = true;
	}

	toggleVisibility() {		
		this.toggleVisible();
		this.visibility = !this.visibility;
		this.selection?.setVisible(false);
	}

	setVisible(value: boolean, index?: number, direction?: number): this {
		super.setVisible(value, index, direction);
		this.visibility = false;
		return this;
	}

	updateSelection(xAxis: -1 | 0 | 1, yAxis: -1 | 0 | 1) {
		const numItems = Object.keys(this.itemMap).length;
		let itemIndex = -1;
		if (numItems === 8) {
			if (xAxis === 0 && yAxis === -1) itemIndex = 0;
			else if (xAxis === 1 && yAxis === -1) itemIndex = 1;
			else if (xAxis === 1 && yAxis === 0) itemIndex = 2;
			else if (xAxis === 1 && yAxis === 1) itemIndex = 3;
			else if (xAxis === 0 && yAxis === 1) itemIndex = 4;
			else if (xAxis === -1 && yAxis === 1) itemIndex = 5;
			else if (xAxis === -1 && yAxis === 0) itemIndex = 6;
			else if (xAxis === -1 && yAxis === -1) itemIndex = 7;
		} else {
			if (xAxis >= 0 && yAxis === -1) itemIndex = 0;
			else if (xAxis === 1 && yAxis >= 0) itemIndex = 1;
			else if (xAxis <= 0 && yAxis === 1) itemIndex = 2;
			else if (xAxis === -1 && yAxis <= 0) itemIndex = 3;
		}
		this.selectedItem = itemIndex;
		if (itemIndex === -1) {
			this.selection?.setVisible(false);
			this.scene.overlayScreens.itemScreen.update();
			return;
		}

		const [itemData, equipmentData] = getFullDataForItemKey(
			Object.keys(this.itemMap)[itemIndex] as EquipmentKey
		);
		if (equipmentData.level > 0) {
			this.selection?.setVisible(true);
			this.selection?.setRotation((itemIndex / numItems) * Math.PI * 2);
			this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
		}
	}

	executeSelection(enchantment?: EnchantmentName) {
		if (this.selectedItem === -1 || this.selectedItem === undefined) {
			this.toggleVisibility();
			this.selection?.setVisible(false);
			return;
		}

		const itemKey = Object.keys(this.itemMap)[this.selectedItem!] as EquipmentKey;
		if (!enchantment) {
			const [itemData, equipmentData] = getFullDataForItemKey(itemKey);
			if (equipmentData.level > 0) {
				equipItem(this.equipmentSlot!, itemKey);
				this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
			} else {
				this.scene.overlayScreens.itemScreen.update();
			}
		} else {
			console.log("APPLYING ENCHANTMENT: ", enchantment);
			attachEnchantmentItem(itemKey, enchantment);
		}
		this.scene.overlayScreens.inventory.update();
		this.toggleVisibility();
		this.selection?.setVisible(false);

		if (enchantment) {
			this.scene.closeAllIconScreens();
			this.scene.icons.enchantIcon.openScreen();
		}
	}

	closeSelection() {
		this.selection?.setVisible(false);
	}

	playItemAnimation(itemToken: Phaser.GameObjects.Sprite, itemName?: string) {
		switch (itemName) {
			case 'source-fire': {
				itemToken.play({
					key: 'source_fire1',
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
					repeat: -1,
				});
				break;
			}
			case 'source-ice': {
				itemToken.play({
					key: 'source_ice1',
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
					repeat: -1,
				});
				break;
			}
			case 'source-necrotic': {
				itemToken.play({
					key: 'source_necrotic1',
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
					repeat: -1,
				});
				break;
			}
			case 'source-arcane': {
				itemToken.play({
					key: 'source_arcane1',
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
					repeat: -1,
				});
				break;
			}
		}
	}

	update(
		centerX: number,
		centerY: number,
		equipmentSlot: EquipmentSlot,
		itemMap: { [key: string]: EquippedItemData }
	) {
		for (const child of this.children.getArray()) {
			child.destroy(true);
		}

		this.equipmentSlot = equipmentSlot;
		this.itemMap = itemMap;
		const numItems = Object.keys(itemMap).length;
		const useEightImages = numItems === 8;
		const backgroundImage = new Phaser.GameObjects.Image(
			this.scene,
			centerX * UI_SCALE,
			centerY * UI_SCALE,
			'quickselect-wheel'
		);
		backgroundImage.setInteractive();
		backgroundImage.setScale(UI_SCALE);
		this.selection = new Phaser.GameObjects.Image(
			this.scene,
			centerX * UI_SCALE,
			centerY * UI_SCALE,
			useEightImages ? 'quickselect-wheel-selection-small' : 'quickselect-wheel-selection-large'
		);
		this.selection.setVisible(false);
		this.selection.setScale(UI_SCALE);

		const images: Phaser.GameObjects.Image[] = [];
		const levelTexts: Phaser.GameObjects.Image[] = [];
		Object.entries(itemMap).map(([itemKey, equipmentData], itemIndex) => {
			const itemData = getItemDataForName(itemKey);
			if (!itemData) {
				console.log(`No data for item key ${itemKey}`);
				return;
			}
			const texture = getItemTexture(itemKey) || 'empty-tile';
			const frame = texture.startsWith('empty-tile') ? 0 : itemData.iconFrame || 0;
			const [xOffset, yOffset] = useEightImages
				? EIGHT_ITEMS_OFFSETS[itemIndex]
				: FOUR_ITEMS_OFFSETS[itemIndex];
			const itemImage = new Phaser.GameObjects.Image(
				this.scene,
				(centerX + xOffset) * UI_SCALE,
				(centerY + yOffset) * UI_SCALE,
				equipmentData.level ? getItemTexture(itemKey) : 'empty-tile',
				equipmentData.level ? frame : 0
			);
			itemImage.setScale(UI_SCALE);
			if (equipmentData.level) {
				itemImage.on('pointerdown', () => {
					this.scene.overlayScreens.inventory.interactInventory(['enter'], globalState.gameTime);
				});
				itemImage.on('pointerover', () => {
					this.selectedItem = itemIndex;
					const [itemData, equipmentData] = getFullDataForItemKey(itemKey as EquipmentKey);
					this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);					
					// this.scene.overlayScreens.inventory.focusedSlot = equipmentSlot;
					this.selection?.setVisible(true);
					this.selection?.setRotation((itemIndex / numItems) * Math.PI * 2);
				});
				itemImage.setInteractive();
			}
			images.push(itemImage);
		});

		const pieces = [backgroundImage, this.selection, ...images, ...levelTexts];
		pieces.forEach((piece) => {
			piece.setDepth(UiDepths.UI_ABOVE_FOREGROUND_LAYER);
			piece.setScrollFactor(0);
			piece.setScale(UI_SCALE);
		});
		this.addMultiple(pieces, true);
	}
}
