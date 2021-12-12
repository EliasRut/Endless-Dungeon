import {
	Amulet,
	Catalyst,
	ChestPiece,
	EquipmentKey,
	EquippableItemType,
	equippableTypeNames,
	Ring,
	Source,
} from '../../items/itemData';
import globalState from '../worldstate';
import Character from '../worldstate/Character';
import EquippableItem, { ItemStats } from '../worldstate/EquippableItem';
import { EquippedItems } from '../worldstate/Inventory';
import Item from '../worldstate/Item';
import { EquipmentSlot, BAG_BOXES_X, BAG_BOXES_Y } from './constants';

const BASE_HEALTH = 100;
const BASE_MOVEMENT_SPEED = 200;

export const updateStats = (char: Character) => {
	const healthBeforeUpdate = char.health;
	const maxHealthBeforeUpdate = char.maxHealth;

	const itemStats = char.items.reduce((stats, item) => {
		Object.keys(item).forEach((key) => {
			const typedKey = key as keyof ItemStats;
			stats[typedKey] = (stats[typedKey] || 0) + item[typedKey];
		});
		return stats;
	}, {} as ItemStats);

	char.maxHealth = BASE_HEALTH + (itemStats.maxHealth || 0);
	char.health = healthBeforeUpdate + (char.maxHealth - maxHealthBeforeUpdate);
	char.movementSpeed = BASE_MOVEMENT_SPEED + (itemStats.movementSpeed || 0);
	char.damage = 1 + (itemStats.damage || 0);
};
// export const equipItemOnCharacter = (item: EquippableItem, char: Character) => {
// 	// tslint:disable-next-line: no-console
// 	console.log(`Equipping item ${JSON.stringify(item)}.`);
// 	char.items.push(item);
// 	updateStats(char);
// };

// export const unequipItemFromCharacter = (itemToUnequip: EquippableItem, char: Character) => {
// 	// tslint:disable-next-line: no-console
// 	console.log(`Unequipping item ${JSON.stringify(itemToUnequip)}.`);
// 	const itemIndex = char.items.findIndex((item) => item.id === itemToUnequip.id);
// 	console.log(char.items);
// 	if (itemIndex > -1) {
// 		char.items.splice(itemIndex, 1);
// 		updateStats(char);
// 	}
// };

// export const placeItemInNextFreeBagSlot = (item: Item) => {
// 	const inventory = globalState.inventory;
// 	const [x, y] = findFreeBagSlot();
// 	if (x >= 0) {
// 		inventory.bag[x][y] = 1;
// 		inventory.unequippedItemList.push({
// 			x,
// 			y,
// 			item
// 		});
// 	}
// 	return [x, y];
// };

// export const findFreeBagSlot =() => {
// 	const inventory = globalState.inventory;
// 	for (let x = 0; x < BAG_BOXES_X; x++) {
// 		for (let y = 0; y < BAG_BOXES_Y; y++) {
// 			if (inventory.bag[x][y] === 0) {
// 				return [x, y];
// 			}
// 		}
// 	}
// 	return [-1, -1]
// }

// export const unequipItem = (itemToUnequip: EquippableItem) => {
// 	const [x,y] = findFreeBagSlot();
// 	if(x == -1) return;
// 	unequipItemFromCharacter(itemToUnequip, globalState.playerCharacter);
// 	removeItemFromActiveEquippmentSlots(itemToUnequip);
// 	return placeItemInNextFreeBagSlot(itemToUnequip);
// };

// export const getSlotAndConflictsForEquipAction: (
// 	item: EquippableItem
// ) => [EquipmentSlot, (EquippableItem | undefined)[]] = (item: EquippableItem) => {

// // export const unequip = (item: Item) => {
// // 	item.unequip(globalState.playerCharacter);
// // 	this.sortIntoInventory(item.itemToken);
// 	const inventory = globalState.inventory;
// 	switch (item.type) {
// 		case EquippableItemType.SOURCE: return [EquipmentSlot.MAIN_HAND, [inventory.equippedMainhand]];
// 		case EquippableItemType.CATALYST: return [EquipmentSlot.OFF_HAND, [inventory.equippedOffhand]];
// 		case EquippableItemType.CHESTPIECE: return [EquipmentSlot.CHESTPIECE, [inventory.equippedChestpiece]];
// 		case EquippableItemType.NECKLACE: return [EquipmentSlot.NECKLACE, [inventory.equippedAmulet]];
// 		case EquippableItemType.RING:
// 			if (!inventory.equippedLeftRing) return [EquipmentSlot.LEFT_RING, []];
// 			if (!inventory.equippedRightRing) return [EquipmentSlot.RIGHT_RING, []];
// 			return [EquipmentSlot.RIGHT_RING, [inventory.equippedRightRing]];
// 	}
// 	throw new Error (`Unknown item type ${item.type} encountered.`);
// };

