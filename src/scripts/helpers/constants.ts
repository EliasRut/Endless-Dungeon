export const enum Facings {
	SOUTH,
	SOUTH_EAST,
	EAST,
	NORTH_EAST,
	NORTH,
	NORTH_WEST,
	WEST,
	SOUTH_WEST
}

export const spriteDirectionList = [
	's',
	'se',
	'e',
	'ne',
	'n',
	'nw',
	'w',
	'sw'
];

export const facingToSpriteNameMap = {
	[Facings.SOUTH]: 's',
	[Facings.SOUTH_EAST]: 'se',
	[Facings.EAST]: 'e',
	[Facings.NORTH_EAST]: 'ne',
	[Facings.NORTH]: 'n',
	[Facings.NORTH_WEST]: 'nw',
	[Facings.WEST]: 'w',
	[Facings.SOUTH_WEST]: 'sw',
};

export const ANIMATION_IDLE = 'idle';
export const ANIMATION_WALK = 'walk';

export const enum Faction {
	PLAYER,
	NPCS,
	ENEMIES
}

export const enum AbilityKey {
	ONE = 0,
	TWO = 1,
	THREE = 2,
	FOUR = 3
}

export const enum UiDepths {
	BASE_TILE_LAYER = 0,
	DECORATION_TILE_LAYER= 1,

	TOKEN_BACKGROUND_LAYER = 2,
	TOKEN_MAIN_LAYER = 3,
	TOKEN_FOREGROUND_LAYER = 4,

	OVERLAY_TILE_LAYER = 5,
	OVERLAY_DECORATION_TILE_LAYER = 6,

	UI_BACKGROUND_LAYER = 7,
	UI_MAIN_LAYER = 8,
	UI_FOREGROUND_LAYER = 9
}

export const VISITED_TILE_TINT = 0x333333;
export const DEFAULT_TILE_TINT = 0xffffff;

export const NUM_ITEM_ICONS = 64;

export const NUM_DIRECTIONS = 8;

export const enum EquipmentSlot {
	MAIN_HAND = 'mainhand',
	OFF_HAND = 'offhand',
	CHEST = 'chest',
	HEAD = 'head',
	GLOVES = 'gloves',
	BOOTS = 'boots',
	NECKLACE = 'necklace',
	BELT = 'belt',
	RIGHT_RING = 'rightRing',
	LEFT_RING = 'leftRing'
}

export const BAG_BOXES_X = 8;
export const BAG_BOXES_Y = 4;