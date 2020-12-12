import { Opening, Room, Scripting } from '../../../typings/custom';

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
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 32]
];

const LEFT_WALL = [
	[ 6, 32, 32, 32],
	[ 6, 32, 32, 32],
	[ 6, 32, 32, 32],
	[ 6, 32, 32, 32]
];

const RIGHT_WALL = [
	[32, 32, 32, 4],
	[32, 32, 32, 4],
	[32, 32, 32, 4],
	[32, 32, 32, 4]
];

const BOTTOM_WALL = [
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[ 2,  2,  2,  2]
];

const TOP_WALL = [
	[ 8,  8,  8,  8],
	[22, 15, 15, 22],
	[25, 18, 18, 25],
	[39, 32, 32, 39]
];

const TOP_OPENING_LEFT = [
	[ 9, 32, 32, 32],
	[15, 32, 32, 32],
	[18, 32, 32, 32],
	[32, 32, 32, 32]
];

const TOP_OPENING_RIGHT = [
	[32, 32, 32,  7],
	[32, 32, 32, 15],
	[32, 32, 32, 18],
	[32, 32, 32, 32]
];

const LEFT_OPENING_UPPER = [
	[ 9, 32, 32, 32],
	[15, 32, 32, 32],
	[18, 32, 32, 32],
	[32, 32, 32, 32]
];

const LEFT_OPENING_LOWER = [
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[48, 32, 32, 32]
];

const RIGHT_OPENING_UPPER = [
	[32, 32, 32,  7],
	[32, 32, 32, 15],
	[32, 32, 32, 18],
	[32, 32, 32, 32]
];

const RIGHT_OPENING_LOWER = [
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 49]
];

const BOTTOM_OPENING_LEFT = [
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[48, 32, 32, 32]
];

const BOTTOM_OPENING_RIGHT = [
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 32],
	[32, 32, 32, 49]
];

const TOP_LEFT_CORNER = [
	[13,  8,  8,  8],
	[ 6, 15, 15, 15],
	[ 6, 18, 18, 18],
	[ 6, 32, 32, 32]
];

const TOP_RIGHT_CORNER = [
	[ 8,  8,  8, 12],
	[15, 15, 15,  4],
	[18, 18, 18,  4],
	[32, 32, 32,  4]
];

const BOTTOM_RIGHT_CORNER = [
	[32, 32, 32,  4],
	[32, 32, 32,  4],
	[32, 32, 32,  4],
	[ 2,  2,  2, 10]
];