// export const removeItemFromBagById = (itemIdToRemove: string) => {
// 	const inventory = globalState.inventory;
// 	const itemPositionIndex = inventory.unequippedItemList.findIndex(
// 		({item}) => item.id === itemIdToRemove);
// 	if (itemPositionIndex >= 0) {
// 		const {x, y} = inventory.unequippedItemList[itemPositionIndex];
// 		inventory.bag[x][y] = 0;
// 		inventory.unequippedItemList.splice(itemPositionIndex, 1);
// 	}
// };

// export const removeItemFromBag = (itemToRemove: Item) => {
// 	removeItemFromBagById(itemToRemove.id);
// };

export const isEquippable = (item: Item) => {
	return equippableTypeNames.includes(item.type);
};

export const getItemForEquipmentSlot: (slort: EquipmentSlot) => EquipmentKey | undefined = (
	slot
) => {
	switch (slot) {
		case EquipmentSlot.AMULET:
			return globalState.inventory.equippedAmulet;
		case EquipmentSlot.LEFT_RING:
			return globalState.inventory.equippedLeftRing;
		case EquipmentSlot.RIGHT_RING:
			return globalState.inventory.equippedRightRing;
		case EquipmentSlot.CHESTPIECE:
			return globalState.inventory.equippedChestPiece;
		case EquipmentSlot.AMULET:
			return globalState.inventory.equippedAmulet;
		case EquipmentSlot.SOURCE:
			return globalState.inventory.equippedSource;
		case EquipmentSlot.CATALYST:
			return globalState.inventory.equippedCatalyst;
		default:
			return undefined;
	}
};

// export const equipItem = (item: EquippableItem) => {
// 	const inventory = globalState.inventory;
// 	const [slot, conflicts] = getSlotAndConflictsForEquipAction(item);
// 	removeItemFromBag(item);
// 	conflicts
// 		.filter((conflictingItem) => !!conflictingItem)
// 		.forEach((conflitingItem) => unequipItem(conflitingItem!));
// 	equipItemOnCharacter(item, globalState.playerCharacter);
// 	inventory[slot] = item;
// };

// export const getItemEquippmentSlot = (item: EquippableItem) => {
// 	const inventory = globalState.inventory;
// 	if (item.id === inventory.equippedMainhand?.id) return EquipmentSlot.MAIN_HAND;
// 	if (item.id === inventory.equippedOffhand?.id) return EquipmentSlot.OFF_HAND;
// 	if (item.id === inventory.equippedChestpiece?.id) return EquipmentSlot.CHESTPIECE;
// 	if (item.id === inventory.equippedAmulet?.id) return EquipmentSlot.NECKLACE;
// 	if (item.id === inventory.equippedRightRing?.id) return EquipmentSlot.RIGHT_RING;
// 	if (item.id === inventory.equippedLeftRing?.id) return EquipmentSlot.LEFT_RING;
// 	return undefined;
// };

// export const removeItemFromActiveEquippmentSlots = (item: EquippableItem) => {
// 	const inventory = globalState.inventory;
// 	const slot = getItemEquippmentSlot(item);
// 	if (slot) {
// 		inventory[slot] = undefined;
// 	}
// };

// export const isEquipped = (item: EquippableItem) => {
// 	return getItemEquippmentSlot(item) !== undefined;
// };

export const getEquippedItems: () => EquippedItems = () => {
	const inventory = globalState.inventory;
	return {
		[EquipmentSlot.SOURCE]: inventory.equippedSource,
		[EquipmentSlot.CATALYST]: inventory.equippedCatalyst,
		[EquipmentSlot.CHESTPIECE]: inventory.equippedChestPiece,
		[EquipmentSlot.AMULET]: inventory.equippedAmulet,
		[EquipmentSlot.RIGHT_RING]: inventory.equippedRightRing,
		[EquipmentSlot.LEFT_RING]: inventory.equippedLeftRing,
	};
};

// export const getUnequippedItemsWithPositions = () => {
// 	return globalState.inventory.unequippedItemList;
// };

// export const getUnequippedItemCount = (itemId: string) => {
// 	const matchingItems = globalState.inventory.unequippedItemList.filter(
// 		(item) => item.item.id === itemId);
// 	return matchingItems.reduce((sum, item) => sum + item.item.amount, 0);
// };
