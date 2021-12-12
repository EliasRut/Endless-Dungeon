import Item from './Item';
import { BAG_BOXES_X, BAG_BOXES_Y } from '../helpers/constants';
import EquippableItem from './EquippableItem';
import { Amulet, Catalyst, ChestPiece, Ring, Source, UneqippableItem } from '../../items/itemData';

export enum EnchantmentType {
	NONE = 'none',
}

export interface EquippedItemData {
	level: number;
	enchantment: EnchantmentType;
}

export default interface Inventory {
	amulets: Record<Amulet, EquippedItemData>;
	rings: Record<Ring, EquippedItemData>;
	sources: Record<Source, EquippedItemData>;
	catalysts: Record<Catalyst, EquippedItemData>;
	chestPiece: Record<ChestPiece, EquippedItemData>;
	equippedSource?: keyof Source;
	equippedCatalyst?: keyof Catalyst;
	equippedChestpiece?: keyof ChestPiece;
	equippedLeftRing?: keyof Ring;
	equippedRightRing?: keyof Ring;
	equippedAmulet?: keyof Amulet;
	bag: Partial<Record<UneqippableItem, number>>;
}

export const EmptyInventory: Inventory = {
	amulets: {
		[Amulet.BLOOD]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.CHANGE]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.DEATH]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.FLUX]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.METAL]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.PASSION]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.ROYAL]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.WILD]: { level: 0, enchantment: EnchantmentType.NONE },
	},
	rings: {
		[Ring.BLOOD]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.CHANGE]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.DEATH]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.FLUX]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.METAL]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.PASSION]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.ROYAL]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.WILD]: { level: 0, enchantment: EnchantmentType.NONE },
	},
	sources: {
		[Source.FIRE]: { level: 0, enchantment: EnchantmentType.NONE },
		[Source.FORCE]: { level: 0, enchantment: EnchantmentType.NONE },
		[Source.ICE]: { level: 0, enchantment: EnchantmentType.NONE },
		[Source.NECROTIC]: { level: 0, enchantment: EnchantmentType.NONE },
	},
	catalysts: {
		[Catalyst.CONE]: { level: 0, enchantment: EnchantmentType.NONE },
		[Catalyst.NOVA]: { level: 0, enchantment: EnchantmentType.NONE },
		[Catalyst.STORM]: { level: 0, enchantment: EnchantmentType.NONE },
		[Catalyst.SUMMON]: { level: 0, enchantment: EnchantmentType.NONE },
	},
	chestPiece: {
		[ChestPiece.ARMOR]: { level: 0, enchantment: EnchantmentType.NONE },
		[ChestPiece.CLOAK]: { level: 0, enchantment: EnchantmentType.NONE },
		[ChestPiece.GARB]: { level: 0, enchantment: EnchantmentType.NONE },
		[ChestPiece.ROBE]: { level: 0, enchantment: EnchantmentType.NONE },
	},
	bag: {},
};
