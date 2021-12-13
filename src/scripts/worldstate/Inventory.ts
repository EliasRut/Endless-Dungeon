import { EquipmentSlot } from '../helpers/constants';
import {
	Amulet,
	Catalyst,
	ChestPiece,
	Ring,
	Source,
	UneqippableItem,
	SourceKey,
	CatalystKey,
	RingKey,
	ChestPieceKey,
	AmuletKey,
} from '../../items/itemData';
import { EnchantmentType } from '../../items/enchantmentData';

export interface EquippedItemData {
	level: number;
	enchantment: EnchantmentType;
}

export interface EquippedItems {
	[EquipmentSlot.SOURCE]: SourceKey | undefined;
	[EquipmentSlot.CATALYST]: CatalystKey | undefined;
	[EquipmentSlot.CHESTPIECE]: ChestPieceKey | undefined;
	[EquipmentSlot.AMULET]: AmuletKey | undefined;
	[EquipmentSlot.RIGHT_RING]: RingKey | undefined;
	[EquipmentSlot.LEFT_RING]: RingKey | undefined;
}

export type EquippedItemRecords =
	| Record<Amulet, EquippedItemData>
	| Record<Ring, EquippedItemData>
	| Record<Source, EquippedItemData>
	| Record<Catalyst, EquippedItemData>
	| Record<ChestPiece, EquippedItemData>;

export default interface Inventory {
	amulets: Record<Amulet, EquippedItemData>;
	rings: Record<Ring, EquippedItemData>;
	sources: Record<Source, EquippedItemData>;
	catalysts: Record<Catalyst, EquippedItemData>;
	chestPieces: Record<ChestPiece, EquippedItemData>;
	equippedSource?: SourceKey;
	equippedCatalyst?: CatalystKey;
	equippedChestPiece?: ChestPieceKey;
	equippedLeftRing?: RingKey;
	equippedRightRing?: RingKey;
	equippedAmulet?: AmuletKey;
	bag: Partial<Record<UneqippableItem, number>>;
}

export const EmptyInventory: Inventory = {
	equippedSource: Source.FIRE,
	equippedChestPiece: ChestPiece.ROBE,
	equippedLeftRing: Ring.BLOOD,
	equippedRightRing: Ring.WILD,
	equippedCatalyst: Catalyst.NOVA,
	equippedAmulet: Amulet.WILD,
	amulets: {
		[Amulet.BLOOD]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.CHANGE]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.DEATH]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.FLUX]: { level: 1, enchantment: EnchantmentType.NONE },
		[Amulet.METAL]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.PASSION]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.ROYAL]: { level: 0, enchantment: EnchantmentType.NONE },
		[Amulet.WILD]: { level: 1, enchantment: EnchantmentType.NONE },
	},
	rings: {
		[Ring.BLOOD]: { level: 1, enchantment: EnchantmentType.NONE },
		[Ring.CHANGE]: { level: 1, enchantment: EnchantmentType.NONE },
		[Ring.DEATH]: { level: 1, enchantment: EnchantmentType.NONE },
		[Ring.FLUX]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.METAL]: { level: 1, enchantment: EnchantmentType.NONE },
		[Ring.PASSION]: { level: 0, enchantment: EnchantmentType.NONE },
		[Ring.ROYAL]: { level: 1, enchantment: EnchantmentType.NONE },
		[Ring.WILD]: { level: 1, enchantment: EnchantmentType.NONE },
	},
	sources: {
		[Source.FIRE]: { level: 1, enchantment: EnchantmentType.LESSER_WOLF },
		[Source.FORCE]: { level: 1, enchantment: EnchantmentType.NONE },
		[Source.ICE]: { level: 1, enchantment: EnchantmentType.NONE },
		[Source.NECROTIC]: { level: 1, enchantment: EnchantmentType.NONE },
	},
	catalysts: {
		[Catalyst.CONE]: { level: 1, enchantment: EnchantmentType.NONE },
		[Catalyst.NOVA]: { level: 1, enchantment: EnchantmentType.NONE },
		[Catalyst.STORM]: { level: 1, enchantment: EnchantmentType.NONE },
		[Catalyst.SUMMON]: { level: 0, enchantment: EnchantmentType.NONE },
	},
	chestPieces: {
		[ChestPiece.ARMOR]: { level: 1, enchantment: EnchantmentType.NONE },
		[ChestPiece.CLOAK]: { level: 0, enchantment: EnchantmentType.NONE },
		[ChestPiece.GARB]: { level: 1, enchantment: EnchantmentType.NONE },
		[ChestPiece.ROBE]: { level: 1, enchantment: EnchantmentType.NONE },
	},
	bag: {},
};
