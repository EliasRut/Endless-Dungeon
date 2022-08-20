import { ColorsOfMagic, EquipmentSlot } from '../helpers/constants';
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
import { EnchantmentName } from '../../items/enchantmentData';

export interface EquippedItemData {
	level: number;
	enchantment: EnchantmentName;
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
	essences: Record<ColorsOfMagic, number>;
}

export const EmptyInventory: Inventory = {
	equippedSource: Source.FIRE,
	equippedChestPiece: ChestPiece.ROBE,
	equippedLeftRing: Ring.BLOOD,
	equippedRightRing: Ring.WILD,
	equippedCatalyst: Catalyst.NOVA,
	equippedAmulet: Amulet.WILD,
	amulets: {
		[Amulet.BLOOD]: { level: 0, enchantment: 'None' },
		[Amulet.CHANGE]: { level: 0, enchantment: 'None' },
		[Amulet.DEATH]: { level: 0, enchantment: 'None' },
		[Amulet.FLUX]: { level: 1, enchantment: 'None' },
		[Amulet.METAL]: { level: 0, enchantment: 'None' },
		[Amulet.PASSION]: { level: 0, enchantment: 'None' },
		[Amulet.ROYAL]: { level: 0, enchantment: 'None' },
		[Amulet.WILD]: { level: 1, enchantment: 'None' },
	},
	rings: {
		[Ring.BLOOD]: { level: 1, enchantment: 'None' },
		[Ring.CHANGE]: { level: 1, enchantment: 'None' },
		[Ring.DEATH]: { level: 1, enchantment: 'None' },
		[Ring.FLUX]: { level: 0, enchantment: 'None' },
		[Ring.METAL]: { level: 1, enchantment: 'None' },
		[Ring.PASSION]: { level: 1, enchantment: 'None' },
		[Ring.ROYAL]: { level: 1, enchantment: 'None' },
		[Ring.WILD]: { level: 1, enchantment: 'None' },
	},
	sources: {
		[Source.FIRE]: { level: 1, enchantment: 'None' },
		[Source.FORCE]: { level: 1, enchantment: 'None' },
		[Source.ICE]: { level: 1, enchantment: 'None' },
		[Source.NECROTIC]: { level: 1, enchantment: 'None' },
	},
	catalysts: {
		[Catalyst.CONE]: { level: 1, enchantment: 'None' },
		[Catalyst.NOVA]: { level: 1, enchantment: 'None' },
		[Catalyst.STORM]: { level: 1, enchantment: 'None' },
		[Catalyst.SUMMON]: { level: 1, enchantment: 'None' },
	},
	chestPieces: {
		[ChestPiece.ARMOR]: { level: 1, enchantment: 'None' },
		[ChestPiece.CLOAK]: { level: 0, enchantment: 'None' },
		[ChestPiece.GARB]: { level: 1, enchantment: 'None' },
		[ChestPiece.ROBE]: { level: 1, enchantment: 'None' },
	},
	bag: {},
	essences: {flux: 0, metal: 0, blood: 0, change: 0, death: 0, royal: 0, passion: 0, wild: 0},
};
