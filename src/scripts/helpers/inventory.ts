import globalState from '../worldstate';
import Character from '../worldstate/Character';
import Item, { ItemStats } from '../worldstate/Item';
import { EquipmentSlot, INVENTORY_BOXES_X, INVENTORY_BOXES_Y } from './constants';

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

export const equipItemOnCharacter = (item: Item, char: Character) => {
	// tslint:disable-next-line: no-console
	console.log(`Equipping item ${JSON.stringify(item)}.`);
	char.items.push(item);
	updateStats(char);
};

export const unequipItemFromCharacter = (itemToUnequip: Item, char: Character) => {
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
	for (let x = 0; x < INVENTORY_BOXES_X; x++) {
		for (let y = 0; y < INVENTORY_BOXES_Y; y++) {
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

export const unequipItem = (itemToUnequip: Item) => {
	unequipItemFromCharacter(itemToUnequip, globalState.playerCharacter);
	removeItemFromActiveEquippmentSlots(itemToUnequip);
	return placeItemInNextFreeBagSlot(itemToUnequip);
};

export const getSlotAndConflictsForEquipAction: (
	item: Item
) => [EquipmentSlot, (Item | undefined)[]] = (item: Item) => {

// export const unequip = (item: Item) => {
// 	item.unequip(globalState.playerCharacter);
// 	this.sortIntoInventory(item.itemToken);
	const inventory = globalState.inventory;
	switch (item.type) {
		case 'weapon': return [EquipmentSlot.MAIN_HAND, [inventory.mainhand]];
		case 'offhand': return [EquipmentSlot.OFF_HAND, [inventory.offhand]];
		case 'largeWeapon': return [EquipmentSlot.MAIN_HAND, [inventory.mainhand, inventory.offhand]];
		case 'chest': return [EquipmentSlot.CHEST, [inventory.chest]];
		case 'head': return [EquipmentSlot.HEAD, [inventory.head]];
		case 'gloves': return [EquipmentSlot.GLOVES, [inventory.gloves]];
		case 'boots': return [EquipmentSlot.BOOTS, [inventory.boots]];
		case 'necklace': return [EquipmentSlot.NECKLACE, [inventory.necklace]];
		case 'belt': return [EquipmentSlot.BELT, [inventory.belt]];
		case 'ring':
			if (!inventory.rightRing) return [EquipmentSlot.RIGHT_RING, []];
			if (!inventory.leftRing) return [EquipmentSlot.LEFT_RING, []];
			return [EquipmentSlot.RIGHT_RING, [inventory.rightRing]];
	}
	throw new Error (`Unknown item type ${item.type} encountered.`);
};

const removeItemFromBag = (itemToRemove: Item) => {
	const inventory = globalState.inventory;
	const itemPositionIndex = inventory.unequippedItemList.findIndex(
		({item}) => item.id === itemToRemove.id);
	if (itemPositionIndex >= 0) {
		const {x, y} = inventory.unequippedItemList[itemPositionIndex];
		inventory.bag[x][y] = 0;
		inventory.unequippedItemList.splice(itemPositionIndex, 1);
	}
};

export const equipItem = (item: Item) => {
	const inventory = globalState.inventory;
	const [slot, conflicts] = getSlotAndConflictsForEquipAction(item);
	removeItemFromBag(item);
	conflicts
		.filter((conflictingItem) => !!conflictingItem)
		.forEach((conflitingItem) => unequipItem(conflitingItem!));
	equipItemOnCharacter(item, globalState.playerCharacter);
	inventory[slot] = item;
};

export const getItemEquippmentSlot = (item: Item) => {
	const inventory = globalState.inventory;
	if (item.id === inventory.mainhand?.id) return EquipmentSlot.MAIN_HAND;
	if (item.id === inventory.offhand?.id) return EquipmentSlot.OFF_HAND;
	if (item.id === inventory.chest?.id) return EquipmentSlot.CHEST;
	if (item.id === inventory.head?.id) return EquipmentSlot.HEAD;
	if (item.id === inventory.gloves?.id) return EquipmentSlot.GLOVES;
	if (item.id === inventory.boots?.id) return EquipmentSlot.BOOTS;
	if (item.id === inventory.necklace?.id) return EquipmentSlot.NECKLACE;
	if (item.id === inventory.belt?.id) return EquipmentSlot.BELT;
	if (item.id === inventory.rightRing?.id) return EquipmentSlot.RIGHT_RING;
	if (item.id === inventory.leftRing?.id) return EquipmentSlot.LEFT_RING;
	return undefined;
};

export const removeItemFromActiveEquippmentSlots = (item: Item) => {
	const inventory = globalState.inventory;
	const slot = getItemEquippmentSlot(item);
	if (slot) {
		inventory[slot] = undefined;
	}
};

export const isEquipped = (item: Item) => {
	return getItemEquippmentSlot(item) !== undefined;
};

export const getEquippedItems = () => {
	const inventory = globalState.inventory;
	return {
		[EquipmentSlot.MAIN_HAND]: inventory.mainhand,
		[EquipmentSlot.OFF_HAND]: inventory.offhand,
		[EquipmentSlot.CHEST]: inventory.chest,
		[EquipmentSlot.HEAD]: inventory.head,
		[EquipmentSlot.GLOVES]: inventory.gloves,
		[EquipmentSlot.BOOTS]: inventory.boots,
		[EquipmentSlot.NECKLACE]: inventory.necklace,
		[EquipmentSlot.BELT]: inventory.belt,
		[EquipmentSlot.RIGHT_RING]: inventory.rightRing,
		[EquipmentSlot.LEFT_RING]: inventory.leftRing,
	};
};

export const getUnequippedItemsWithPositions = () => {
	return globalState.inventory.unequippedItemList;
};