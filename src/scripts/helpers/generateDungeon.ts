import { GameObjects } from "phaser";
import { NpcPositioning, OpeningDirection, Room } from "../../../typings/custom";
import globalState from "../worldstate";
import MainScene from '../scenes/mainScene';
import RoomGenerator from './generateRoom';
import { SSL_OP_NO_COMPRESSION } from "constants";

export const DUNGEON_WIDTH = 128;
export const DUNGEON_BLOCKS_X = DUNGEON_WIDTH / 8;
export const DUNGEON_HEIGHT = 128;
export const DUNGEON_BLOCKS_Y = DUNGEON_HEIGHT / 8;
export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
export const BLOCK_SIZE = 8;

const PATH_CAP = [
  [13,  8,  8,  8,  8,  8,  8, 12],
  [ 6, 32, 32, 32, 32, 32, 32,  4],
  [ 6, 32, 32, 32, 32, 32, 32,  4],
  [ 6, 32, 32, 32, 32, 32, 32,  4],
  [ 6, 32, 32, 32, 32, 32, 32,  4],
  [ 6, 32, 32, 32, 32, 32, 32,  4],
  [ 6, 32, 32, 32, 32, 32, 32,  4],
  [ 6, 32, 32, 32, 32, 32, 32,  4],
];

const TILED_PATH = [
  [32, 32, 32, 32, 32, 32, 32, 32],
  [32, 32, 32, 32, 32, 32, 32, 32],
  [32, 32, 32, 32, 32, 32, 32, 32],
  [32, 32, 32, 32, 32, 32, 32, 32],
  [32, 32, 32, 32, 32, 32, 32, 32],
  [32, 32, 32, 32, 32, 32, 32, 32],
  [32, 32, 32, 32, 32, 32, 32, 32],
  [32, 32, 32, 32, 32, 32, 32, 32],
];

