import { NpcPositioning, Opening, Room, Scripting } from '../../../typings/custom';
import { generateTilemap } from './drawDungeon';

export const BLOCK_SIZE = 8;
export const TILE_SIZE = 4;
export const FLOOR = 32;
export const LEFT = 'left';
export const LEFT_UPPER = 'left_upper';
export const LEFT_LOWER = 'left_lower';
export const RIGHT = 'right';
export const RIGHT_UPPER = 'right_upper';
export const RIGHT_LOWER = 'right_lower';
export const TOP = 'top';
export const BOTTOM = 'bottom';

// tslint:disable: no-magic-numbers
const TILED_FLOOR = [
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32]
];

const LEFT_WALL = [
	[162, 32, 32, 32],
	[162, 32, 32, 32],
	[162, 32, 32, 32],
	[162, 32, 32, 32]
];

const RIGHT_WALL = [
	[ 32, 32, 32,160],
	[ 32, 32, 32,160],
	[ 32, 32, 32,160],
	[ 32, 32, 32,160]
];

const BOTTOM_WALL = [
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[121,121,121,121]
];

const TOP_WALL = [
	[201,201,201,201],
	[  2,  2,  2,  2],
	[ 42, 42, 42, 42],
	[ 32, 32, 32, 32]
];

const TOP_OPENING_LEFT = [
	[202, 32, 32, 32],
	[  3, 32, 32, 32],
	[ 43, 32, 32, 32],
	[ 32, 32, 32, 32]
];

const TOP_OPENING_RIGHT = [
	[ 32, 32, 32,200],
	[ 32, 32, 32,  1],
	[ 32, 32, 32, 41],
	[ 32, 32, 32, 32]
];

const LEFT_OPENING_UPPER = [
	[202, 32, 32, 32],
	[  3, 32, 32, 32],
	[ 43, 32, 32, 32],
	[ 32, 32, 32, 32]
];

const LEFT_OPENING_LOWER = [
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[122, 32, 32, 32]
];

const RIGHT_OPENING_UPPER = [
	[ 32, 32, 32,200],
	[ 32, 32, 32,  1],
	[ 32, 32, 32, 41],
	[ 32, 32, 32, 32]
];

const RIGHT_OPENING_LOWER = [
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32,120]
];

const BOTTOM_OPENING_LEFT = [
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[122, 32, 32, 32]
];

const BOTTOM_OPENING_RIGHT = [
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32, 32],
	[ 32, 32, 32,120]
];

const TOP_LEFT_CORNER = [
	[164,201,201,201],
	[162,  2,  2,  2],
	[162, 42, 42, 42],
	[162, 32, 32, 32]
];

const TOP_RIGHT_CORNER = [
	[201,201,201,163],
	[  2,  2,  2,160],
	[ 42, 42, 42,160],
	[ 32, 32, 32,160]
];

const BOTTOM_RIGHT_CORNER = [
	[ 32, 32, 32,160],
	[ 32, 32, 32,160],
	[ 32, 32, 32,160],
	[121,121,121,123]
];

const BOTTOM_LEFT_CORNER = [
	[162, 32, 32, 32],
	[162, 32, 32, 32],
	[162, 32, 32, 32],
	[124,121,121,121]
];

export default class RoomGenerator {
	minSize: number = 1;
	maxSize: number = 3*this.minSize;

	blocksUsed: number[][];

	private roomSize(min: number, max: number) {
			const factor = Math.max(min,(Math.floor(Math.random() * 100)) % max);
		return factor;
	}

