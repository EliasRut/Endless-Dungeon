import { EquipmentSlot, UiDepths } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';
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
import { isEquippable } from '../helpers/inventory';
import EquippableItem from '../worldstate/EquippableItem';

const INVENTORY_START_X = 500;
const INVENTORY_START_Y = 198;
const INVENTORY_BORDER_OFFSET_X = 53;
const INVENTORY_BORDER_OFFSET_Y = 103;
const INVENTORY_BORDER_X = INVENTORY_START_X - INVENTORY_BORDER_OFFSET_X;
const INVENTORY_BORDER_Y = INVENTORY_START_Y - INVENTORY_BORDER_OFFSET_Y;

const BOX_SIZE = 16;

const BAG_OFFSET_X = 56;
const BAG_OFFSET_Y = -61;
const BAG_START_X = INVENTORY_START_X - BAG_OFFSET_X;
const BAG_START_Y = INVENTORY_START_Y - BAG_OFFSET_Y;

// tslint:disable: no-magic-numbers
const EQUIPMENT_SLOT_COORDINATES = {
	[EquipmentSlot.MAIN_HAND]:  [INVENTORY_START_X - 42  , INVENTORY_START_Y - 80  ],
	[EquipmentSlot.OFF_HAND]:   [INVENTORY_START_X + 42  , INVENTORY_START_Y - 80  ],
	[EquipmentSlot.CHEST]:      [INVENTORY_START_X + 0   , INVENTORY_START_Y - 70  ],
	[EquipmentSlot.HEAD]:       [346.5 , 119   ],
	[EquipmentSlot.GLOVES]:     [290   , 207   ],
	[EquipmentSlot.BOOTS]:      [402   , 207   ],
	[EquipmentSlot.NECKLACE]:   [INVENTORY_START_X + 0   , INVENTORY_START_Y - 107 ],
	[EquipmentSlot.BELT]:       [374.15, 199.75],
	[EquipmentSlot.RIGHT_RING]: [INVENTORY_START_X + 42.5, INVENTORY_START_Y - 45.5],
	[EquipmentSlot.LEFT_RING]:  [INVENTORY_START_X - 41  , INVENTORY_START_Y - 45.5]
};
// tslint:enable

export default class InventoryScreen extends OverlayScreen {
	itemTokenMap: {[id: string]: InventoryItemToken} = {};
	focusedItem: Item;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, INVENTORY_BORDER_X, INVENTORY_BORDER_Y, 175, 280);
		const inventoryField = new Phaser.GameObjects.Image(scene, INVENTORY_START_X, INVENTORY_START_Y, 'inventory-borders');
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
			const [x, y] = EQUIPMENT_SLOT_COORDINATES[slotKey];
			if (!this.itemTokenMap[item.id]) {
				this.createItemToken(item, x, y);
			}
		});

		const uneqippedItemList = getUnequippedItemsWithPositions();
		uneqippedItemList.forEach((itemPosition) => {
			const x = BAG_START_X + itemPosition.x * BOX_SIZE;
			const y = BAG_START_Y + itemPosition.y * BOX_SIZE;
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
			if (this.focusedItem === item) {
				if (isEquippable(item)) {
					const equippableItem = item as EquippableItem;
					if (isEquipped(equippableItem)) {
						unequipItem(equippableItem);
					} else {
						equipItem(equippableItem);
					}
					this.update();
				}
			} else {
				this.focusedItem = item;
			}
		});
	}

	addToInventory(item: Item) {
		const [x, y] = placeItemInNextFreeBagSlot(item);
		this.createItemToken(
			item,
			BAG_START_X + x * BOX_SIZE,
			BAG_START_Y + y * BOX_SIZE);
	}

	update() {
		const equippedItems = getEquippedItems();
		Object.keys(equippedItems)
		.filter((slotKey) => !!equippedItems[slotKey as EquipmentSlot])
		.forEach((key) => {
			const slotKey = key as EquipmentSlot;
			const item = equippedItems[slotKey]!;
			const [x, y] = EQUIPMENT_SLOT_COORDINATES[slotKey];
			this.itemTokenMap[item.id].x = x;
			this.itemTokenMap[item.id].y = y;
		});

		const uneqippedItemList = getUnequippedItemsWithPositions();
		uneqippedItemList.forEach((itemPosition) => {
			const x = BAG_START_X + itemPosition.x * BOX_SIZE;
			const y = BAG_START_Y + itemPosition.y * BOX_SIZE;
			const item = itemPosition.item;
			this.itemTokenMap[item.id].x = x;
			this.itemTokenMap[item.id].y = y;
		});
	}
}
