import { EquippedItemData } from '../../worldstate/Inventory';
import { EquipmentSlot, UiDepths } from '../../helpers/constants';
import { getItemDataForName } from '../../../items/itemData';
import { equipItem } from '../../helpers/inventory';
import MainScene from '../../scenes/MainScene';

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
	itemMap: { [key: string]: EquippedItemData };

	constructor(scene: Phaser.Scene) {
		super(scene);
		this.scene = scene as MainScene;

		this.setDepth(UiDepths.UI_ABOVE_FOREGROUND_LAYER);
		this.visiblity = true;
	}

	toggleVisibility() {
		this.toggleVisible();
		this.visiblity = !this.visiblity;
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

		const backgroundImage = new Phaser.GameObjects.Image(
			this.scene,
			centerX,
			centerY,
			'quickselect-wheel'
		);
		backgroundImage.on('pointerdown', () => {
			this.toggleVisibility();
		});
		backgroundImage.setInteractive();
		// ;
		this.itemMap = itemMap;

		const images: Phaser.GameObjects.Image[] = [];
		const levelTexts: Phaser.GameObjects.Image[] = [];
		const useEightImages = Object.keys(itemMap).length === 8;
		Object.entries(itemMap).map(([itemKey, equipmentData], itemIndex) => {
			const itemData = getItemDataForName(itemKey);
			const [xOffset, yOffset] = useEightImages
				? EIGHT_ITEMS_OFFSETS[itemIndex]
				: FOUR_ITEMS_OFFSETS[itemIndex];
			const itemImage = new Phaser.GameObjects.Image(
				this.scene,
				centerX + xOffset,
				centerY + yOffset,
				equipmentData.level ? 'test-items-spritesheet' : 'empty-tile',
				equipmentData.level ? itemData.iconFrame : 0
			);
			if (equipmentData.level) {
				itemImage.on('pointerdown', () => {
					equipItem(equipmentSlot, itemKey);
					this.scene.overlayScreens.inventory.update();
					this.toggleVisibility();
				});
				itemImage.setInteractive();
			}
			images.push(itemImage);
		});

		const pieces = [backgroundImage, ...images, ...levelTexts];
		pieces.forEach((piece) => {
			piece.setDepth(UiDepths.UI_ABOVE_FOREGROUND_LAYER);
			piece.setScrollFactor(0);
		});
		this.addMultiple(pieces, true);
	}
}