const BOTTOM_LEFT_CORNER = [
	[ 6, 32, 32, 32],
	[ 6, 32, 32, 32],
	[ 6, 32, 32, 32],
	[11,  2,  2,  2]
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
	 * - The rooms are built from tile blocks of size 4x4,
	 *   and their heights and widths are multiples of 8.
	 * - All rooms have their entrances in the middle of the room.
	 * - The side with the entrance is at least 3x8 in Size.
	 *   For example if the door is on the top, the width of the room
	 *   is at least 24 tiles long.
	 * - An entrance can be in any of the four major directions.
	 *   The orientation is chosen at random.
	 *
	 * @param roomTileset Tileset to be used for the generated room.
	 */
	public generateRoom: (roomTileset: string) => Room = (roomTileset) => {
		let roomHeight = this.roomSize(this.minSize,this.maxSize);
		let roomWidth = this.roomSize(this.minSize,this.maxSize);

		const roomName: string = 'awsomeRoom'+(Math.floor(Math.random() * 1000));

		let room: number[][] = [];

		/*
		// Initial variant build the room by specifically setting the
		// walls, etc.

		 Draw the outer walls of the room
		 for (let y = 0; y < roomHeight; y++) {
				 room[y] = [];
			 for (let x = 0; x < roomWidth; x++) {
					 room[y][x] = FLOOR;

					 if(y === 0) {
							 room[y][x] = 8;
					 } else if(x === 0) {
							 room[y][x] = 6;
					 } else if(x === roomWidth-1) {
							 room[y][x] = 4;
					 } else if(y === roomHeight-7) {
							 room[y][x] = 2;
					 }
			 }
		 }
		 room[0][0] = 13;
		 room[0][room[0].length-1] = 12;
		 room[room.length-1][0] = 11;
		 room[room.length-1][room[0].length-1] = 10;
		*/

		/* We need an opening in the room for to be connected to any other room.
		 * 0 == north ^= top
		 * 1 == east ^= right
		 * 2 == south ^= bottom
		 * 3 == west ^= left
		 */
		const roomOrientation = (Math.floor(Math.random() * 10)) % 4;
		const orientationMap = {0: 'top', 1: 'right', 2: 'bottom', 3: 'left'};
		const orientation: [[number,number,string]] = [[0,0,'']];

		// Console output
		const h1 = ([1,3].includes(roomOrientation) && roomHeight < 3) ? '(+'+(3-roomHeight)+')' : '';
		const w1 = ([0,2].includes(roomOrientation) && roomWidth < 3) ? '(+'+(3-roomWidth)+')': '';

		console.log('Creating '+roomName+' of size '+roomHeight+h1+'x'+roomWidth+w1);
		// end Console output

		// Update roomsize to actual size that is going to be created.
		if([1,3].includes(roomOrientation) && roomHeight < 3) {
			roomHeight = 3;
		}

		if([0,2].includes(roomOrientation) && roomWidth < 3) {
			roomWidth = 3;
		}


		// Depending on the orientation generate one of the layouts below and set
		// the orientation for the dungeon config.
		switch(roomOrientation) {
			case 0:
				room = layoutTopBottomEntrance(roomHeight,roomWidth,TOP);
				// Part of the initial implementation.
				/*
				 const startIndex = 9;//Math.max(0,((room[0].length-doorSize)/2)+1);
				 if(0 < startIndex-1) {
					 room[0][startIndex-1] = 9;
				 }

				 if(room[0].length-1 > startIndex + doorSize) {
					 room[0][startIndex + doorSize] = 7;
				 }
				 for(let i=startIndex;i < Math.min(room[0].length,startIndex + doorSize);i++) {
						 room[0][i] = 32;
				 }
				*/

				let actualHeight = room.length/BLOCK_SIZE;
				let acutalWidth = room[0].length/BLOCK_SIZE;
				orientation.push([-1, Math.ceil(acutalWidth/2), orientationMap[roomOrientation]]);
				break;
			case 1:
				room = layoutLeftRightEntrance(roomHeight,roomWidth,RIGHT);

				actualHeight = room.length/BLOCK_SIZE;
				acutalWidth = room[0].length/BLOCK_SIZE;
				orientation.push([Math.floor(actualHeight/2), acutalWidth, orientationMap[roomOrientation]]);
				break;
			case 2:
				room = layoutTopBottomEntrance(roomHeight,roomWidth,BOTTOM);

				actualHeight = room.length/BLOCK_SIZE;
				acutalWidth = room[0].length/BLOCK_SIZE;
				orientation.push([actualHeight, Math.floor(acutalWidth/2), orientationMap[roomOrientation]]);
				break;
			case 3:
				room = layoutLeftRightEntrance(roomHeight,roomWidth,LEFT);

				actualHeight = room.length/BLOCK_SIZE;
				acutalWidth = room[0].length/BLOCK_SIZE;
				orientation.push([Math.floor(actualHeight/2),-1, orientationMap[roomOrientation]]);
				break;
			default:
		}

		let debugOutput = '';
		for(let i=0;i<room.length;i++) {
			for(let j=0;j<room[i].length;j++) {
				if(room[i][j] < 10) {
					debugOutput += ' ';
				}
				debugOutput += room[i][j];
			}
			debugOutput += '\n';
		}

		console.log(debugOutput);

		const ret: {tileset: string,
								layout: number[][],
								openings: Opening[],
								name: string,
								scripts: Scripting} = {
				tileset: roomTileset,
				layout: room,
				openings: orientation.slice(1) as Opening[],
				name: roomName,
				scripts: {} as Scripting
		};
		return ret as Room;
	}
}

/**
 * Generate layouts for rooms with doors on top or at the bottom.
 * @param roomHeight Room height
 * @param roomWidth Room width
 * @param orientation Sets the door position. Either 'top' or 'bottom'. Other values are ignored.
 */
