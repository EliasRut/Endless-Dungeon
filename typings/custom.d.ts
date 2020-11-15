export interface NpcPositioning {
	id: string;
	x: number;
	y: number;
}

export interface MapConnection {
  x: number;
  y: number;
  targetMap: string;
  targetX?: number;
  targetY?: number;
}

export interface ItemsPositioning {
	id: string;
	x: number;
	y: number;
}

export type OpeningDirection = "top" | "left" | "right" | "bottom";
export type Opening = [number, number, OpeningDirection];

export interface ScriptWait {
	type: "wait";
	time: number
}

export interface ScriptDialog {
	type: "dialog";
	portrait: string;
	text: string[];
}

export interface ScriptAnimation {
	type: "animation";
	target: string;
	animation: string;
	duration: number;
}

export interface ScriptSceneChange {
	type: "sceneChange";
	target: string;
}

export interface ScriptFadeIn {
	type: "fadeIn";
	time: number;
}

export interface ScriptFadeOut {
	type: "fadeOut";
	time: number;
}

export type ScriptEntry = ScriptWait | ScriptDialog | ScriptAnimation | ScriptSceneChange |
	ScriptFadeIn | ScriptFadeOut;

export interface Scripting {
	onEntry?: ScriptEntry[];
	onExit?: ScriptEntry[];
	onClear?: ScriptEntry[];
	onProximity?: {
		x: number;
		y: number;
		radius: number;
		steps: ScriptEntry[];
	}
}

export interface Room {
	startRoom?: boolean;
	tileset: string; 
	layout: number[][]; //The first 32 (0-31) tiles of the tileset are colliding; 
	overlay?: number[][];
	npcs?: NpcPositioning[]; //place npcs in room
	connections?: MapConnection[]; //place npcs in room
	items?: ItemsPositioning[]; //place npcs in room
	openings: Opening[];
	name: string;
	scripts: Scripting;
}

export interface Weapon {
	itemgroup: string;
	abilities: string[];
	tile: number[][];
}