export interface Room {
	tileset: string; 
	layout: number[][]; //The first 32 (0-31) tiles of the tileset are colliding; 
	overlay?: number[][];
}

export interface Weapon {
	itemgroup: string;
	abilities: string[];
	tile: number[][];
}