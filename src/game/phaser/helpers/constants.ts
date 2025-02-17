import { EnumDictionary } from '../../../../typings/custom';
import { SimpleParticleEffectValue } from '../../../types/AbilityType';
import { EnemyData } from '../enemies/enemyData';
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
	ALLIES,
}

export const enum AbilityKey {
	ONE = 0,
	TWO = 1,
	THREE = 2,
	FOUR = 3,
	FIVE = 4,
	SPACE = 5,
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
	FLOATING_HEALTHBAR_LAYER = 8,
	FLOATING_TEXT_LAYER = 9,

	UI_BACKGROUND_LAYER = 10,
	UI_MAIN_LAYER = 11,
	UI_FOREGROUND_LAYER = 12,
	UI_ABOVE_FOREGROUND_LAYER = 13,

	UI_STICK_LAYER = 14,
}

export const COLUMNS_PER_TILESET = 44;
export const getTileIndex = (row: number, col: number) => row * COLUMNS_PER_TILESET + col;

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

export const statDisplayNames = {
	maxHealth: 'Maxmum Health',
	damage: 'Damage',
	luck: 'Luck',
	movementSpeed: 'Movement Speed',
};

export enum ColorsOfMagic {
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
};

export const npcToAespriteMap: { [name: string]: { png: string; json: string } } = {
	player: { png: 'assets/sprites/player.png', json: 'assets/sprites/player.json' },
	agnes: { png: 'assets/sprites/agnes.png', json: 'assets/sprites/agnes.json' },
	rich: { png: 'assets/sprites/rich.png', json: 'assets/sprites/rich.json' },
	jacques: { png: 'assets/sprites/jacques.png', json: 'assets/sprites/jacques.json' },
	pierre: { png: 'assets/sprites/pierre.png', json: 'assets/sprites/pierre.json' },
	'lich-king': { png: 'assets/sprites/rich.png', json: 'assets/sprites/rich.json' },
	firesprite: { png: 'assets/sprites/firesprite.png', json: 'assets/sprites/firesprite.json' },
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
	// 'jacques': {
	// 	prepare: {
	// 		file: 'assets/sprites/jacques-charge.png',
	// 		framesPerDirection: 16,
	// 		frameOffset: 0,
	// 		animationFrames: 9,
	// 	},
	// 	fly: {
	// 		file: 'assets/sprites/jacques-charge.png',
	// 		framesPerDirection: 16,
	// 		frameOffset: 9,
	// 		animationFrames: 1,
	// 	},
	// 	stun: {
	// 		file: 'assets/sprites/jacques-charge.png',
	// 		framesPerDirection: 16,
	// 		frameOffset: 10,
	// 		animationFrames: 4,
	// 	},
	// 	recover: {
	// 		file: 'assets/sprites/jacques-charge.png',
	// 		framesPerDirection: 16,
	// 		frameOffset: 14,
	// 		animationFrames: 2,
	// 	},
	// },
	// player: {
	// 	damage: {
	// 		file: 'assets/sprites/main-character-damagestun.png',
	// 		framesPerDirection: 12,
	// 		frameOffset: 0,
	// 		animationFrames: 4,
	// 	},
	// 	stun: {
	// 		file: 'assets/sprites/main-character-damagestun.png',
	// 		framesPerDirection: 12,
	// 		frameOffset: 4,
	// 		animationFrames: 8,
	// 	},
	// },
};

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
	[ColorsOfMagic.WILD]: 'COM-wild-B',
	[ColorsOfMagic.ROYAL]: 'COM-death-B',
};

export const NpcTypeList = ['rich', 'jacques', 'pierre'];
export const SummonsTypeList = ['firesprite'];