	/**
	 * - The rooms are built from block tiles of size 4x4 tiles each,
	 *   and their heights and widths are multiples of 8.
	 * - All rooms have their entrances in the middle, 
	 *   i.e. there are no doors on corners, etc.
	 * - Rooms can have 1-4 entrances.
	 * - A side with an entrance is at least 3x8 in length.
	 *   For example if a door is on the top, the width of the room
	 *   is at least 24 tiles (== 6 block tiles == 3 blocks) long.
	 * - An entrance can be in any of the four major directions.
	 * - The orientation and number of entrances is chosen at random.
	 * 
	 * Note: The names 'door' and 'entrance' are used interchangably here.
	 *
	 * @param roomTileset Tileset to be used for the generated room.
	 */
	public generateRoom: (roomTileset: string) => Room = (roomTileset) => {
		let roomHeight = this.roomSize(this.minSize,this.maxSize);
		let roomWidth = this.roomSize(this.minSize,this.maxSize);

		// Create some random name, which should be unique.
		const roomName: string = 'awsomeRoom'+((new Date().getTime())+(Math.floor(Math.random() * 1000))%1000);

		let room: number[][] = [];

		// Set the number of entrances the room will have, this is between 1 and 4.
		const entranceCnt: number = Math.max(1,(Math.floor(Math.random() * 10)) % 4);

		// Mapping for the generated orientations to strings. I am using strings,
		// because it makes things easier to read.
		const orientations: number[] = [];
		const orientationStr: string[] = [];
		const orientationMap = {0: 'top', 1: 'right', 2: 'bottom', 3: 'left'};

		// Set the orientation for each entrance.
		for(let i=0;i<entranceCnt;i++) {
			let orient: number = (Math.floor(Math.random() * 10)) % 4;

			// NOTE: This is commented out decrease the number of entrances on average.
			// Make sure that each orientation is selected only once.
			for(let i=0;i<entranceCnt;i++) {
				if(orientations.includes(orient)) {
					orient = orient === 3 ? 0 : orient+1;
				} else {
					break;
				}
			}

			// Get the string representation of the orientation and push it 
			// to the list of entrances to be created.
			orientations.push(orient);
			switch(orient) {
				case 0: orientationStr.push(orientationMap[orient]); break;
				case 1: orientationStr.push(orientationMap[orient]); break;
				case 2: orientationStr.push(orientationMap[orient]); break;
				case 3: orientationStr.push(orientationMap[orient]); break;
				default: console.error("Orientation not possible");
			}
		}

		const orientation: [[number,number,string]] = [[0,0,'']];

		let actualHeight: number;
		let acutalWidth: number;

		room = assemble(roomHeight,roomWidth,orientationStr);
		for(let i=0;i<orientations.length;i++) {
			const roomOrientation = orientations[i];
			switch(roomOrientation) {
				case 0:
					actualHeight = room.length/BLOCK_SIZE;
					acutalWidth = room[0].length/BLOCK_SIZE;
					orientation.push([-1, Math.floor(acutalWidth/2), orientationMap[roomOrientation]]);
					break;
				case 1:
					actualHeight = room.length/BLOCK_SIZE;
					acutalWidth = room[0].length/BLOCK_SIZE;
					orientation.push([Math.floor(actualHeight/2), acutalWidth, orientationMap[roomOrientation]]);
					break;
				case 2:
					actualHeight = room.length/BLOCK_SIZE;
					acutalWidth = room[0].length/BLOCK_SIZE;
					orientation.push([actualHeight, Math.floor(acutalWidth/2), orientationMap[roomOrientation]]);
					break;
				case 3:
					actualHeight = room.length/BLOCK_SIZE;
					acutalWidth = room[0].length/BLOCK_SIZE;
					orientation.push([Math.floor(actualHeight/2),-1, orientationMap[roomOrientation]]);
					break;
				default:
			}
		}

		/* We need an opening in the room for to be connected to any other room.
		 * 0 == north ^= top
		 * 1 == east ^= right
		 * 2 == south ^= bottom
		 * 3 == west ^= left
		 */
		// const roomOrientation = (Math.floor(Math.random() * 10)) % 4;

		// Console output
		const h1 = ([1,3].some(elem => orientations.includes(elem)) && roomHeight < 3) ? '(+'+(3-roomHeight)+')' : '';
		const w1 = ([0,2].some(elem => orientations.includes(elem)) && roomWidth < 3) ? '(+'+(3-roomWidth)+')': '';

		// tslint:disable-next-line: no-console
		console.log('Creating ' + roomName + ' of size ' + roomHeight + h1 + 'x' + roomWidth + w1);
		// end Console output

		// let debugOutput = '';
		// for(let i=0;i<room.length;i++) {
		// 	for(let j=0;j<room[i].length;j++) {
		// 		if(room[i][j] < 10) {
		// 			debugOutput += ' ';
		// 		}
		// 		debugOutput += room[i][j];
		// 	}
		// 	debugOutput += '\n';
		// }

		// console.log(debugOutput);

		const ret: Room = {
				tileset: roomTileset,
				layout: room,
				openings: orientation.slice(1) as Opening[],
				name: roomName,
				scripts: {} as Scripting,
				// npcs,
				// usedNpcTypes: ['enemy-zombie']
		};
		return ret as Room;
	}
}

