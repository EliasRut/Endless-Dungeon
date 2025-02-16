// This class handles the items.
import { v4 as uuidv4 } from 'uuid';
import { AbilityType } from './AbilityType';

export const NUM_ICON_FRAMES = 64;

export default class Item {
	public flavorText = 'A normal item.';
	public name = 'Item';
	public iconFrame = 0;
	public type = '';
	public id: string;
	public amount: number = 1;

	constructor(
		flavorText: string = 'A normal item.',
		name: string = 'Item',
		iconFrame: number = Math.floor(Math.random() * NUM_ICON_FRAMES),
		type: string = 'potion',
		id?: string
	) {
		this.iconFrame = iconFrame;
		this.type = type;
		this.flavorText = flavorText;
		this.name = name;
		this.id = id || uuidv4();
	}
}

export interface ItemData {
	name: string;
	description: string;
	iconFrame: number;
}

export interface CatalystItem extends ItemData {
	catalystType: Catalyst;
}

export interface AbilityLinkedItem extends ItemData {
	ability: AbilityType;
}

export const enum Source {
	FIRE = 'source-fire',
	ICE = 'source-ice',
	NECROTIC = 'source-necrotic',
	ARCANE = 'source-arcane',
}
export type SourceKey = 'source-fire' | 'source-ice' | 'source-necrotic' | 'source-arcane';

export const enum Catalyst {
	CONE = 'catalyst-cone',
	NOVA = 'catalyst-nova',
	STORM = 'catalyst-storm',
	SUMMON = 'catalyst-summon',
}
export type CatalystKey = 'catalyst-cone' | 'catalyst-nova' | 'catalyst-storm' | 'catalyst-summon';

export const enum ChestPiece {
	ROBE = 'chestpiece-robe',
	ARMOR = 'chestpiece-armor',
	CLOAK = 'chestpiece-cloak',
	GARB = 'chestpiece-garb',
}
export type ChestPieceKey =
	| 'chestpiece-robe'
	| 'chestpiece-armor'
	| 'chestpiece-cloak'
	| 'chestpiece-garb';

export const enum Ring {
	WILD = 'ring-wild',
	ROYAL = 'ring-royal',
	METAL = 'ring-metal',
	PASSION = 'ring-passion',
	FLUX = 'ring-flux',
	DEATH = 'ring-death',
	CHANGE = 'ring-change',
	BLOOD = 'ring-blood',
}
export type RingKey =
	| 'ring-wild'
	| 'ring-royal'
	| 'ring-metal'
	| 'ring-passion'
	| 'ring-flux'
	| 'ring-death'
	| 'ring-change'
	| 'ring-blood';

export const enum Amulet {
	WILD = 'amulet-wild',
	ROYAL = 'amulet-royal',
	METAL = 'amulet-metal',
	PASSION = 'amulet-passion',
	FLUX = 'amulet-flux',
	DEATH = 'amulet-death',
	CHANGE = 'amulet-change',
	BLOOD = 'amulet-blood',
}
export type AmuletKey =
	| 'amulet-wild'
	| 'amulet-royal'
	| 'amulet-metal'
	| 'amulet-passion'
	| 'amulet-flux'
	| 'amulet-death'
	| 'amulet-change'
	| 'amulet-blood';

export type EquipmentKey = SourceKey | CatalystKey | ChestPieceKey | RingKey | AmuletKey;

export const enum EquippableItemType {
	SOURCE = 'source',
	CATALYST = 'catalyst',
	CHESTPIECE = 'chestpiece',
	AMULET = 'amulet',
	RING = 'ring',
}

export const enum UneqippableItem {
	GOLD_KEY = 'goldKey',
	SILVER_KEY = 'silverKey',
	MYSTIC_BOOK = 'mysticBook',
	HEALTH_POTION = 'health',
	ESSENCE = 'essence',
	EURALIAE_SEEDS = 'euraliaeSeeds',
	PLANTLING_ROOT = 'plantlingRoot',
}