export const EnemyByColorOfMagicMap: { [color: string]: [number, string, Partial<EnemyData>?][] } =
	{
		[ColorsOfMagic.FLUX]: [
			[0.5, 'rich'],
			[0.85, 'jacques'],
			[1, 'pierre'],
		],
		[ColorsOfMagic.METAL]: [
			[0.5, 'rich'],
			[0.85, 'jacques'],
			[1, 'pierre'],
		],
		[ColorsOfMagic.CHANGE]: [
			[0.5, 'rich'],
			[0.85, 'jacques'],
			[1, 'pierre'],
		],
		[ColorsOfMagic.BLOOD]: [
			[0.5, 'rich'],
			[0.85, 'jacques'],
			[1, 'pierre'],
		],
		[ColorsOfMagic.DEATH]: [
			[0.25, 'rich', { useSpawnAnimation: false }],
			[0.5, 'rich', { useSpawnAnimation: true, spawnOnVisible: true }],
			[0.85, 'jacques'],
			[1, 'pierre'],
		],
		[ColorsOfMagic.PASSION]: [
			[0.5, 'rich'],
			[0.85, 'jacques'],
			[1, 'pierre'],
		],
		[ColorsOfMagic.WILD]: [
			[0.5, 'rich'],
			[0.85, 'jacques'],
			[1, 'pierre'],
		],
		[ColorsOfMagic.ROYAL]: [
			[0.5, 'rich'],
			[0.85, 'jacques'],
			[1, 'pierre'],
		],
	};

export const enemyBudgetCost = {
	rich: 1,
	jacques: 1,
	pierre: 1,
	'redling-boss': 10,
};

export const enum MODE {
	GAME = 'game',
	MAP_EDITOR = 'mapEditor',
	NPC_EDITOR = 'npcEditor',
	QUEST_EDITOR = 'questEditor',
	ABILITY_EDITOR = 'abilityEditor',
}

export const enum DOOR_TYPE {
	IRON_DOOR = 'iron_door',
}

export const DOOR_OFFSETS = {
	[DOOR_TYPE.IRON_DOOR]: { x: 0, y: 3.33 },
};

export let activeMode = MODE.GAME;

export const setActiveMode = (mode: MODE) => {
	activeMode = mode;
};

export const CHARACTER_SPRITE_WIDTH = 320;
export const CHARACTER_SPRITE_HEIGHT = 240;

export const SCALE = 3;
export const UI_SCALE =
	typeof window !== 'undefined' && window.innerWidth >= 1900 && window.innerHeight >= 840 ? 3 : 2;

export enum SUMMONING_TYPE {
	FIRE_ELEMENTAL = 'fire_elemental',
	ICE_ELEMENTAL = 'ice_elemental',
	ARCANE_ELEMENTAL = 'arcane_elemental',
	NECROTIC_ELEMENTAL = 'necrotic_elemental',
}

export const NORMAL_ANIMATION_FRAME_RATE = 60;
export const NPC_ANIMATION_FRAME_RATE = 15;

export enum FadingLabelSize {
	SMALL,
	NORMAL,
	LARGE,
}

export const BaseFadingLabelFontSize = {
	[FadingLabelSize.SMALL]: 6,
	[FadingLabelSize.NORMAL]: 8,
	[FadingLabelSize.LARGE]: 12,
};

export interface FadingLabelData {
	fontSize: FadingLabelSize;
	fontElement: Phaser.GameObjects.Text | undefined;
	timestamp: number;
	timeToLive: number;
	posX: number;
	posY: number;
}

export const multiplyParticleValueByScale = (
	value: SimpleParticleEffectValue,
	effectScale: number
) => {
	if (value === undefined) {
		return undefined;
	}
	if (typeof value === 'number') {
		const valueAsAny = value as any;
		return valueAsAny * effectScale * SCALE;
	}
	if (typeof value === 'object') {
		const valueAsAny = value as any;
		return {
			...(valueAsAny.min !== undefined && valueAsAny.max !== undefined
				? {
						min: valueAsAny.min * effectScale * SCALE,
						max: valueAsAny.max * effectScale * SCALE,
				  }
				: {}),
			...(valueAsAny.start !== undefined && valueAsAny.end !== undefined
				? {
						start: valueAsAny.start * effectScale * SCALE,
						end: valueAsAny.end * effectScale * SCALE,
				  }
				: {}),
		};
	}
};