const CORRIDOR_UP = [
  [  6, 32, 32, 32, 32, 32, 32,  4],
  [  6, 32, 32, 32, 32, 32, 32,  4],
  [  6, 32, 32, 32, 32, 32, 32,  4],
  [  6, 32, 32, 32, 32, 32, 32,  4],
  [  6, 32, 32, 32, 32, 32, 32,  4],
  [  6, 32, 32, 32, 32, 32, 32,  4],
  [  6, 32, 32, 32, 32, 32, 32,  4],
  [  6, 32, 32, 32, 32, 32, 32,  4],
];
const CORRIDOR_LEFT = [
  [  8,  8,  8,  8,  8,  8,  8,  8],
  [ 15, 15, 22, 15, 15, 15, 22, 15],
  [ 18, 18, 25, 18, 18, 18, 25, 18],
  [ 32, 32, 39, 32, 32, 32, 39, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [  2,  2,  2,  2,  2,  2,  2,  2],
];
const CORRIDOR_UP_RIGHT = [
  [ 13,  8,  8,  8,  8,  8,  8,  8],
  [  6, 15, 15, 15, 15, 22, 15, 15],
  [  6, 18, 18, 18, 18, 25, 18, 18],
  [  6, 32, 32, 32, 32, 39, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32,  1],
];
const CORRIDOR_UP_LEFT = [
  [  8,  8,  8,  8,  8,  8,  8, 12],
  [ 15, 15, 22, 15, 15, 15, 15, 4],
  [ 18, 18, 25, 18, 18, 18, 18, 4],
  [ 32, 32, 39, 32, 32, 32, 32, 4],
  [ 32, 32, 32, 32, 32, 32, 32, 4],
  [ 32, 32, 32, 32, 32, 32, 32, 4],
  [ 32, 32, 32, 32, 32, 32, 32, 4],
  [  3, 32, 32, 32, 32, 32, 32, 4],
];
const CORRIDOR_DOWN_RIGHT = [
  [  6, 32, 32, 32, 32, 32, 32,  7],
  [  6, 32, 32, 32, 32, 32, 32, 14],
  [  6, 32, 32, 32, 32, 32, 32, 17],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [ 11,  2,  2,  2,  2,  2,  2,  2],
];
const CORRIDOR_DOWN_LEFT = [
  [   9, 32, 32, 32, 32, 32, 32,  4],
  [  16, 32, 32, 32, 32, 32, 32,  4],
  [  19, 32, 32, 32, 32, 32, 32,  4],
  [  32, 32, 32, 32, 32, 32, 32,  4],
  [  32, 32, 32, 32, 32, 32, 32,  4],
  [  32, 32, 32, 32, 32, 32, 32,  4],
  [  32, 32, 32, 32, 32, 32, 32,  4],
  [   2,  2,  2,  2,  2,  2,  2, 10],
];
const T_CROSSING_TOP_LEFT_BOTTOM = [
  [   9, 32, 32, 32, 32, 32, 32,  4],
  [  16, 32, 32, 32, 32, 32, 32,  4],
  [  19, 32, 32, 32, 32, 32, 32,  4],
  [  32, 32, 32, 32, 32, 32, 32,  4],
  [  32, 32, 32, 32, 32, 32, 32,  4],
  [  32, 32, 32, 32, 32, 32, 32,  4],
  [  32, 32, 32, 32, 32, 32, 32,  4],
  [   3, 32, 32, 32, 32, 32, 32,  4],
];
const T_CROSSING_TOP_LEFT_RIGHT = [
  [  9, 32, 32, 32, 32, 32, 32,  7],
  [ 16, 32, 32, 32, 32, 32, 32, 14],
  [ 19, 32, 32, 32, 32, 32, 32, 17],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 2,  2,  2,  2,  2,  2,  2,  2],
];
const T_CROSSING_TOP_RIGHT_BOTTOM = [
  [  6, 32, 32, 32, 32, 32, 32,  7],
  [  6, 32, 32, 32, 32, 32, 32, 14],
  [  6, 32, 32, 32, 32, 32, 32, 17],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32,  1],
];
const T_CROSSING_LEFT_RIGHT_BOTTOM = [
  [  8,  8,  8,  8,  8,  8,  8,  8],
  [ 15, 15, 22, 15, 15, 15, 22, 15],
  [ 18, 18, 25, 18, 18, 18, 25, 18],
  [ 32, 32, 39, 32, 32, 32, 39, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [  3, 32, 32, 32, 32, 32, 32,  1],
];
const CROSSWAY = [
  [   9, 32, 32, 32, 32, 32, 32,  7],
  [  16, 32, 32, 32, 32, 32, 32, 14],
  [  19, 32, 32, 32, 32, 32, 32, 17],
  [  32, 32, 32, 32, 32, 32, 32, 32],
  [  32, 32, 32, 32, 32, 32, 32, 32],
  [  32, 32, 32, 32, 32, 32, 32, 32],
  [  32, 32, 32, 32, 32, 32, 32, 32],
  [   3, 32, 32, 32, 32, 32, 32,  1],
];

const CORRIDOR_LAYOUTS = {
  1: TILED_PATH, // North - Binary 0001
  2: TILED_PATH, // East - Binary 0010
  3: CORRIDOR_DOWN_LEFT,
  4: TILED_PATH, // South - Binary 0100
  5: CORRIDOR_UP,
  6: CORRIDOR_UP_LEFT,
  7: T_CROSSING_TOP_LEFT_BOTTOM,
  8: TILED_PATH, // West - Binary 1000
  9: CORRIDOR_DOWN_RIGHT,
  10: CORRIDOR_LEFT, // East + West
  11: T_CROSSING_TOP_LEFT_RIGHT,  // East + West + North
  12: CORRIDOR_UP_RIGHT,
  13: T_CROSSING_TOP_RIGHT_BOTTOM,
  14: T_CROSSING_LEFT_RIGHT_BOTTOM,
  15: CROSSWAY,
  16: PATH_CAP,
}

export default class DungeonGenerator {
  tilesUsed: boolean[][];
  rooms: Room[];
  startRoomIndex: number;
  roomOffsets:  [number, number][];
  tileSetCollections: {[name: string]: number[]};
  tileSetGid: {[name: string]: number};
  maxGenerationResets = 100;
  maxRoomPlacementTries = 100;
  npcs: NpcPositioning[];
  combinedLayout: number[][];
  blocksUsed: number[][];
  tileLayer: Phaser.Tilemaps.DynamicTilemapLayer;

  public generateDungeon: (scene: Phaser.Scene) => [
      Phaser.Tilemaps.DynamicTilemapLayer,
      NpcPositioning[],
      number,
      number,
    ] = (scene) => {
    const roomGen = new RoomGenerator();
    this.rooms = globalState.availableRooms;
    this.rooms.push(roomGen.generateRoom(scene,this.rooms[0].tileset));
    this.startRoomIndex = Math.max(0, this.rooms.findIndex((room) => room.startRoom));
    this.roomOffsets = [];
    this.tileSetCollections = {};
    this.tileSetGid = {};

    this.maxGenerationResets = 100;
    this.maxRoomPlacementTries = 100;

    this.rooms.forEach((room, roomIndex) => {
      if (!this.tileSetCollections[room.tileset]) {
        this.tileSetCollections[room.tileset] = [];
        this.tileSetGid[room.tileset] = Object.keys(this.tileSetGid).length * 1000;
      }
      this.tileSetCollections[room.tileset].push(roomIndex);
    });

    // This will set the class variables and return true if everything worked, false otherwise
    if (!this.findRoomPlacement()) {
      throw new Error ('Failed to generate a dungeon. Too many tries.')
    }

    // At this point, we have a valid room placement

    // Reset the combined layout which holds the actual tileset data
    this.combinedLayout = [];
    for (let y = 0; y < DUNGEON_HEIGHT; y++) {
      this.combinedLayout[y] = [];
      for (let x = 0; x < DUNGEON_WIDTH; x++) {
        this.combinedLayout[y][x] = -1;
      }
    }

    this.placeNpcs();

    this.findPaths();

    this.drawRooms();

    this.drawTilesForPaths();

    this.createTileLayer(scene);

    const [cameraOffsetX, cameraOffsetY] = this.getStartRoomCameraOffsets();

    return [
      this.tileLayer,
      this.npcs,
      cameraOffsetX,
      cameraOffsetY
    ];
  }

  private findRoomPlacement() {
    this.tilesUsed = [];

    // We initialize the array of arrays once and then only reset it's values in 
    // tryRoomPlacement for performance reasons.
    for (let y = 0; y < DUNGEON_BLOCKS_Y; y++) {
      this.tilesUsed[y] = [];
      for (let x = 0; x < DUNGEON_BLOCKS_X; x++) {
        this.tilesUsed[y][x] = false;
      }
    }
    this.roomOffsets = [];
    let numResets = 0;
    let roomPlacementFound = false;
    while (!roomPlacementFound && numResets < this.maxGenerationResets) {
      console.log(`Starting ${numResets + 1}. try to generate a room placement.`);
      roomPlacementFound = this.tryRoomPlacement();
      numResets++;
    }

    let debugOutput = 'tiles used for rooms\n' +
      '   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15\n';
    for (let y = 0; y < DUNGEON_BLOCKS_Y; y++) {
      debugOutput += `${y}`.padStart(2, ' ');
      for (let x = 0; x < DUNGEON_BLOCKS_X; x++) {
        debugOutput += this.tilesUsed[y][x] ? ' X ' : '   ';
      }
      debugOutput += '\n';
    }
    console.log(debugOutput);

    for (let roomIndex = 0; roomIndex < this.rooms.length; roomIndex++) {
      const room = this.rooms[roomIndex];
      const [roomYBlockOffset, roomXBlockOffset] = this.roomOffsets[roomIndex];
      console.log(`Drawing room ${room.name} to ${roomYBlockOffset}, ${roomXBlockOffset}.`);
    }

    return roomPlacementFound;
  }

  private tryRoomPlacement() {
    // Reset the map of used blocks
    for (let y = 0; y < DUNGEON_BLOCKS_Y; y++) {
      for (let x = 0; x < DUNGEON_BLOCKS_X; x++) {
        this.tilesUsed[y][x] = false;
      }
    }
    this.roomOffsets = [];

    // Count how often we have tried to place a room in the dungeon, abort this function if it's
    // above this.maxRoomPlacementTries
    let triesInRun = 0;
    // Go through every room and try to place it. Record it's placement position if successful.
    for (let roomIndex = 0; roomIndex < this.rooms.length; roomIndex++) {
      const room = this.rooms[roomIndex];
      let isRoomOverlappingOtherRoom = false;
      let roomXBlockOffset;
      let roomYBlockOffset;

      // Dimensions in 8-block scale
      const roomWidth = Math.ceil(room.layout[0].length / BLOCK_SIZE);
      const roomHeight = Math.ceil(room.layout.length / BLOCK_SIZE);
      // Select a random position
      do {
        roomXBlockOffset = 1 + Math.floor(Math.random() * (DUNGEON_BLOCKS_X - roomWidth - 2));
        roomYBlockOffset = 1 + Math.floor(Math.random() * (DUNGEON_BLOCKS_Y - roomHeight - 2));

        for (let y = -1; y <= roomHeight; y ++) {
          const rowIndex = y + roomYBlockOffset;
          for (let x = -1; x <= roomWidth; x++) {
            const columnIndex = x + roomXBlockOffset;
            if (this.tilesUsed[rowIndex][columnIndex]) {
              isRoomOverlappingOtherRoom = true;
              break;
            }
          }
          if (isRoomOverlappingOtherRoom) {
            triesInRun++;
            if (triesInRun > this.maxRoomPlacementTries) {
              return false;
            }
            break;
          }
        }
      } while (isRoomOverlappingOtherRoom);

      // We have found a position for this room.
      this.roomOffsets.push([
        roomYBlockOffset,
        roomXBlockOffset
      ]);
      for (let y = 0; y < roomHeight; y++) {
        const rowIndex = y + roomYBlockOffset;
        for (let x = 0; x < roomWidth; x++) {
          const columnIndex = x + roomXBlockOffset;
          this.tilesUsed[rowIndex][columnIndex] = true;
        }
      }
    }
    // All rooms were placed
    return true;
  }

  private placeNpcs() {
    this.npcs = [];

    for (let roomIndex = 0; roomIndex < this.rooms.length; roomIndex++) {
      this.rooms[roomIndex].npcs?.forEach((npc) => {
        const [roomYBlockOffset, roomXBlockOffset] = this.roomOffsets[roomIndex];
        this.npcs.push({
          ...npc,
          x: (npc.x + roomXBlockOffset * BLOCK_SIZE) * TILE_WIDTH,
          y: (npc.y + roomYBlockOffset * BLOCK_SIZE) * TILE_HEIGHT
        });
      });
    }
  }

  private drawRoom(roomIndex) {
    const room = this.rooms[roomIndex];
    const gid = this.tileSetGid[room.tileset];
    const [roomYBlockOffset, roomXBlockOffset] = this.roomOffsets[roomIndex];
    const roomLayout = room.layout;

    console.log(`Drawing room ${room.name} to ${roomYBlockOffset}, ${roomXBlockOffset}.`);

    for (let y = 0; y < roomLayout.length; y++) {
      for (let x = 0; x < roomLayout[y].length; x++) {
        if (roomLayout[y][x] > 0) {
          const actualY = y + roomYBlockOffset * BLOCK_SIZE;
          const actualX = x + roomXBlockOffset * BLOCK_SIZE;
          this.combinedLayout[actualY][actualX] = gid + roomLayout[y][x];
        }
      }
    }
  }

  private drawRooms() {
    for (let roomIndex = 0; roomIndex < this.rooms.length; roomIndex++) {
      this.drawRoom(roomIndex);
    }
  }

  private createTileLayer(scene: Phaser.Scene) {
    const map = scene.make.tilemap({
      data: this.combinedLayout,
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT
    });
    const tileSets = Object.keys(this.tileSetCollections).map((tileSetName) => {
      const gid = this.tileSetGid[tileSetName];
      return map.addTilesetImage(
        `${tileSetName}-image`,
        tileSetName,
        TILE_WIDTH,
        TILE_HEIGHT,
        1,
        2,
        gid
      );
    });
    this.tileLayer = map.createDynamicLayer(0, tileSets, 0, 0);
    this.tileLayer.setCollisionBetween(0, (Object.keys(this.tileSetGid).length + 1) * 1000, false);
    Object.keys(this.tileSetCollections).map((tileSetName) => {
      const gid = this.tileSetGid[tileSetName];

      // Add tile collision for all tilesets for tile numbers 0-31 and 40-71.
      this.tileLayer.setCollisionBetween(gid, gid + 31, true);
      this.tileLayer.setCollisionBetween(gid + 40, gid + 71, true);
    });
  }

  private getExtraStepForOpening(y: number, x: number, openingDirection: OpeningDirection) {
    switch (openingDirection) {
      case 'top':
        return [y + 1, x];
      case 'right':
        return [y, x - 1];
      case 'bottom':
        return [y - 1, x];
      case 'left':
        return [y, x + 1];
    }
  }

  private findPaths() {
    this.blocksUsed = [];
    for (let y = 0; y < DUNGEON_HEIGHT / 8; y++) {
      this.blocksUsed[y] = [];
      for (let x = 0; x < DUNGEON_WIDTH / 8; x++) {
        this.blocksUsed[y][x] = 0;
      }
    }

    // Construct path.
    let numOpenings = 0;
    const visitedOpenings: [number, number, number, OpeningDirection][] =
      [[this.startRoomIndex, ...this.rooms[this.startRoomIndex].openings[0]]];
    const targetOpenings: [number, number, number, OpeningDirection][] = [];

    // 0: do not skip, 1: skip
    const skipFirstRoom = this.rooms[this.startRoomIndex].openings.length === 1 ? 0 : 1;
    this.rooms[this.startRoomIndex].openings.splice(skipFirstRoom).forEach((opening) => {
      numOpenings++;
      targetOpenings.push([this.startRoomIndex, ...opening]);
    });
    this.rooms.forEach((room, roomIndex) => {
      if (roomIndex === this.startRoomIndex) {
        return;
      }
      room.openings.forEach((opening) => {
        numOpenings++;
        targetOpenings.push([roomIndex, ...opening]);
      })
    });

    do {
      const source = visitedOpenings[Math.floor(Math.random() * visitedOpenings.length)];
      const sourceRoomIndex = source[0];
      const sourceRoom = this.rooms[this.startRoomIndex];
      const sourceOpening = source.slice(1) as [number, number, OpeningDirection];

      const target = targetOpenings[Math.floor(Math.random() * targetOpenings.length)];
      const targetRoomIndex = target[0];
      const targetRoom = this.rooms[targetRoomIndex];
      const targetOpening = target.slice(1) as [number, number, OpeningDirection];
      const targetCoordinates = [
        this.roomOffsets[targetRoomIndex][0] + targetOpening[0],
        this.roomOffsets[targetRoomIndex][1] + targetOpening[1]
      ];

      const isSingleton = JSON.stringify(source) === JSON.stringify(target) && numOpenings === 1;

      const currentBlockY = this.roomOffsets[sourceRoomIndex][0] + sourceOpening[0];
      const currentBlockX = this.roomOffsets[sourceRoomIndex][1] + sourceOpening[1];
      // We need to know from where we went into the corridor to get the right corridor shape
      const [zeroStepY, zeroStepX] =
        this.getExtraStepForOpening(currentBlockY, currentBlockX, sourceOpening[2]);
      // We also need how we exited the corridor into the room
      const [lastStepY, lastStepX] =
        this.getExtraStepForOpening(targetCoordinates[0], targetCoordinates[1], targetOpening[2]);

      /*
        We are doing an iterative Breath-First-Search with a Taboo list.
        We start with the tile indicated in the room opening configuration by pushing all steps in
        that possible path, as an array of [y, x], to the nextExplorations array of arrays.
        In every step, we explore every possible direction: top, right, bottom, left
        These possible explorations are pushed to the end of the nextExplorations array
        At every, step, we take the exploration at the front of the array.
          -> This makes it Breath-First instead of Depth-First
        We do this until we have reached the target opening position, or no new exploration
        options are left.
        Every position we visit, we mark as visited
        We mark all positions that we know are rooms as already visited, this way we only need one
        taboo list.
        If we reach a position that was already visited, we don't explore further from there
        If we find the target position, we set foundPath to the history of this exploration.
      */
      let foundPath: [number, number][] | undefined;
      const nextExplorations: [number, number][][] = [[
        [zeroStepY, zeroStepX],
        [currentBlockY, currentBlockX]
      ]];
      const exploredBlocks: boolean[][] = [];
      for (let y = 0; y < DUNGEON_HEIGHT / 8; y++) {
        exploredBlocks[y] = [];
        for (let x = 0; x < DUNGEON_WIDTH / 8; x++) {
          exploredBlocks[y][x] = this.tilesUsed[y][x];
        }
      }
      const makeStep = () => {
        if (nextExplorations.length === 0) {
          throw new Error(`Failed to build a way from ${sourceRoom.name} to ${targetRoom.name}. ` +
            `This should not have happened.`);
        }
        const history = nextExplorations.splice(0, 1)[0];
        if (foundPath) {
          return;
        }
        const [curY, curX] = history[history.length - 1];
        if (curY < 0 || curY >= DUNGEON_BLOCKS_Y || curX < 0 || curX >= DUNGEON_BLOCKS_X) {
          return;
        }
        if (exploredBlocks[curY][curX]) {
          return;
        }
        exploredBlocks[curY][curX] = true;
        if (targetCoordinates[0] === curY && targetCoordinates[1] === curX) {
          foundPath = [...history];
          return;
        }
        if (this.tilesUsed[curY][curX] !== false) {
          return;
        }
        nextExplorations.push([...history, [curY - 1, curX]]);
        nextExplorations.push([...history, [curY + 1, curX]]);
        nextExplorations.push([...history, [curY, curX - 1]]);
        nextExplorations.push([...history, [curY, curX + 1]]);
      }
      while (!foundPath) {
        makeStep();
      }

      // Include the last step into the room in our path. We're not going to tile that, but we need
      // the info for calculating what kind of corridor we need.
      foundPath = [...foundPath, [lastStepY, lastStepX]];

      console.log(`Build a way from ${sourceRoom.name} to ${targetRoom.name}: ` +
        JSON.stringify(foundPath));

      // The first step is the origin room, the last step is the target room. We ignore those two.
      for (let pathStep = 1; pathStep < foundPath.length - 1; pathStep++) {
        const prevStepY = foundPath[pathStep - 1][0];
        const prevStepX = foundPath[pathStep - 1][1];
        const curStepY = foundPath[pathStep][0];
        const curStepX = foundPath[pathStep][1];
        const nextStepY = foundPath[pathStep + 1][0];
        const nextStepX = foundPath[pathStep + 1][1];
        // We are using a good binary encounted value. 1, 2, 4 and 8 each are a single 1 in a binary
        // encoded number, so 0001 = 1, 0010 = 2, 0011 = 3, ..., 1000 = 8, ..., 1111 = 15
        const newValue = isSingleton ? 16 : // Special case for single room with single opening.
          ((prevStepY < curStepY || nextStepY < curStepY) ? 1 : 0) +
          ((prevStepX < curStepX || nextStepX < curStepX) ? 2 : 0) +
          ((prevStepY > curStepY || nextStepY > curStepY) ? 4 : 0) +
          ((prevStepX > curStepX || nextStepX > curStepX) ? 8 : 0);
        // Since we use binary values, we can now use the binary OR to only add "directions" to the
        // corridor block we are looking at. So, if there already was a corridor going
        // left <-> right from a previous path, and now we are going top <-> left, we want the
        // corridor to be a T rossing top-left-right.
        // Binary OR sets any given bit in the combined number 1 if it is 1 in either of the
        // individual numbers.
        // tslint:disable-next-line: no-bitwise
        this.blocksUsed[curStepY][curStepX] = this.blocksUsed[curStepY][curStepX] | newValue;
      }

      // We add the opening to the list of visited openings only if it isn't in it already. Since
      // we are creating a new array for each opening we look at, we need to compare content instead
      // of simple equality of opening === target (that would never hold)
      const entryPosition = visitedOpenings.findIndex((opening) => {
        return opening[0] === target[0] &&
            opening[1] === target[1] &&
            opening[2] === target[2] &&
            opening[3] === target[3];
      })
      // If findIndex doesn't find anything, it'll be -1
      if (entryPosition === -1 || isSingleton) {
        visitedOpenings.push(target);
      }

    } while (visitedOpenings.length < numOpenings) ;
  }

  private drawTilesForPaths() {
    for (let blockY = 0; blockY < DUNGEON_BLOCKS_Y; blockY++) {
      for (let blockX = 0; blockX < DUNGEON_BLOCKS_X; blockX++) {
        if (this.blocksUsed[blockY][blockX]) {
          const blockLayout = CORRIDOR_LAYOUTS[this.blocksUsed[blockY][blockX]];
          for (let y = 0; y < BLOCK_SIZE; y++) {
            for (let x = 0; x < BLOCK_SIZE; x++) {
              const tileY = blockY * BLOCK_SIZE + y;
              const tileX = blockX * BLOCK_SIZE + x;
              this.combinedLayout[tileY][tileX] = blockLayout[y][x];
            }
          }
        }
      }
    }
  }

  private getStartRoomCameraOffsets() {
    const [startRoomBlockY, startRoomBlockX] = this.roomOffsets[this.startRoomIndex];
    const startRoomHeight = this.rooms[this.startRoomIndex].layout.length * TILE_HEIGHT;
    const startRoomWidth = this.rooms[this.startRoomIndex].layout[0].length * TILE_WIDTH;
    return [
      startRoomBlockX * BLOCK_SIZE * TILE_WIDTH + (startRoomWidth / 2),
      startRoomBlockY * BLOCK_SIZE * TILE_HEIGHT + (startRoomHeight / 2)
    ];
  }
}