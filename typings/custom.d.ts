import { AbilityType, AbilityData } from '../src/scripts/abilities/abilityData';
import { EnemyData } from '../src/scripts/enemies/enemyData';
import { ColorsOfMagic } from '../src/scripts/helpers/constants';
import { RandomItemOptions } from '../src/scripts/helpers/item';
import { QuestScripts } from '../src/scripts/helpers/quests';
import Follower from '../src/scripts/worldstate/Follower';

export type EnumDictionary<T extends string | symbol | number, U> = {
	[K in T]: U;
};

export type NpcScriptStep = ScriptWait | ScriptAnimation | ScriptMove | ScriptWalk;

export interface NpcScript {
	repeat: number;
	steps: NpcScriptStep[];
}

export interface NpcOptions {
	script?: NpcScript;
	questGiverId?: string;
	traderId?: string;
	useSpawnAnimation?: boolean;
	enemyData?: Partial<EnemyData>;
}

export interface NpcPositioning extends NpcOptions {
	type: string;
	id: string;
	x: number;
	y: number;
	facingX?: number;
	facingY?: number;
	level?: string;
	options?: Partial<EnemyData>;
}

export interface MapConnection {
	x: number;
	y: number;
	targetScene?: string;
	targetMap?: string;
	targetRoom?: string;
	targetX?: number;
	targetY?: number;
}

export interface ItemsPositioning {
	id: string;
	x: number;
	y: number;
}

export interface Door {
	id: string;
	x: number;
	y: number;
	type: string;
	open: boolean;
}

export type OpeningDirection = 'top' | 'left' | 'right' | 'bottom';
export type Opening = [number, number, OpeningDirection];

export interface ScriptWait {
	type: 'wait';
	time: number;
}

export interface ScriptCondition {
	type: 'condition';
	conditionType: 'hasItem' | 'scriptState';
	itemId?: string;
	scriptId?: string;
	scriptState?: 'new' | 'ongoing' | 'finished';
}

export interface ScriptPausedCondition {
	type: 'pauseUntilCondition';
	itemIds?: string[];
	itemQuantities?: number[];
	questIds?: string[];
	questStates?: ('started' | 'notStarted' | 'startedOrFinished' | 'finished' | 'notFinished')[];
	scriptIds?: string[];
	scriptStates?: ('new' | 'ongoing' | 'finished')[];
	roomName?: string;
}

export interface ScriptDialog {
	type: 'dialog';
	speaker: string;
	portrait?: string;
	text: string[];
}

export interface ScriptAnimation {
	type: 'animation';
	target?: string;
	animation: string;
	duration: number;
}

export interface ScriptCast {
	type: 'cast';
	ability: AbilityType;
}

export interface ScriptMove {
	type: 'move';
	target?: string;
	posX: number;
	posY: number;
	facingX: number; //-1, 0, 1
	facingY: number; //-1, 0, 1
}

export interface ScriptWalk {
	type: 'walk';
	target?: string;
	posX: number;
	posY: number;
}

export interface ScriptSpawn {
	facingX?: number;
	facingY?: number;
	type: 'spawn';
	npcId: string;
	npcType: string;
	posX: number;
	posY: number;
	useAnimation?: boolean;
}

export interface ScriptSpawnItem {
	type: 'spawnItem';
	fixedId?: string;
	itemOptions?: Partial<RandomItemOptions>;
	posX?: number;
	posY?: number;
	atPlayerPosition?: boolean;
}

export interface ScriptOpenDoor {
	type: 'openDoor';
	doorId: string;
}

export interface ScriptSceneChange {
	type: 'sceneChange';
	target: string;
}

export interface ScriptFadeIn {
	type: 'fadeIn';
	time: number;
}

export interface ScriptFadeOut {
	type: 'fadeOut';
	time: number;
}

export interface ScriptTakeItem {
	type: 'takeItem';
	itemId: string;
	amount: number;
}

export interface ScriptPlaceItem {
	type: 'placeItem';
	itemId: string;
	posX: number;
	posY: number;
}

export interface ScriptSetScriptState {
	type: 'setScriptState';
	scriptId: string;
	scriptState: 'new' | 'finished';
}

export interface ScriptSetQuestState {
	type: 'setQuestState';
	questId: string;
	questState: 'new' | 'ongoing' | 'finished';
}