const ScaledValueKeys = ['scale', 'speed'];

export const convertEmitterDataToScaledValues = (
	config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig,
	effectScale: number
) => {
	return Object.entries(config).reduce((obj, [key, value]) => {
		obj[key] = ScaledValueKeys.includes(key)
			? multiplyParticleValueByScale(value, effectScale)
			: value;
		return obj;
	}, {} as any) as Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
};

export const MOBILE_INTERACTION_OFFSETS = 96;

export const DEBUG_PHYSICS = false;
export const DEBUG_PATHFINDING = false;
export const DEBUG_ENEMY_AI = true;
export const FPS_DEBUG = true;
export const COMBO_CAST_RESET_DELAY = 2000;
export const DASH_REVERSE_DELAY = 1500;

export const replacementTiles: EnumDictionary<
	ColorsOfMagic,
	{ [tileId: number]: [number, number][] }
> = {
	[ColorsOfMagic.DEATH]: {
		[getTileIndex(0, 2)]: [[0.9, getTileIndex(0, 13)]],
		[getTileIndex(0, 32)]: [
			[0.995, getTileIndex(1, 36)],
			[0.98, getTileIndex(0, 33)],
		],
		[getTileIndex(1, 2)]: [[0.9, getTileIndex(1, 13)]],
	},
	[ColorsOfMagic.WILD]: {
		[getTileIndex(0, 32)]: [
			[0.995, getTileIndex(0, 33)],
			[0.99, getTileIndex(0, 34)],
			[0.985, getTileIndex(0, 35)],
			[0.98, getTileIndex(0, 36)],
			[0.975, getTileIndex(0, 37)],
			[0.97, getTileIndex(1, 32)],
			[0.965, getTileIndex(1, 33)],
			[0.96, getTileIndex(1, 34)],
			[0.955, getTileIndex(1, 35)],
			[0.95, getTileIndex(1, 36)],
			[0.945, getTileIndex(1, 37)],
			[0.94, getTileIndex(1, 38)],
			[0.935, getTileIndex(1, 39)],
			[0.82, getTileIndex(2, 38)],
			[0.79, getTileIndex(2, 39)],
			[0.76, getTileIndex(3, 38)],
			[0.73, getTileIndex(3, 39)],
		],
	},
	[ColorsOfMagic.ROYAL]: {},
	[ColorsOfMagic.METAL]: {},
	[ColorsOfMagic.PASSION]: {},
	[ColorsOfMagic.FLUX]: {},
	[ColorsOfMagic.CHANGE]: {},
	[ColorsOfMagic.BLOOD]: {},
};

// [ColorsOfMagic.DEATH]: {
// 	2: [[0.9, getTileIndex(0, 13)]],
// 	32: [
// 		[0.995, getTileIndex(1, 34)],
// 		[0.98, getTileIndex(0, 33)],
// 	],
// 	42: [[0.9, getTileIndex(1, 17)]],
// },
// [ColorsOfMagic.WILD]: {
// 	32: [
// 		[0.995, getTileIndex(0, 33)],
// 		[0.99, getTileIndex(0, 34)],
// 		[0.985, getTileIndex(0, 35)],
// 		[0.98, getTileIndex(0, 36)],
// 		[0.975, getTileIndex(0, 37)],
// 		[0.97, getTileIndex(1, 33)],
// 		[0.965, getTileIndex(1, 34)],
// 		[0.96, getTileIndex(1, 35)],
// 		[0.955, getTileIndex(1, 36)],
// 		[0.95, getTileIndex(1, 37)],
// 		[0.945, getTileIndex(1, 38)],
// 		[0.94, getTileIndex(1, 39)],
// 		[0.935, getTileIndex(1, 34)],
// 		[0.82, getTileIndex(2, 33)],
// 		[0.79, getTileIndex(2, 34)],
// 		[0.76, getTileIndex(3, 33)],
// 		[0.73, getTileIndex(3, 34)],
// 	],
// },
