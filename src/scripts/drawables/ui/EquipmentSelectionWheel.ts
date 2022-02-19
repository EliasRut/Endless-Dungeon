import { EquippedItemData } from '../../worldstate/Inventory';
import { EquipmentSlot, UiDepths, UI_SCALE } from '../../helpers/constants';
import { EquipmentKey, getItemDataForName } from '../../../items/itemData';
import {
	equipItem,
	getFullDataForEquipmentSlot,
	getFullDataForItemKey,
} from '../../helpers/inventory';
import MainScene from '../../scenes/MainScene';
import ItemToken from '../tokens/WorldItemToken';
import { ScriptPlaceItem } from '../../../../typings/custom';

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
	visiblity: boolean;
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
		this.visiblity = true;
	}

	toggleVisibility() {
		this.toggleVisible();
		this.visiblity = !this.visiblity;
		this.selection?.setVisible(false);
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

	executeSelection() {
		if (this.selectedItem === -1 || this.selectedItem === undefined) {
			this.toggleVisibility();
			this.selection?.setVisible(false);
			return;
		}

		const itemKey = Object.keys(this.itemMap)[this.selectedItem!] as EquipmentKey;
		const [itemData, equipmentData] = getFullDataForItemKey(itemKey);
		if (equipmentData.level > 0) {
			equipItem(this.equipmentSlot!, itemKey);
			this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
		} else {
			this.scene.overlayScreens.itemScreen.update();
		}
		this.scene.overlayScreens.inventory.update();
		this.toggleVisibility();
		this.selection?.setVisible(false);
	}

	closeSelection() {
		this.selection?.setVisible(false);
	}

	playItemAnimation( itemToken: Phaser.GameObjects.Sprite, itemName?: string) {
		if(itemName === 'source-fire'){
			itemToken.play({ key: 'source_fire1', repeat : -1});
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
		backgroundImage.on('pointerdown', () => {
			this.toggleVisibility();
		});
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

		const images: Phaser.GameObjects.Sprite[] = [];
		const levelTexts: Phaser.GameObjects.Image[] = [];
		Object.entries(itemMap).map(([itemKey, equipmentData], itemIndex) => {
			const itemData = getItemDataForName(itemKey);
			const [xOffset, yOffset] = useEightImages
				? EIGHT_ITEMS_OFFSETS[itemIndex]
				: FOUR_ITEMS_OFFSETS[itemIndex];
			const itemImage = new Phaser.GameObjects.Sprite(
				this.scene,
				(centerX + xOffset) * UI_SCALE,
				(centerY + yOffset) * UI_SCALE,
				equipmentData.level ? 'test-items-spritesheet' : 'empty-tile',
				equipmentData.level ? itemData.iconFrame : 0
			);
			itemImage.setScale(UI_SCALE);
			this.playItemAnimation(itemImage, itemKey);
			if (equipmentData.level) {
				itemImage.on('pointerdown', () => {
					equipItem(equipmentSlot, itemKey);
					const [itemData, equipmentData] = getFullDataForItemKey(itemKey as EquipmentKey);
					this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
					this.scene.overlayScreens.inventory.update();
					this.toggleVisibility();
				});
				itemImage.on('pointerover', () => {
					const [itemData, equipmentData] = getFullDataForItemKey(itemKey as EquipmentKey);
					this.scene.overlayScreens.itemScreen.update(itemData, equipmentData);
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