// Ceate top, middle, and bottom parts of rooms and put them together.
// If necessary add multiple middle parts to reach the desired room size.
function assemble(roomHeight: number, roomWidth: number, orientations: string[]) {
	let result: number[][] = []; 

	const top: number[][] = genTopPart(roomWidth,orientations);


	// Remove left and right orientations. If the resulting list ist not empty
	// we know that there exists a door on top or at the bottom and we need to
	// make the middle part wide enough to fit the door.
	const topBottomOrientation: string[] = orientations.filter(elem => ![LEFT,RIGHT].includes(elem));

	// Height of half the room. To set the doors halfway into a vertical wall
	// the parts above and below the door need to the same size. The '-3'
	// accounts for the top, bottom and possible middle part that has a door.
	const height = Math.max(1,(roomHeight-3)/2);

	let middle: number[][] = []; 
	for(let i=0;i<height;i++) {
		middle = middle.concat(genMiddlePart(roomWidth,topBottomOrientation));
	}

	// Build a middle part with a door
	// TODO: Check if the room is not too small if we have no left/right door.
	if(orientations.some(elem => [LEFT,RIGHT].includes(elem))) {
		let upper: string[] = [];
		let lower: string[] = [];

		topBottomOrientation.forEach( e => {upper.push(e);lower.push(e);});

		// Set left door if necessary
		if(orientations.includes(LEFT)) {
			upper.push(LEFT_UPPER);
			lower.push(LEFT_LOWER);
		}

		// Set right door ifnecessary
		if(orientations.includes(RIGHT)) {
			upper.push(RIGHT_UPPER);
			lower.push(RIGHT_LOWER);
		}

		// Doors consist of two middle parts, since our passages are 6 tiles
		// wide.
		middle = middle.concat(genMiddlePart(roomWidth,upper))
					   .concat(genMiddlePart(roomWidth,lower));
	}

	for(let i=0;i<(Math.max(1,height));i++) {
		middle = middle.concat(genMiddlePart(roomWidth,topBottomOrientation));
	}

	const bottom: number[][] = genBottomPart(roomWidth,orientations);


	// Assemble the room from the three parts.
	result = top.concat(middle).concat(bottom);

	return result;
}

/**
 * Genereate the 'middle' part of the room, which has neither top walls, nor bottom walls.
 * @param roomWidth Width of the room.
 * @param withDoor Sets if the left or right side has an entrance,
 *                 and if the upper or lower part of the entrance is to be generated.
 */
function genMiddlePart(roomWidth: number, withDoor: string[] = []) {
		let doorOffset: number = 0;
			// console.log("#tops and bottoms: "+withDoor)
		if([TOP,BOTTOM].some(elem => withDoor.includes(elem))) {
			// console.log("tops and bottoms: "+withDoor)
			doorOffset = 2;
		}

		const middlePart: number[][] = [];

		for(let i=0;i<TILE_SIZE;i++) {

			// Door part
			let firstSegment: number[] = LEFT_WALL[i];

			if(withDoor.includes(LEFT_UPPER)) {
				firstSegment = LEFT_OPENING_UPPER[i];
			} else if(withDoor.includes(LEFT_LOWER)) {
				firstSegment = LEFT_OPENING_LOWER[i];
			}

			middlePart[i] = firstSegment;
			// end Door part

			for(let j=0;j<Math.max(2+doorOffset,(roomWidth*2)-2);j++)  {
				middlePart[i] = middlePart[i].concat(TILED_FLOOR[i]);
			}

			let lastSegment: number[] = RIGHT_WALL[i];

			if(withDoor.includes(RIGHT_UPPER)) {
				lastSegment = RIGHT_OPENING_UPPER[i];
			} else if(withDoor.includes(RIGHT_LOWER)) {
				lastSegment = RIGHT_OPENING_LOWER[i];
			}

			middlePart[i] = middlePart[i].concat(lastSegment);
		}

		return middlePart;
}

