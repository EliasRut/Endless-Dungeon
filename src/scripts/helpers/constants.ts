export const enum Facings {
	SOUTH,
	SOUTH_EAST,
	EAST,
	NORTH_EAST,
	NORTH,
	NORTH_WEST,
	WEST,
	SOUTH_WEST,
}

export const spriteDirectionList = ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw'];

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
	ENEMIES,
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
	DECORATION_TILE_LAYER = 1,

	TOKEN_BACKGROUND_LAYER = 2,
	TOKEN_MAIN_LAYER = 3,
	TOKEN_FOREGROUND_LAYER = 4,

	OVERLAY_TILE_LAYER = 5,
	OVERLAY_DECORATION_TILE_LAYER = 6,
	TOP_TILE_LAYER = 7,

	UI_BACKGROUND_LAYER = 8,
	UI_MAIN_LAYER = 9,
	UI_FOREGROUND_LAYER = 10,
	UI_ABOVE_FOREGROUND_LAYER = 11,

	UI_STICK_LAYER = 12,
}

export const TARGETABLE_TILE_TINT = 0x888888;
export const VISITED_TILE_TINT = 0x333333;
export const DEFAULT_TILE_TINT = 0xffffff;

export const NUM_ITEM_ICONS = 64;

export const NUM_DIRECTIONS = 8;

export const enum EquipmentSlot {
	SOURCE = 'source',
	CATALYST = 'catalyst',
	CHESTPIECE = 'chestpiece',
	AMULET = 'amulet',
	RIGHT_RING = 'rightRing',
	LEFT_RING = 'leftRing',
}

export const enum ColorsOfMagic {
	FLUX = 'flux',
	METAL = 'metal',
	CHANGE = 'change',
	BLOOD = 'blood',
	DEATH = 'death',
	PASSION = 'passion',
	WILD = 'wild',
	ROYAL = 'royal',
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

export const NUM_COLORS_OF_MAGIC = 8;

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
	ONLY_NESW = 2,
}

export const npcTypeToFileMap: { [name: string]: { file: string; facing: FacingRange } } = {
	'red-ball': { file: 'assets/sprites/red-ball.png', facing: FacingRange.ALL_DIRECTIONS },
	'redling-boss': { file: 'assets/sprites/red-ball.png', facing: FacingRange.ALL_DIRECTIONS },
	'red-link': { file: 'assets/sprites/red-link.png', facing: FacingRange.ALL_DIRECTIONS },
	'naked-guy': { file: 'assets/sprites/naked-guy.png', facing: FacingRange.ALL_DIRECTIONS },
	'rich': { file: 'assets/sprites/rich.png', facing: FacingRange.ONLY_NESW },
	'enemy-vampire': { file: 'assets/sprites/enemy-vampire.png', facing: FacingRange.ONLY_NESW },
	'lich-king': { file: 'assets/sprites/rich.png', facing: FacingRange.ONLY_NESW },
};

export const characterToSubAnimationFileMap: {
	[name: string]: {
		[subAnimation: string]: {
			file: string;
			framesPerDirection: number;
			frameOffset?: number;
			animationFrames?: number;
		};
	};
} = {
	// 'rich': {
	// 	slash: {
	// 		file: 'assets/sprites/rich-slash.png',
	// 		framesPerDirection: 16,
	// 	},
	// },
	'enemy-vampire': {
		prepare: {
			file: 'assets/sprites/enemy-vampire-charge.png',
			framesPerDirection: 16,
			frameOffset: 0,
			animationFrames: 9,
		},
		fly: {
			file: 'assets/sprites/enemy-vampire-charge.png',
			framesPerDirection: 16,
			frameOffset: 9,
			animationFrames: 1,
		},
		stun: {
			file: 'assets/sprites/enemy-vampire-charge.png',
			framesPerDirection: 16,
			frameOffset: 10,
			animationFrames: 4,
		},
		recover: {
			file: 'assets/sprites/enemy-vampire-charge.png',
			framesPerDirection: 16,
			frameOffset: 14,
			animationFrames: 2,
		},
	},
	player: {
		damage: {
			file: 'assets/sprites/main-character-damagestun.png',
			framesPerDirection: 12,
			frameOffset: 0,
			animationFrames: 4,
		},
		stun: {
			file: 'assets/sprites/main-character-damagestun.png',
			framesPerDirection: 12,
			frameOffset: 4,
			animationFrames: 8,
		},
	},
};

export const essenceNames = [
	'wild',
	'royal',
	'metal',
	'passion',
	'flux',
	'death',
	'change',
	'blood',
];

export const enum PossibleTargets {
	NONE = 0,
	PLAYER = 1,
	ENEMIES = 2,
}

export const KNOCKBACK_TIME = 250;

export const colorOfMagicToTilesetMap = {
	[ColorsOfMagic.FLUX]: 'COM-death-B',
	[ColorsOfMagic.METAL]: 'COM-death-B',
	[ColorsOfMagic.CHANGE]: 'COM-death-B',
	[ColorsOfMagic.BLOOD]: 'COM-death-B',
	[ColorsOfMagic.DEATH]: 'COM-death-B',
	[ColorsOfMagic.PASSION]: 'COM-death-B',
	[ColorsOfMagic.WILD]: 'COM-death-B',
	[ColorsOfMagic.ROYAL]: 'COM-death-B',
};

export const enemyBudgetCost = {
	'rich': 1,
	'enemy-vampire': 1,
	'redling-boss': 10,
};

export const enum MODE {
	GAME = 'game',
	MAP_EDITOR = 'mapEditor',
	NPC_EDITOR = 'npcEditor',
}

export let activeMode = MODE.GAME;

export const setActiveMode = (mode: MODE) => {
	activeMode = mode;
};

export const CHARACTER_SPRITE_WIDTH = 320;
export const CHARACTER_SPRITE_HEIGHT = 240;