export interface ScriptSetFollowerData {
	type: 'setFollowerData';
	follower: Follower;
}

export interface ScriptSpawnFollower {
	type: 'spawnFollower';
	followerId: string;
}

export interface ScriptDespawnFollower {
	type: 'despawnFollower';
	followerId: string;
}

export type ScriptEntry =
	| ScriptWait
	| ScriptDialog
	| ScriptAnimation
	| ScriptSceneChange
	| ScriptFadeIn
	| ScriptFadeOut
	| ScriptMove
	| ScriptWalk
	| ScriptSpawn
	| ScriptOpenDoor
	| ScriptCondition
	| ScriptSetScriptState
	| ScriptTakeItem
	| ScriptCast
	| ScriptPlaceItem
	| ScriptPausedCondition
	| ScriptSetQuestState
	| ScriptSpawnItem
	| ScriptSetFollowerData
	| ScriptSpawnFollower
	| ScriptDespawnFollower;

export interface Scripting {
	onEntry?: ScriptEntry[];
	onExit?: ScriptEntry[];
	onClear?: ScriptEntry[];
	onProximity?: {
		x: number;
		y: number;
		radius: number;
		steps: ScriptEntry[];
	};
}

export interface DatabaseRoom {
	startRoom?: boolean;
	tileset: string;
	decorationTileset?: string;
	overlayTileset?: string;
	layout: string; //The first 32 (0-31) tiles of the tileset are colliding;
	decorations: string; //The first 32 (0-31) tiles of the tileset are colliding;
	overlays: string; //The first 32 (0-31) tiles of the tileset are colliding;
	overlay?: string;
	npcs?: NpcPositioning[]; //place npcs in room
	connections?: MapConnection[];
	items?: ItemsPositioning[];
	openings: string;
	name: string;
	scripts: Scripting;
	usedNpcTypes?: string[];
	doors?: Door[];
	team?: string;
	package?: string;
}

export interface Room {
	startRoom?: boolean;
	tileset: string;
	decorationTileset?: string;
	overlayTileset?: string;
	layout: number[][]; //The first 32 (0-31) tiles of the tileset are colliding;
	decorations?: number[][]; //The first 32 (0-31) tiles of the tileset are colliding;
	overlays?: number[][]; //The first 32 (0-31) tiles of the tileset are colliding;
	npcs?: NpcPositioning[]; //place npcs in room
	connections?: MapConnection[];
	items?: ItemsPositioning[];
	openings: Opening[];
	name: string;
	scripts: Scripting;
	usedNpcTypes?: string[];
	doors?: Door[];
	title?: string;
	colorOfMagic?: ColorsOfMagic;
	noRandomEnemies?: boolean;
}

export interface Weapon {
	itemgroup: string;
	abilities: string[];
	tile: number[][];
}

export type HexValue =
	| '0'
	| '1'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'
	| 'a'
	| 'b'
	| 'c'
	| 'd'
	| 'e'
	| 'f';
export type HashtagHexColor = string;

export interface NpcData {
	name: string;
	bodyTemplate: string;
	bodyColor: HashtagHexColor;
	eyeColor: HashtagHexColor;
	hairTemplate: string;
	hairColor: HashtagHexColor;
	shirtTemplate: string;
	shirtColor1: HashtagHexColor;
	shirtColor2: HashtagHexColor;
	pantsTemplate: string;
	pantsColor: HashtagHexColor;
	shoesColor: HashtagHexColor;
}

export interface Quest {
	questGiverId?: string;
	questGiverName: string;
	preconditions?: {
		previousQuests?: string[];
		requiredItems?: ItemWithCount[];
		dungeonLevelReached?: number;
	};
	completionCriterias?: {
		previousQuests?: string[];
		hasItems?: string[];
		dungeonLevelReached?: number;
	};
	name: string;
	goal: string;
	rewards?: ItemWithCount[];
	scripts?: QuestScripts;
}

export interface ItemWithCount {
	id: string;
	count: number;
}

export interface AbilityListingConditions {
	minimumLevel?: number;
	maximumLevel?: number;
}

export interface ConditionalAbilityListing {
	abilityType: AbilityType;
	conditions?: AbilityListingConditions;
	abilityId: string;
}

export interface ConditionalAbilityData {
	conditions?: AbilityListingConditions;
	data: AbilityData;
}
