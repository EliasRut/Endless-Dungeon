import { EquippableItemType, equippableTypeNames } from '../../items/itemData';
import globalState from '../worldstate';
import Character from '../worldstate/Character';
import EquippableItem, { ItemStats } from '../worldstate/EquippableItem';
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
	char.mainStat = 1 + (itemStats.mainStat || 0);
	char.damage = (1 + (itemStats.damage || 0)) * char.mainStat;
};

export const equipItemOnCharacter = (item: EquippableItem, char: Character) => {
	// tslint:disable-next-line: no-console
	console.log(`Equipping item ${JSON.stringify(item)}.`);
	char.items.push(item);
	updateStats(char);
};

export const unequipItemFromCharacter = (itemToUnequip: EquippableItem, char: Character) => {
	// tslint:disable-next-line: no-console
	console.log(`Unequipping item ${JSON.stringify(itemToUnequip)}.`);
	const itemIndex = char.items.findIndex((item) => item === itemToUnequip);
	if (itemIndex > -1) {
		char.items.splice(itemIndex, 1);
		updateStats(char);
	}
};

export const placeItemInNextFreeBagSlot = (item: Item) => {
	const inventory = globalState.inventory;
	for (let x = 0; x < BAG_BOXES_X; x++) {
		for (let y = 0; y < BAG_BOXES_Y; y++) {
			if (inventory.bag[x][y] === 0) {
				inventory.bag[x][y] = 1;
				inventory.unequippedItemList.push({
					x,
					y,
					item
				});
				return [x, y];
			}
		}
	}
	throw new Error('No slot for item found.');
};

export const unequipItem = (itemToUnequip: EquippableItem) => {
	unequipItemFromCharacter(itemToUnequip, globalState.playerCharacter);
	removeItemFromActiveEquippmentSlots(itemToUnequip);
	return placeItemInNextFreeBagSlot(itemToUnequip);
};

export const getSlotAndConflictsForEquipAction: (
	item: EquippableItem
) => [EquipmentSlot, (EquippableItem | undefined)[]] = (item: EquippableItem) => {

// export const unequip = (item: Item) => {
// 	item.unequip(globalState.playerCharacter);
// 	this.sortIntoInventory(item.itemToken);
	const inventory = globalState.inventory;
	switch (item.type) {
		case EquippableItemType.SOURCE: return [EquipmentSlot.MAIN_HAND, [inventory.mainhand]];
		case EquippableItemType.CATALYST: return [EquipmentSlot.OFF_HAND, [inventory.offhand]];
		case EquippableItemType.CHESTPIECE: return [EquipmentSlot.CHESTPIECE, [inventory.chestpiece]];
		case EquippableItemType.NECKLACE: return [EquipmentSlot.NECKLACE, [inventory.necklace]];
		case EquippableItemType.RING:
			if (!inventory.rightRing) return [EquipmentSlot.RIGHT_RING, []];
			if (!inventory.leftRing) return [EquipmentSlot.LEFT_RING, []];
			return [EquipmentSlot.RIGHT_RING, [inventory.rightRing]];
	}
	throw new Error (`Unknown item type ${item.type} encountered.`);
};

export const removeItemFromBagById = (itemIdToRemove: string) => {
	const inventory = globalState.inventory;
	const itemPositionIndex = inventory.unequippedItemList.findIndex(
		({item}) => item.id === itemIdToRemove);
	if (itemPositionIndex >= 0) {
		const {x, y} = inventory.unequippedItemList[itemPositionIndex];
		inventory.bag[x][y] = 0;
		inventory.unequippedItemList.splice(itemPositionIndex, 1);
	}
};

export const removeItemFromBag = (itemToRemove: Item) => {
	removeItemFromBagById(itemToRemove.id);
};

export const isEquippable = (item: Item) => {
	return equippableTypeNames.includes(item.type);
};

export const equipItem = (item: EquippableItem) => {
	const inventory = globalState.inventory;
	const [slot, conflicts] = getSlotAndConflictsForEquipAction(item);
	removeItemFromBag(item);
	conflicts
		.filter((conflictingItem) => !!conflictingItem)
		.forEach((conflitingItem) => unequipItem(conflitingItem!));
	equipItemOnCharacter(item, globalState.playerCharacter);
	inventory[slot] = item;
};

export const getItemEquippmentSlot = (item: EquippableItem) => {
	const inventory = globalState.inventory;
	if (item.id === inventory.mainhand?.id) return EquipmentSlot.MAIN_HAND;
	if (item.id === inventory.offhand?.id) return EquipmentSlot.OFF_HAND;
	if (item.id === inventory.chestpiece?.id) return EquipmentSlot.CHESTPIECE;
	if (item.id === inventory.necklace?.id) return EquipmentSlot.NECKLACE;
	if (item.id === inventory.rightRing?.id) return EquipmentSlot.RIGHT_RING;
	if (item.id === inventory.leftRing?.id) return EquipmentSlot.LEFT_RING;
	return undefined;
};

export const removeItemFromActiveEquippmentSlots = (item: EquippableItem) => {
	const inventory = globalState.inventory;
	const slot = getItemEquippmentSlot(item);
	if (slot) {
		inventory[slot] = undefined;
	}
};

export const isEquipped = (item: EquippableItem) => {
	return getItemEquippmentSlot(item) !== undefined;
};

export const getEquippedItems = () => {
	const inventory = globalState.inventory;
	return {
		[EquipmentSlot.MAIN_HAND]: inventory.mainhand,
		[EquipmentSlot.OFF_HAND]: inventory.offhand,
		[EquipmentSlot.CHESTPIECE]: inventory.chestpiece,
		[EquipmentSlot.NECKLACE]: inventory.necklace,
		[EquipmentSlot.RIGHT_RING]: inventory.rightRing,
		[EquipmentSlot.LEFT_RING]: inventory.leftRing,
	};
};

export const getUnequippedItemsWithPositions = () => {
	return globalState.inventory.unequippedItemList;
};

export const getUnequippedItemCount = (itemId: string) => {
	const matchingItems = globalState.inventory.unequippedItemList.filter(
		(item) => item.item.id === itemId);
	return matchingItems.reduce((sum, item) => sum + item.item.amount, 0);
};