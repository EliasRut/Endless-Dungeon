import { ColorsOfMagic } from '../game/phaser/helpers/constants';
import { AbilityType } from '../types/AbilityType';
import {
	AbilityLinkedItem,
	Catalyst,
	CatalystItem,
	Ring,
	Source,
	ItemData,
	EquippableItemType,
	UneqippableItem,
	Amulet,
	ChestPiece,
} from '../types/Item';

export const SourceData: Record<Source, AbilityLinkedItem> = {
	[Source.FIRE]: {
		ability: AbilityType.FIREBALL,
		name: 'Fire Source',
		description:
			'Channel the power of flame to deal high amounts of instant damage to your enemies.',
		iconFrame: 24,
	} as AbilityLinkedItem,
	[Source.ICE]: {
		ability: AbilityType.ICE_SPIKE,
		name: 'Ice Source',
		description: 'Freeze your foes solid with the power of ice. Very cool!',
		iconFrame: 26,
	} as AbilityLinkedItem,
	[Source.NECROTIC]: {
		ability: AbilityType.NECROTIC_BOLT,
		name: 'Necrotic Source',
		description: 'Use the power of decay to make your enemies fall apart bit by bit. Yuk!',
		iconFrame: 25,
	} as AbilityLinkedItem,
	[Source.ARCANE]: {
		ability: AbilityType.ARCANE_BOLT,
		name: 'Arcane Source',
		description:
			`Invisible forces batter your enemies and throws them back. ` +
			`They won't even see what's coming.`,
		iconFrame: 27,
	} as AbilityLinkedItem,
};

export const CatalystData: Record<Catalyst, CatalystItem> = {
	[Catalyst.CONE]: {
		catalystType: Catalyst.CONE,
		name: 'Cone Catalyst',
		description: 'Pushes your power out in front of you in a directed blast.',
		iconFrame: 0,
	} as CatalystItem,
	[Catalyst.NOVA]: {
		catalystType: Catalyst.NOVA,
		name: 'Nova Catalyst',
		description: 'Releases your energy in wave, streaming out in all directions.',
		iconFrame: 1,
	} as CatalystItem,
	[Catalyst.STORM]: {
		catalystType: Catalyst.STORM,
		name: 'Storm Catalyst',
		description: 'Homing projectiles shoot out of your source and hunt your enemies.',
		iconFrame: 2,
	} as CatalystItem,
	[Catalyst.SUMMON]: {
		catalystType: Catalyst.SUMMON,
		name: 'Summon Catalyst',
		description: 'Summons your energy into a self containing force, lending you a helping hand.',
		iconFrame: 3,
	} as CatalystItem,
};

export const getCatalystAbility = (baseAbility: AbilityType, offHand: CatalystItem) => {
	if (offHand.catalystType === Catalyst.CONE) {
		switch (baseAbility) {
			case AbilityType.ARCANE_BOLT: {
				return AbilityType.ARCANE_CONE;
			}
			case AbilityType.NECROTIC_BOLT: {
				return AbilityType.NECROTIC_CONE;
			}
			case AbilityType.ICE_SPIKE: {
				return AbilityType.ICE_CONE;
			}
			case AbilityType.FIREBALL:
			default: {
				return AbilityType.FIRE_CONE;
			}
		}
	}
	if (offHand.catalystType === Catalyst.NOVA) {
		switch (baseAbility) {
			case AbilityType.ARCANE_BOLT: {
				return AbilityType.ARCANE_NOVA;
			}
			case AbilityType.NECROTIC_BOLT: {
				return AbilityType.NECROTIC_NOVA;
			}
			case AbilityType.ICE_SPIKE: {
				return AbilityType.ICE_NOVA;
			}
			case AbilityType.FIREBALL:
			default: {
				return AbilityType.FIRE_NOVA;
			}
		}
	}
	if (offHand.catalystType === Catalyst.SUMMON) {
		switch (baseAbility) {
			case AbilityType.ARCANE_BOLT: {
				return AbilityType.ARCANE_SUMMON_CIRCLING;
			}
			case AbilityType.NECROTIC_BOLT: {
				return AbilityType.NECROTIC_SUMMON_CIRCLING;
			}
			case AbilityType.ICE_SPIKE: {
				return AbilityType.ICE_SUMMON_CIRCLING;
			}
			case AbilityType.FIREBALL:
			default: {
				return AbilityType.FIRE_SUMMON_CIRCLING;
			}
		}
	}
	switch (baseAbility) {
		case AbilityType.ICE_SPIKE: {
			return AbilityType.HAIL_OF_ICE;
		}
		case AbilityType.ARCANE_BOLT: {
			return AbilityType.HAIL_OF_BOLTS;
		}
		case AbilityType.NECROTIC_BOLT: {
			return AbilityType.HAIL_OF_DEATH;
		}
		case AbilityType.FIREBALL:
		default: {
			return AbilityType.HAIL_OF_FLAMES;
		}
	}
};

