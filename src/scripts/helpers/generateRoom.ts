import { NpcPositioning, Opening, OpeningDirection, Room, Scripting } from "../../../typings/custom";

export const BLOCK_SIZE = 4;
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

const LEFT_OPENING = [
  [0, 32, 32, 32],
  [0, 32, 32, 32],
  [0, 32, 32, 32],
  [0, 32, 32, 32]
];

const RIGHT_OPENING = [
  [32, 32, 32, 0],
  [32, 32, 32, 0],
  [32, 32, 32, 0],
  [32, 32, 32, 0]
];

const TOP_OPENING = [
  [ 0,  0,  0,  0],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32]
];

const BOTTOM_OPENING = [
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [32, 32, 32, 32],
  [ 0,  0,  0,  0]
];

export default class RoomGenerator {
  minSize: number = 4;
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

    const room: number[][] = [];

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

    /* We need an opening in the room for to be connected to any other room.
     * 0 == north
     * 1 == east
     * 2 == south
     * 3 == west
     */
    const roomOrientation = 0; // (Math.random() * 100) % 4;
    const orientationMap = {0: 'top', 1: 'right', 2: 'bottom', 3: 'left'}

    switch(roomOrientation) {
      case 0:
        const startIndex = Math.max(0,(room[0].length/2)-4);
        for(let i=startIndex;i < Math.min(room[0].length,startIndex + 6);i++) {
            room[0][i] = 32;
        }
        break;
      // case 1:
      //   break;
      // case 2:
      //   break;
      // case 3:
      //   break;
      default:
    }

    let debugOutput = '';
    for(let i=0;i<room.length;i++) {
      for(let j=0;j<room[i].length;j++) {
        if(room[i][j] < 10) {
          debugOutput += ' ';
        }
        debugOutput += room[i][j] + ' ';
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
        openings: [[-1, 1, orientationMap[roomOrientation]]] as Opening[],
        name: roomName,
        scripts: {} as Scripting
    };
    return ret as Room;
  }
}
