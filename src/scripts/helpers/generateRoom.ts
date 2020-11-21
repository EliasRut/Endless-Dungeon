import { NpcPositioning, Opening, OpeningDirection, Room, Scripting } from "../../../typings/custom";

export const BLOCK_SIZE = 8;
export const FLOOR = 32;

const TILED_FLOOR = [
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32]
];

const LEFT_WALL = [
  [  6, 32, 32, 32],
  [  6, 32, 32, 32],
  [  6, 32, 32, 32],
  [  6, 32, 32, 32]
];

const RIGHT_WALL = [
  [32, 32, 32,  4],
  [32, 32, 32,  4],
  [32, 32, 32,  4],
  [32, 32, 32,  4]
];

const BOTTOM_WALL = [
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [ 2,  2,  2,  2]
];

const TOP_WALL = [
  [ 8,  8,  8,  8],
  [15, 15, 15, 15],
  [18, 18, 18, 18],
  [32, 32, 32, 32]
];

const TOP_OPENING_LEFT = [
  [ 8, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32]
];

const TOP_OPENING_RIGHT = [
  [32, 32, 32,  8],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32]
];

const LEFT_OPENING_UPPER = [
  [ 6, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32]
];

const LEFT_OPENING_LOWER = [
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [6, 32, 32, 32]
];

const RIGHT_OPENING_UPPER = [
  [32, 32, 32,  4],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32]
];

const RIGHT_OPENING_LOWER = [
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32,  4]
];

const BOTTOM_OPENING_LEFT = [
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [ 2, 32, 32, 32]
];

const BOTTOM_OPENING_RIGHT = [
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32,  2]
];

const TOP_LEFT_CORNER = [
  [13,  8,  8,  8],
  [ 6, 32, 32, 32],
  [ 6, 32, 32, 32],
  [ 6, 32, 32, 32]
];

const TOP_RIGHT_CORNER = [
  [ 8,  8,  8, 12],
  [32, 32, 32,  4],
  [32, 32, 32,  4],
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
  minSize: number = 2;
  maxSize: number = 2*this.minSize;

  blocksUsed: number[][];

  private roomLength(min: number, max: number) {
      const factor = Math.max(min,(Math.floor(Math.random() * 100)) % max)
      console.log(factor+" * "+BLOCK_SIZE);
    return BLOCK_SIZE * factor;
  }

  public generateRoom: (roomTileset: string) => Room = (roomTileset) => {
    const roomHeight = this.roomLength(this.minSize,this.maxSize);
    const roomWidth = this.roomLength(this.minSize,this.maxSize);

    const roomName: string = "awsomeRoom"+(Math.floor(Math.random() * 1000));
    console.log("Creating "+roomName+" of size "+roomHeight+"x"+roomWidth);

    let room: number[][] = [];


    // Draw the outer walls of the room
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
          } else if(y === roomHeight-1) {
              room[y][x] = 2;
          }
      }
    }
    room[0][0] = 13;
    room[0][room[0].length-1] = 12;
    room[room.length-1][0] = 11;
    room[room.length-1][room[0].length-1] = 10;

    /* We need an opening in the room for to be connected to any other room.
     * 0 == north
     * 1 == east
     * 2 == south
     * 3 == west
     */
    const roomOrientation = 0; //(Math.random() * 100) % 4;
    const orientationMap = {0: 'top', 1: 'right', 2: 'bottom', 3: 'left'}
    let orientation: [[number,number,string]] = [[0,0,'']];
    const doorSize = 6;
    
    switch(roomOrientation) {
      case 0: 
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
        orientation.push([-1, 1, orientationMap[roomOrientation]]);
        break;
      // case 1: 
      //   break;
      // case 2: 
      //   break;
      // case 3: 
      //   break;
      default:
    }

    let test = TOP_LEFT_CORNER;
    for(let i=0;i<test.length;i++) {
      test[i] = TOP_LEFT_CORNER[i]
                  .concat(TOP_WALL[i])
                  .concat(TOP_OPENING_LEFT[i])
                  .concat(TOP_OPENING_RIGHT[i])
                  .concat(TOP_WALL[i])
                  .concat(TOP_RIGHT_CORNER[i]);
    }
    let test2: number[][] = [];
    for(let i=0;i<test.length;i++) {
      test2[i] = LEFT_WALL[i]
                  .concat(TILED_FLOOR[i])
                  .concat(TILED_FLOOR[i])
                  .concat(TILED_FLOOR[i])
                  .concat(TILED_FLOOR[i])
                  .concat(RIGHT_WALL[i]);
    }

    test = test.concat(test2);


    let debugOutput = '';
    for(let i=0;i<test.length;i++) {
      for(let j=0;j<test[i].length;j++) {
        if(test[i][j] < 10) {
          debugOutput += ' ';
        }
        debugOutput += test[i][j] + ' ';
      }
      debugOutput += '\n';
    }

    console.log(debugOutput)


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