export const RingData: Record<Ring, AbilityLinkedItem> = {
	[Ring.WILD]: {
		ability: AbilityType.FIREBALL,
		name: 'Ring of Wild',
		description: 'A ring giving you power associated with the color of magic: Wild',
		iconFrame: 56,
	} as AbilityLinkedItem,
	[Ring.ROYAL]: {
		ability: AbilityType.CONDEMN,
		name: 'Ring of Royal',
		description: 'A ring giving you power associated with the color of magic: Royal',
		iconFrame: 56,
	} as AbilityLinkedItem,
	[Ring.METAL]: {
		ability: AbilityType.FIREBALL,
		name: 'Ring of Metal',
		description: 'A ring giving you power associated with the color of magic: Metal',
		iconFrame: 56,
	} as AbilityLinkedItem,
	[Ring.PASSION]: {
		ability: AbilityType.CHARM,
		name: 'Ring of Passion',
		description: 'A ring giving you power associated with the color of magic: Passion',
		iconFrame: 56,
	} as AbilityLinkedItem,
	[Ring.FLUX]: {
		ability: AbilityType.FIREBALL,
		name: 'Ring of Flux',
		description: 'A ring giving you power associated with the color of magic: Flux',
		iconFrame: 56,
	} as AbilityLinkedItem,
	[Ring.DEATH]: {
		ability: AbilityType.FIREBALL,
		name: 'Ring of Death',
		description: 'A ring giving you power associated with the color of magic: Death',
		iconFrame: 56,
	} as AbilityLinkedItem,
	[Ring.CHANGE]: {
		ability: AbilityType.FIREBALL,
		name: 'Ring of Change',
		description: 'A ring giving you power associated with the color of magic: Change',
		iconFrame: 56,
	} as AbilityLinkedItem,
	[Ring.BLOOD]: {
		ability: AbilityType.BLOOD_DRAIN,
		name: 'Ring of Blood',
		description: 'A ring giving you power associated with the color of magic: Blood',
		iconFrame: 56,
	} as AbilityLinkedItem,
};

export const AmuletData: Record<Amulet, ItemData> = {
	[Amulet.WILD]: {
		name: 'Amulet of Wild',
		description:
			'An amulet giving you a passive advantage associated with the color of magic: Wild',
		iconFrame: 11,
	} as ItemData,
	[Amulet.ROYAL]: {
		name: 'Amulet of Royal',
		description:
			'An amulet giving you a passive advantage associated with the color of magic: Royal',
		iconFrame: 11,
	} as ItemData,
	[Amulet.METAL]: {
		name: 'Amulet of Metal',
		description:
			'An amulet giving you a passive advantage associated with the color of magic: Metal',
		iconFrame: 11,
	} as ItemData,
	[Amulet.PASSION]: {
		name: 'Amulet of Passion',
		description:
			'An amulet giving you a passive advantage associated with the color of magic: Passion',
		iconFrame: 11,
	} as ItemData,
	[Amulet.FLUX]: {
		name: 'Amulet of Flux',
		description:
			'An amulet giving you a passive advantage associated with the color of magic: Flux',
		iconFrame: 11,
	} as ItemData,
	[Amulet.DEATH]: {
		name: 'Amulet of Death',
		description:
			'An amulet giving you a passive advantage associated with the color of magic: Death',
		iconFrame: 11,
	} as ItemData,
	[Amulet.CHANGE]: {
		name: 'Amulet of Change',
		description:
			'An amulet giving you a passive advantage associated with the color of magic: Change',
		iconFrame: 11,
	} as ItemData,
	[Amulet.BLOOD]: {
		name: 'Amulet of Blood',
		description:
			'An amulet giving you a passive advantage associated with the color of magic: Blood',
		iconFrame: 11,
	} as ItemData,
};