/**
 * Genereate the part of the room with the bottom walls.
 * @param roomWidth Width of the room.
 * @param withDoor Sets if the wall should have a door, or not. Value 'top' sets a wall.
 */
function genBottomPart(roomWidth: number, withDoor: string[] = []) {
		const doorSize = [TOP,BOTTOM].some(elem => withDoor.includes(elem)) ? 2 : 0;
		// const doorSize = 2;

		const bottomPart: number[][] = [];
		for(let i=0;i<TILE_SIZE;i++) {

			bottomPart[i] = BOTTOM_LEFT_CORNER[i];

			const width: number = Math.max(1,(roomWidth-1-doorSize));

			// Add buffer walls before the entrance. This is sized s.t.
			// the door is in the middle of the wall.
			for(let j=0;j<width;j++)  {
				bottomPart[i] = bottomPart[i].concat(BOTTOM_WALL[i]);
			}

			// Door segment
			let segment: number[] = []; // BOTTOM_WALL[i].concat(BOTTOM_WALL[i]);

			// If the door is on the bottom we need to add an opening, otherwise we add a wall
			if(withDoor.includes(BOTTOM)) {
				segment = BOTTOM_OPENING_LEFT[i].concat(BOTTOM_OPENING_RIGHT[i]);

			} else if(withDoor.includes(TOP)) {
				segment = BOTTOM_WALL[i].concat(BOTTOM_WALL[i]);
			}
			// end Door segment

			bottomPart[i] = bottomPart[i].concat(segment);

			// Add buffer walls after the entrance. This is sized s.t. the door is in the middle of the wall.
			for(let j=0;j<Math.max(1,width);j++)  {
				bottomPart[i] = bottomPart[i].concat(BOTTOM_WALL[i]);
			}

			bottomPart[i] = bottomPart[i].concat(BOTTOM_RIGHT_CORNER[i]);
		}

		return bottomPart;
}

/**
 * Genereate the part of the room with the top walls.
 * @param roomWidth Width of the room.
 * @param withDoor Sets if the wall should have a door, or not. Value 'bottom' sets a wall.
 */
function genTopPart(roomWidth: number, withDoor: string[] = []) {
		const doorSize = [TOP,BOTTOM].some(elem => withDoor.includes(elem)) ? 2 : 0;

		const topPart: number[][] = [];
		for(let i=0;i<TILE_SIZE;i++) {

			topPart[i] = TOP_LEFT_CORNER[i];

			const width: number = Math.max(1,(roomWidth-1-doorSize));

			// Add buffer walls before the entrance. This is sized s.t.
			// the door is in the middle of the wall.
			for(let j=0;j<width;j++)  {
				topPart[i] = topPart[i].concat(TOP_WALL[i]);
			}

			// Door part
			let segment: number[] = []; // TOP_WALL[i].concat(TOP_WALL[i]);

			// If the door is on the top we need to add an opening, otherwise we add a wall
			if(withDoor.includes(TOP)) {
				segment = TOP_OPENING_LEFT[i].concat(TOP_OPENING_RIGHT[i]);
			} else if(withDoor.includes(BOTTOM)) {
				segment = TOP_WALL[i].concat(TOP_WALL[i]);
			}

			topPart[i] = topPart[i].concat(segment);
			// end Door part

			// Add buffer walls after the entrance. This is sized s.t. the door is in the middle of the wall.
			for(let j=0;j<Math.max(1,width);j++)  {
				topPart[i] = topPart[i].concat(TOP_WALL[i]);
			}

			topPart[i] = topPart[i].concat(TOP_RIGHT_CORNER[i]);
		}

		return topPart;
}