function layoutTopBottomEntrance(roomHeight: number, roomWidth: number, orientation: string) {

		const topPart: number[][] = genTopPart(roomWidth,orientation);

		let middlePart: number[][] = [];

		for(let i=0;i<(roomHeight-1)*2;i++) {
			middlePart = middlePart.concat(genMiddlePart(roomWidth,orientation));
		}

		const bottomPart: number[][] = genBottomPart(roomWidth,orientation);

		return topPart.concat(middlePart).concat(bottomPart);
}

/**
 * Generate layouts for rooms with doors on the left or on the right.
 * @param roomHeight Room height
 * @param roomWidth Room width
 * @param orientation Sets the door position. Either 'left' or 'right'. Other values are ignored.
 */
function layoutLeftRightEntrance(roomHeight: number, roomWidth: number, orientation: string) {

		const topPart: number[][] = genTopPart(roomWidth);

		let middlePart: number[][] = [];

		// -2 for the door parts, and -1 for the bottom part
		const height = Math.max(1,((roomHeight-3)/2));

		for(let i=0;i<height;i++) {
			middlePart = middlePart.concat(genMiddlePart(roomWidth));
		}

		// Door part
		let upper: string = RIGHT_UPPER;
		let lower: string = RIGHT_LOWER;

		if(orientation === LEFT) {
			upper = LEFT_UPPER;
			lower = LEFT_LOWER;
		}

		// const upper: string = orientation === LEFT ? LEFT_UPPER : RIGHT_UPPER;
		middlePart = middlePart.concat(genMiddlePart(roomWidth,upper));

		// const lower: string = orientation === LEFT ? LEFT_LOWER : RIGHT_LOWER;
		middlePart = middlePart.concat(genMiddlePart(roomWidth,lower));

		// end Door part

		// -2 for the door parts
		for(let i=0;i<(Math.max(1,height));i++) {
			middlePart = middlePart.concat(genMiddlePart(roomWidth));
		}

		const bottomPart: number[][] = genBottomPart(roomWidth);

		return topPart.concat(middlePart).concat(bottomPart);

}

/**
 * Genereate the 'middle' part of the room, which has neither top walls, nor bottom walls.
 * @param roomWidth Width of the room.
 * @param withDoor Sets if the left or right side has an entrance,
 *                 and if the upper or lower part of the entrance is to be generated.
 */
function genMiddlePart(roomWidth: number, withDoor: string = '') {
		let doorOffset: number = 0;
		if([TOP,BOTTOM].includes(withDoor)) {
			doorOffset = 2;
		}

		const middlePart: number[][] = [];

		for(let i=0;i<TILE_SIZE;i++) {

			// Door part
			let firstSegment: number[] = LEFT_WALL[i];

			if(withDoor === LEFT_UPPER) {
				firstSegment = LEFT_OPENING_UPPER[i];
			} else if(withDoor === LEFT_LOWER) {
				firstSegment = LEFT_OPENING_LOWER[i];
			}

			middlePart[i] = firstSegment;
			// end Door part

			for(let j=0;j<Math.max(2+doorOffset,(roomWidth*2)-2);j++)  {
				middlePart[i] = middlePart[i].concat(TILED_FLOOR[i]);
			}

			let lastSegment: number[] = RIGHT_WALL[i];

			if(withDoor === RIGHT_UPPER) {
				lastSegment = RIGHT_OPENING_UPPER[i];
			} else if(withDoor === RIGHT_LOWER) {
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
function genBottomPart(roomWidth: number, withDoor: string = '') {
		const doorSize = [TOP,BOTTOM].includes(withDoor) ? 2 : 0;
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
			if(withDoor === BOTTOM) {
				segment = BOTTOM_OPENING_LEFT[i].concat(BOTTOM_OPENING_RIGHT[i]);

			} else if(withDoor === TOP) {
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
function genTopPart(roomWidth: number, withDoor: string = '') {
		const doorSize = [TOP,BOTTOM].includes(withDoor) ? 2 : 0;

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
			if(withDoor === TOP) {
				segment = TOP_OPENING_LEFT[i].concat(TOP_OPENING_RIGHT[i]);

			} else if(withDoor === BOTTOM) {
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