export const ChestPieceData: Record<ChestPiece, ItemData> = {
	[ChestPiece.ROBE]: {
		name: 'Robe',
		description: 'A set of robes inscribed with runes to increase your casting speed.',
		iconFrame: 0,
	} as ItemData,
	[ChestPiece.ARMOR]: {
		name: 'Armor',
		description: 'Heavy armor to allow you to take that extra hit without dying.',
		iconFrame: 1,
	} as ItemData,
	[ChestPiece.CLOAK]: {
		name: 'Cloak',
		description: 'A set of clothing made for the modern explorer.',
		iconFrame: 2,
	} as ItemData,
	[ChestPiece.GARB]: {
		name: 'Garb',
		description: 'A garment full of runes to ward off hostile magic.',
		iconFrame: 3,
	} as ItemData,
};

export const AbilityLinkedItems = {
	...SourceData,
	...CatalystData,
	...RingData,
};

export const EquippableItems = {
	...AbilityLinkedItems,
	...AmuletData,
	...ChestPieceData,
};

export const equippableTypeNames = [
	EquippableItemType.SOURCE,
	EquippableItemType.CATALYST,
	EquippableItemType.CHESTPIECE,
	EquippableItemType.AMULET,
	EquippableItemType.RING,
] as string[];

export const UneqippableItemData = {
	[UneqippableItem.GOLD_KEY]: {
		name: 'Gold Key',
		description: 'A key that can be used to open golden doors.',
		iconFrame: 58,
	} as ItemData,
	[UneqippableItem.SILVER_KEY]: {
		name: 'Silver Key',
		description: 'A key that can be used to open silver doors.',
		iconFrame: 59,
	} as ItemData,
	[UneqippableItem.MYSTIC_BOOK]: {
		name: 'Mystic Book',
		description: 'A book full of ancient runes. Smells like old bones.',
		iconFrame: 32,
	} as ItemData,
	[UneqippableItem.HEALTH_POTION]: {
		name: 'Health Potion',
		description: 'A health potion. Tastes like blood...',
		iconFrame: 0,
	} as ItemData,
	[UneqippableItem.ESSENCE]: {
		name: 'Essence',
		description: 'Essence for crafting.',
		iconFrame: 0,
	} as ItemData,
	[UneqippableItem.EURALIAE_SEEDS]: {
		name: 'Euraliae Seeds',
		description: 'Quest Item.',
		iconFrame: 9,
	} as ItemData,
	[UneqippableItem.PLANTLING_ROOT]: {
		name: 'Plantling root',
		description: 'Quest Item.',
		iconFrame: 49,
	} as ItemData,
};

export const getItemTexture = (name?: string) => {
	if (name === 'source-fire') return 'icon-source-fire1';
	if (name === 'source-ice') return 'icon-source-ice1';
	if (name === 'source-necrotic') return 'icon-source-necrotic1';
	if (name === 'source-arcane') return 'icon-source-arcane1';
	if (name?.startsWith('chestpiece')) return 'armor-spritesheet';
	if (name?.startsWith('catalyst')) return 'catalyst-spritesheet';
	return 'test-items-spritesheet';
};

export const getItemDataForName = (name: string) => {
	if (name.startsWith('source-')) {
		return SourceData[name as Source] as AbilityLinkedItem;
	}
	if (name.startsWith('catalyst-')) {
		return CatalystData[name as Catalyst] as CatalystItem;
	}
	if (name.startsWith('chestpiece-')) {
		return ChestPieceData[name as ChestPiece] as ItemData;
	}
	if (name.startsWith('ring-')) {
		return RingData[name as Ring] as AbilityLinkedItem;
	}
	if (name.startsWith('amulet-')) {
		return AmuletData[name as Amulet] as ItemData;
	}
	if (Object.values(ColorsOfMagic).includes(name as ColorsOfMagic)) name = 'essence';
	return UneqippableItemData[name as UneqippableItem] as ItemData;
};

export const CombinedItemData = {
	...EquippableItems,
	...UneqippableItemData,
};
