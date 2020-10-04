export interface NpcPositioning {
	id: string;
	x: number;
	y: number;
}

export interface ItemsPositioning {
	id: string;
	x: number;
	y: number;
}

export interface Room {
	tileset: string; 
	layout: number[][]; //The first 32 (0-31) tiles of the tileset are colliding; 
	overlay?: number[][];
	npcs?: NpcPositioning[]; //place npcs in room
	items?: ItemsPositioning[]; //place npcs in room
}

export interface Weapon {
	itemgroup: string;
	abilities: string[];
	tile: number[][];
}