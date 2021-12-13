import {
	Amulet,
	Catalyst,
	ChestPiece,
	ChestPieceKey,
	EquipmentKey,
	EquippableItemType,
	equippableTypeNames,
	getItemDataForName,
	Ring,
	RingKey,
	Source,
	SourceKey,
} from '../../items/itemData';
import globalState from '../worldstate';
import Character from '../worldstate/Character';
import { EquippedItemData, EquippedItemRecords, EquippedItems } from '../worldstate/Inventory';
import Item from '../worldstate/Item';
import { EquipmentSlot, BAG_BOXES_X, BAG_BOXES_Y } from './constants';
import { ItemData, CatalystKey, AmuletKey } from '../../items/itemData';

const BASE_HEALTH = 100;
const BASE_MOVEMENT_SPEED = 200;

// export const updateStats = (char: Character) => {
// 	const healthBeforeUpdate = char.health;
// 	const maxHealthBeforeUpdate = char.maxHealth;

// 	const itemStats = char.items.reduce((stats, item) => {
// 		Object.keys(item).forEach((key) => {
// 			const typedKey = key as keyof ItemStats;
// 			stats[typedKey] = (stats[typedKey] || 0) + item[typedKey];
// 		});
// 		return stats;
// 	}, {} as ItemStats);

// 	char.maxHealth = BASE_HEALTH + (itemStats.maxHealth || 0);
// 	char.health = healthBeforeUpdate + (char.maxHealth - maxHealthBeforeUpdate);
// 	char.movementSpeed = BASE_MOVEMENT_SPEED + (itemStats.movementSpeed || 0);
// 	char.damage = 1 + (itemStats.damage || 0);
// };

const equippableItemPrefixes = ['source', 'catalyst', 'amulet', 'chestpiece', 'ring'];

export const isEquippable = (itemKey: string) => {
	const itemParts = itemKey.split('-');
	if (itemParts.length !== 2) {
		return false;
	}
	return equippableItemPrefixes.includes(itemParts[0]);
};

export const getItemKeyForEquipmentSlot: (slot: EquipmentSlot) => EquipmentKey | undefined = (
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

export const getEquipmentDataForItemKey: (itemKey: EquipmentKey) => EquippedItemData = (
	itemKey
) => {
	const prefix = itemKey.split('-')[0];
	switch (prefix) {
		case 'source':
			return globalState.inventory.sources[itemKey as Source];
		case 'catalyst':
			return globalState.inventory.catalysts[itemKey as Catalyst];
		case 'chestpiece':
			return globalState.inventory.chestPieces[itemKey as ChestPiece];
		case 'amulet':
			return globalState.inventory.amulets[itemKey as Amulet];
		case 'ring':
			return globalState.inventory.rings[itemKey as Ring];
	}
	throw new Error(`Unknown equipment type ${itemKey}.`);
};

export const getEquipmentDataRecordForEquipmentSlot: (slot: EquipmentSlot) => EquippedItemRecords =
	(slot) => {
		switch (slot) {
			case EquipmentSlot.SOURCE:
				return globalState.inventory.sources;
			case EquipmentSlot.CATALYST:
				return globalState.inventory.catalysts;
			case EquipmentSlot.AMULET:
				return globalState.inventory.amulets;
			case EquipmentSlot.CHESTPIECE:
				return globalState.inventory.chestPieces;
			case EquipmentSlot.LEFT_RING:
				return globalState.inventory.rings;
			case EquipmentSlot.RIGHT_RING:
				return globalState.inventory.rings;
		}
	};

// export const getUnequippedItemsWithPositions = () => {
// 	return globalState.inventory.unequippedItemList;
// };

// export const getUnequippedItemCount = (itemId: string) => {
// 	const matchingItems = globalState.inventory.unequippedItemList.filter(
// 		(item) => item.item.id === itemId);
// 	return matchingItems.reduce((sum, item) => sum + item.item.amount, 0);
// };

export const getItemDataForEquipmentSlot: (slot: EquipmentSlot) => ItemData | undefined = (
	slot
) => {
	const itemKey = getItemKeyForEquipmentSlot(slot);
	if (!itemKey) {
		return undefined;
	}

	return getItemDataForName(itemKey);
};

export const getFullDataForEquipmentSlot: (
	slot: EquipmentSlot
) => [ItemData, EquippedItemData] | [undefined, undefined] = (slot) => {
	const itemKey = getItemKeyForEquipmentSlot(slot);
	if (!itemKey) {
		return [undefined, undefined];
	}
	return getFullDataForItemKey(itemKey);
};

export const getFullDataForItemKey: (itemKey: EquipmentKey) => [ItemData, EquippedItemData] = (
	itemKey
) => {
	const itemData = getItemDataForName(itemKey);
	const equipmentData = getEquipmentDataForItemKey(itemKey);
	return [itemData, equipmentData];
};

export const equipItem: (equipmentSlot: EquipmentSlot, itemKey: string) => void = (
	equipmentSlot,
	itemKey
) => {
	switch (equipmentSlot) {
		case EquipmentSlot.SOURCE:
			globalState.inventory.equippedSource = itemKey as SourceKey;
			return;
		case EquipmentSlot.CATALYST:
			globalState.inventory.equippedCatalyst = itemKey as CatalystKey;
			return;
		case EquipmentSlot.AMULET:
			globalState.inventory.equippedAmulet = itemKey as AmuletKey;
			return;
		case EquipmentSlot.CHESTPIECE:
			globalState.inventory.equippedChestPiece = itemKey as ChestPieceKey;
			return;
		case EquipmentSlot.LEFT_RING:
			globalState.inventory.equippedLeftRing = itemKey as RingKey;
			return;
		case EquipmentSlot.RIGHT_RING:
			globalState.inventory.equippedRightRing = itemKey as RingKey;
			return;
	}
};

export const equipItemIfNoneEquipped: (itemKey: EquipmentKey) => void = (itemKey) => {
	const prefix = itemKey.split('-')[0];
	switch (prefix) {
		case 'source':
			globalState.inventory.equippedSource =
				globalState.inventory.equippedSource || (itemKey as SourceKey);
			return;
		case 'catalyst':
			globalState.inventory.equippedCatalyst =
				globalState.inventory.equippedCatalyst || (itemKey as CatalystKey);
			return;
		case 'amulet':
			globalState.inventory.equippedAmulet =
				globalState.inventory.equippedAmulet || (itemKey as AmuletKey);
			return;
		case 'chestpiece':
			globalState.inventory.equippedChestPiece =
				globalState.inventory.equippedChestPiece || (itemKey as ChestPieceKey);
			return;
		case 'ring':
			if (!globalState.inventory.equippedLeftRing) {
				globalState.inventory.equippedLeftRing = itemKey as RingKey;
			} else if (!globalState.inventory.equippedRightRing) {
				globalState.inventory.equippedRightRing = itemKey as RingKey;
			}
			return;
	}
};
