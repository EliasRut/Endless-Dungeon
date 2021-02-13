import { EquipmentSlot, UiDepths } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';
import ItemToken from '../drawables/tokens/WorldItemToken';
import Item from '../worldstate/Item';
import {
	getEquippedItems,
	getUnequippedItemsWithPositions,
	isEquipped,
	unequipItem,
	equipItem,
	placeItemInNextFreeBagSlot
} from '../helpers/inventory';
import InventoryItemToken from '../drawables/tokens/InventoryItemToken';

const BOX_SIZE = 16;

const INVENTORY_START_X = 436;
const INVENTORY_START_Y = 112;

// tslint:disable: no-magic-numbers
const EQUIPMENT_SLOT_OFFSETS = {
	[EquipmentSlot.MAIN_HAND]:  [290   , 163   ],
	[EquipmentSlot.OFF_HAND]:   [402   , 163   ],
	[EquipmentSlot.CHEST]:      [346.5 , 163   ],
	[EquipmentSlot.HEAD]:       [346.5 , 119   ],
	[EquipmentSlot.GLOVES]:     [290   , 207   ],
	[EquipmentSlot.BOOTS]:      [402   , 207   ],
	[EquipmentSlot.NECKLACE]:   [374.15, 127.5 ],
	[EquipmentSlot.BELT]:       [374.15, 199.75],
	[EquipmentSlot.RIGHT_RING]: [317.9 , 199.75],
	[EquipmentSlot.LEFT_RING]:  [346.5 , 199.75]
};
// tslint:enable

export default class InventoryScreen extends OverlayScreen {
	itemTokenMap: {[id: string]: InventoryItemToken} = {};

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, 290, 120, 320, 220);
		const inventoryField = new Phaser.GameObjects.Image(scene, 414, 198, 'inventory-borders');
		inventoryField.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		inventoryField.setScrollFactor(0);
		this.add(inventoryField, true);
		// tslint:enable

		scene.add.existing(this);
		this.setVisible(false);

		const equippedItems = getEquippedItems();
		Object.keys(equippedItems)
		.filter((slotKey) => !!equippedItems[slotKey as EquipmentSlot])
		.forEach((key) => {
			const slotKey = key as EquipmentSlot;
			const item = equippedItems[slotKey]!;
			const [x, y] = EQUIPMENT_SLOT_OFFSETS[slotKey];
			if (!this.itemTokenMap[item.id]) {
				this.createItemToken(item, x, y);
			}
		});

		const uneqippedItemList = getUnequippedItemsWithPositions();
		uneqippedItemList.forEach((itemPosition) => {
			const x = INVENTORY_START_X + itemPosition.x * BOX_SIZE;
			const y = INVENTORY_START_Y + itemPosition.y * BOX_SIZE;
			const item = itemPosition.item;
			if (!this.itemTokenMap[item.id]) {
				this.createItemToken(item, x, y);
			}
		});
	}

	createItemToken(item: Item, x: number, y: number) {
		const itemToken = new InventoryItemToken(this.scene, x, y, item.iconFrame);
		this.itemTokenMap[item.id] = itemToken;
		itemToken.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		itemToken.setScrollFactor(0);
		itemToken.setInteractive();
		itemToken.setVisible(false);
		this.add(itemToken, true);
		itemToken.on('pointerdown', () => {
			if (isEquipped(item)) {
				unequipItem(item);
			} else {
				equipItem(item);
			}
			this.update();
		});
	}

	addToInventory(item: Item) {
		const [x, y] = placeItemInNextFreeBagSlot(item);
		this.createItemToken(
			item,
			INVENTORY_START_X + x * BOX_SIZE,
			INVENTORY_START_Y + y * BOX_SIZE);
	}

	update() {
		const equippedItems = getEquippedItems();
		Object.keys(equippedItems)
		.filter((slotKey) => !!equippedItems[slotKey as EquipmentSlot])
		.forEach((key) => {
			const slotKey = key as EquipmentSlot;
			const item = equippedItems[slotKey]!;
			const [x, y] = EQUIPMENT_SLOT_OFFSETS[slotKey];
			this.itemTokenMap[item.id].x = x;
			this.itemTokenMap[item.id].y = y;
		});

		const uneqippedItemList = getUnequippedItemsWithPositions();
		uneqippedItemList.forEach((itemPosition) => {
			const x = INVENTORY_START_X + itemPosition.x * BOX_SIZE;
			const y = INVENTORY_START_Y + itemPosition.y * BOX_SIZE;
			const item = itemPosition.item;
			this.itemTokenMap[item.id].x = x;
			this.itemTokenMap[item.id].y = y;
		});
	}
}
