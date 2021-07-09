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
	FOUR = 3,
	FIVE = 4,
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
	UI_FOREGROUND_LAYER = 9,
	UI_STICK_LAYER = 10
}

export const VISITED_TILE_TINT = 0x333333;
export const DEFAULT_TILE_TINT = 0xffffff;

export const NUM_ITEM_ICONS = 64;

export const NUM_DIRECTIONS = 8;

export const enum EquipmentSlot {
	MAIN_HAND = 'mainhand',
	OFF_HAND = 'offhand',
	CHESTPIECE = 'chestpiece',
	NECKLACE = 'necklace',
	RIGHT_RING = 'rightRing',
	LEFT_RING = 'leftRing'
}

export const enum ColorsOfMagic {
	FLUX = 'flux',
	METAL = 'metal',
	CHANGE = 'change',
	BLOOD = 'blood',
	DEATH = 'death',
	PASSION = 'passion',
	WILD = 'wild',
	ROYAL = 'royal'
}

export const ColorsArray = [
	ColorsOfMagic.WILD,
	ColorsOfMagic.ROYAL,
	ColorsOfMagic.METAL,
	ColorsOfMagic.PASSION,
	ColorsOfMagic.FLUX,
	ColorsOfMagic.DEATH,
	ColorsOfMagic.CHANGE,
	ColorsOfMagic.BLOOD,
];

export interface RuneAssignment {
	primaryContent: ColorsOfMagic;
	secondaryContent: ColorsOfMagic;
	wanderingMonsters: ColorsOfMagic;
	playerBuff: ColorsOfMagic;
	randomNpc: ColorsOfMagic;
}

export const BAG_BOXES_X = 8;
export const BAG_BOXES_Y = 4;

export const enum FacingRange {
	ALL_DIRECTIONS = 1,
	ONLY_NESW = 2
}

export const npcTypeToFileMap: {[name: string]:{file: string, facing: FacingRange}} =  {
	'red-ball'     : {file: 'assets/sprites/red-ball.png',facing: FacingRange.ALL_DIRECTIONS},
	'redling-boss' : {file: 'assets/sprites/red-ball.png',facing: FacingRange.ALL_DIRECTIONS},
	'red-link'     : {file: 'assets/sprites/red-link.png',facing: FacingRange.ALL_DIRECTIONS},
	'naked-guy'    : {file: 'assets/sprites/naked-guy.png',facing: FacingRange.ALL_DIRECTIONS},
	'enemy-zombie' : {file: 'assets/sprites/enemy-zombie.png',facing: FacingRange.ONLY_NESW}
};

export const npcTypeToAttackFileMap: {
	[name: string]: {[attackName: string]: {file: string, framesPerDirection: number}}
} =  {
	'enemy-zombie': {
		'slash': {
			file: 'assets/sprites/enemy-zombie-slash.png',
			framesPerDirection: 16
		}
	}
};

export const essenceNames = [
	'wild', 'royal', 'metal', 'passion', 'flux', 'death', 'change', 'blood'
];

export const enum PossibleTargets {
	NONE = 0,
	PLAYER = 1,
	ENEMIES = 2
}

export const KNOCKBACK_TIME = 250;