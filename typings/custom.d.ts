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
}

export interface Weapon {
	itemgroup: string;
	abilities: string[];
	tile: number[][];
}