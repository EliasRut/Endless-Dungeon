import { getItemDataForName } from '../../../data/itemData';
import {
	Amulet,
	Catalyst,
	ChestPiece,
	ChestPieceKey,
	EquipmentKey,
	Ring,
	RingKey,
	Source,
	SourceKey,
	ItemData,
	CatalystKey,
	AmuletKey,
} from '../../../types/Item';
import worldstate from '../worldState';
import { EquippedItemData, EquippedItemRecords, EquippedItems } from '../../../types/Inventory';
import { EquipmentSlot } from './constants';
import { Enchantment, EnchantmentName } from '../../../data/enchantmentData';

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
			return worldstate.inventory.equippedAmulet;
		case EquipmentSlot.LEFT_RING:
			return worldstate.inventory.equippedLeftRing;
		case EquipmentSlot.RIGHT_RING:
			return worldstate.inventory.equippedRightRing;
		case EquipmentSlot.CHESTPIECE:
			return worldstate.inventory.equippedChestPiece;
		case EquipmentSlot.AMULET:
			return worldstate.inventory.equippedAmulet;
		case EquipmentSlot.SOURCE:
			return worldstate.inventory.equippedSource;
		case EquipmentSlot.CATALYST:
			return worldstate.inventory.equippedCatalyst;
		default:
			return undefined;
	}
};

export const getEquippedItems: () => EquippedItems = () => {
	const inventory = worldstate.inventory;
	return {
		[EquipmentSlot.SOURCE]: inventory.equippedSource,
		[EquipmentSlot.CATALYST]: inventory.equippedCatalyst,
		[EquipmentSlot.CHESTPIECE]: inventory.equippedChestPiece,
		[EquipmentSlot.AMULET]: inventory.equippedAmulet,
		[EquipmentSlot.RIGHT_RING]: inventory.equippedRightRing,
		[EquipmentSlot.LEFT_RING]: inventory.equippedLeftRing,
	};
};

export const getEquipmentDataForSlot: (slot: EquipmentSlot) => EquippedItemData | undefined = (
	slot
) => {
	const equippmentKeyInSlot = getEquippedItems()[slot];
	if (!equippmentKeyInSlot) {
		return undefined;
	}
	return getEquipmentDataForItemKey(equippmentKeyInSlot);
};

export const getEquipmentDataForItemKey: (itemKey: EquipmentKey) => EquippedItemData = (
	itemKey
) => {
	const prefix = itemKey.split('-')[0];
	switch (prefix) {
		case 'source':
			return worldstate.inventory.sources[itemKey as Source];
		case 'catalyst':
			return worldstate.inventory.catalysts[itemKey as Catalyst];
		case 'chestpiece':
			return worldstate.inventory.chestPieces[itemKey as ChestPiece];
		case 'amulet':
			return worldstate.inventory.amulets[itemKey as Amulet];
		case 'ring':
			return worldstate.inventory.rings[itemKey as Ring];
	}
	throw new Error(`Unknown equipment type ${itemKey}.`);
};

export const attachEnchantmentItem: (
	itemKey: EquipmentKey,
	enchantment: EnchantmentName
) => void = (itemKey, enchantment) => {
	if (Enchantment[enchantment]?.cost) {
		const required = Enchantment[enchantment]?.cost!;
		required.forEach((cost) => {
			if (worldstate.inventory.essences[cost.essence] < cost.amount) {
				console.log('NOT ENOOUGH RESOURCES');
				return;
			}
		});
		required.forEach((cost) => {
			worldstate.inventory.essences[cost.essence] -= cost.amount;
		});
	}
	const prefix = itemKey.split('-')[0];
	switch (prefix) {
		case 'source':
			return (worldstate.inventory.sources[itemKey as Source].enchantment = enchantment);
		case 'catalyst':
			return (worldstate.inventory.catalysts[itemKey as Catalyst].enchantment = enchantment);
		case 'chestpiece':
			return (worldstate.inventory.chestPieces[itemKey as ChestPiece].enchantment = enchantment);
		case 'amulet':
			return (worldstate.inventory.amulets[itemKey as Amulet].enchantment = enchantment);
		case 'ring':
			return (worldstate.inventory.rings[itemKey as Ring].enchantment = enchantment);
	}
	throw new Error(`Unknown equipment type ${itemKey}.`);
};

export const getEquipmentDataRecordForEquipmentSlot: (
	slot: EquipmentSlot
) => EquippedItemRecords = (slot) => {
	switch (slot) {
		case EquipmentSlot.SOURCE:
			return worldstate.inventory.sources;
		case EquipmentSlot.CATALYST:
			return worldstate.inventory.catalysts;
		case EquipmentSlot.AMULET:
			return worldstate.inventory.amulets;
		case EquipmentSlot.CHESTPIECE:
			return worldstate.inventory.chestPieces;
		case EquipmentSlot.LEFT_RING:
			return worldstate.inventory.rings;
		case EquipmentSlot.RIGHT_RING:
			return worldstate.inventory.rings;
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
			worldstate.inventory.equippedSource = itemKey as SourceKey;
			return;
		case EquipmentSlot.CATALYST:
			worldstate.inventory.equippedCatalyst = itemKey as CatalystKey;
			return;
		case EquipmentSlot.AMULET:
			worldstate.inventory.equippedAmulet = itemKey as AmuletKey;
			return;
		case EquipmentSlot.CHESTPIECE:
			worldstate.inventory.equippedChestPiece = itemKey as ChestPieceKey;
			return;
		case EquipmentSlot.LEFT_RING:
			worldstate.inventory.equippedLeftRing = itemKey as RingKey;
			return;
		case EquipmentSlot.RIGHT_RING:
			worldstate.inventory.equippedRightRing = itemKey as RingKey;
			return;
	}
};

export const equipItemIfNoneEquipped: (itemKey: EquipmentKey) => void = (itemKey) => {
	const prefix = itemKey.split('-')[0];
	switch (prefix) {
		case 'source':
			worldstate.inventory.equippedSource =
				worldstate.inventory.equippedSource || (itemKey as SourceKey);
			return;
		case 'catalyst':
			worldstate.inventory.equippedCatalyst =
				worldstate.inventory.equippedCatalyst || (itemKey as CatalystKey);
			return;
		case 'amulet':
			worldstate.inventory.equippedAmulet =
				worldstate.inventory.equippedAmulet || (itemKey as AmuletKey);
			return;
		case 'chestpiece':
			worldstate.inventory.equippedChestPiece =
				worldstate.inventory.equippedChestPiece || (itemKey as ChestPieceKey);
			return;
		case 'ring':
			if (!worldstate.inventory.equippedLeftRing) {
				worldstate.inventory.equippedLeftRing = itemKey as RingKey;
			} else if (!worldstate.inventory.equippedRightRing) {
				worldstate.inventory.equippedRightRing = itemKey as RingKey;
			}
			return;
	}
};
