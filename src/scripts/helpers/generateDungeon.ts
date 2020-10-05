import { GameObjects } from "phaser";
import { NpcPositioning } from "../../../typings/custom";
import globalState from "../worldstate";

export const DUNGEON_WIDTH = 128;
export const DUNGEON_BLOCKS_X = DUNGEON_WIDTH / 8;
export const DUNGEON_HEIGHT = 128;
export const DUNGEON_BLOCKS_Y = DUNGEON_HEIGHT / 8;
export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
export const BLOCK_SIZE = 8;

const corridorSize = 7;

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

const CORRIDOR_UP = [ -1,  6, 32, 32, 32,  4, -1];
const CORRIDOR_UP_RIGHT = [
  [ -1,  13, 8,  8,  8,  8,  8],
  [ -1,  6, 15, 15, 22, 15, 15],
  [ -1,  6, 18, 18, 25, 18, 18],
  [ -1,  6, 32, 32, 32, 32, 32],
  [ -1,  6, 32, 32, 32, 32, 32],
  [ -1,  6, 32, 32, 32,  1,  2],
  [ -1,  6, 32, 32, 32,  4, -1],
];
const CORRIDOR_UP_LEFT = [
  [  8,  8,  8,  8,  8, 12, -1],
  [ 15, 15, 22, 15, 15,  4, -1],
  [ 18, 18, 25, 18, 18,  4, -1],
  [ 32, 32, 32, 32, 32,  4, -1],
  [ 32, 32, 32, 32, 32,  4, -1],
  [  2,  3, 32, 32, 32,  4, -1],
  [ -1,  6, 32, 32, 32,  4, -1],
];

export const generateDungeon: (scene: Phaser.Scene) => [
    Phaser.Tilemaps.StaticTilemapLayer,
    NpcPositioning[],
    number,
    number,
  ] = (scene) => {
  let restarts = 0;
  let dungeon;
  do {
    if (restarts > 10) {
      throw new Error('Failed to generate the dungeon!');
    }
    dungeon = tryToGenerateDungeon(scene);
    restarts++;
  } while (!dungeon);
  return dungeon;
};

const tryToGenerateDungeon: (scene: Phaser.Scene) => [
    Phaser.Tilemaps.StaticTilemapLayer,
    NpcPositioning[],
    number,
    number,
  ] | false = (scene) => {
  const tilesUsed: boolean[][] = [];
  let tries = 0;

  // We use blocks of 8 x 8 to determine what is blocked or not and for positioning
  for (let y = 0; y < DUNGEON_HEIGHT / 8; y++) {
    tilesUsed[y] = [];
    for (let x = 0; x < DUNGEON_WIDTH / 8; x++) {
      tilesUsed[y][x] = false;
    }
  }

  const rooms = globalState.availableRooms;
  const startRoomIndex = Math.max(0, rooms.findIndex((room) => room.startRoom));
  const roomOffsets: [number, number][] = [];
  const tileSetCollections: {[name: string]: number[]} = {};
  const tileSetGid: {[name: string]: number} = {};
  for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
    const room = rooms[roomIndex];
    let overlaps = false;
    let roomXBlockOffset;
    let roomYBlockOffset;

    const roomWidth = Math.ceil(room.layout[0].length / BLOCK_SIZE);
    const roomHeight = Math.ceil(room.layout.length / BLOCK_SIZE);
    do {
      roomXBlockOffset = 1 + Math.floor(Math.random() * (DUNGEON_BLOCKS_X - roomWidth - 2));
      roomYBlockOffset = 1 + Math.floor(Math.random() * (DUNGEON_BLOCKS_Y - roomWidth - 2));

      for (let y = -1; y <= roomHeight; y ++) {
        const rowIndex = y + roomYBlockOffset;
        for (let x = -1; x <= roomWidth; x++) {
          const columnIndex = x + roomXBlockOffset;
          if (tilesUsed[rowIndex][columnIndex]) {
            overlaps = true;
            break;
          }
        }
        if (overlaps) {
          tries++;
          if (tries > 10) {
            return false;
          }
          break;
        }
      }
    } while (overlaps);

    // We have found a position for this room.
    roomOffsets.push([
      roomXBlockOffset,
      roomYBlockOffset
    ]);
    for (let y = 0; y < roomHeight; y ++) {
      const rowIndex = y + roomYBlockOffset;
      for (let x = 0; x < roomWidth; x++) {
        const columnIndex = x + roomXBlockOffset;
        tilesUsed[rowIndex][columnIndex] = true;
      }
    }
    if (!tileSetCollections[room.tileset]) {
      tileSetCollections[room.tileset] = [];
      tileSetGid[room.tileset] = Object.keys(tileSetGid).length * 1000;
    }
    tileSetCollections[room.tileset].push(roomIndex);
  }

  // All rooms have been positioned.

  const npcs: NpcPositioning[] = [];
  const combinedLayout: number[][] = [];
  for (let y = 0; y < DUNGEON_HEIGHT; y++) {
    combinedLayout[y] = [];
    for (let x = 0; x < DUNGEON_WIDTH; x++) {
      combinedLayout[y][x] = -1;
    }
  }
  Object.keys(tileSetCollections).map((tileSetName) => {
    const gid = tileSetGid[tileSetName];
    tileSetCollections[tileSetName].forEach((roomIndex) => {
      const [roomXBlockOffset, roomYBlockOffset] = roomOffsets[roomIndex];
      const roomLayout = rooms[roomIndex].layout;

      for (let y = 0; y < roomLayout.length; y++) {
        for (let x = 0; x < roomLayout[y].length; x++) {
          const actualX = x + roomXBlockOffset * BLOCK_SIZE;
          const actualY = y + roomYBlockOffset * BLOCK_SIZE;
          combinedLayout[actualY][actualX] = gid + roomLayout[y][x];
        }
      }

      rooms[roomIndex].npcs?.forEach((npc) => {
        npcs.push({
          ...npc,
          x: (npc.x + roomXBlockOffset * BLOCK_SIZE) * TILE_WIDTH,
          y: (npc.y + roomYBlockOffset * BLOCK_SIZE) * TILE_HEIGHT
        });
      });
    });
  });

  const blocksUsed: number[][] = [];
  for (let y = 0; y < DUNGEON_HEIGHT / 8; y++) {
    blocksUsed[y] = [];
    for (let x = 0; x < DUNGEON_WIDTH / 8; x++) {
      blocksUsed[y][x] = 0;
    }
  }

  // Construct path.
  const visitedRooms = [startRoomIndex];
  while (visitedRooms.length < rooms.length) {
    const sourceRoomIndex = visitedRooms[Math.floor(Math.random() * visitedRooms.length)];
    const sourceRoom = rooms[startRoomIndex];
    const sourceOpening =
      sourceRoom.openings[Math.floor(Math.random() * sourceRoom.openings.length)];

    const possibleTargets = rooms
      .map((_, index) => index)
      .filter((_, index) => !visitedRooms.includes(index));
    const targetRoomIndex =
      possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    const targetRoom = rooms[targetRoomIndex];
    const targetOpening =
      targetRoom.openings[Math.floor(Math.random() * targetRoom.openings.length)];
    const targetCoordinates = [
      roomOffsets[targetRoomIndex][0] + targetOpening[0],
      roomOffsets[targetRoomIndex][1] + targetOpening[1]
    ];

    const currentBlockY = roomOffsets[sourceRoomIndex][0] + sourceOpening[0];
    const currentBlockX = roomOffsets[sourceRoomIndex][1] + sourceOpening[1];

    let foundPath: [number, number][] | false = false;
    const nextExplorations: [number, number][][] = [[[currentBlockY, currentBlockX]]];
    const makeStep = () => {
      if (nextExplorations.length === 0) {
        throw new Error("Failed to build a way. This should not have happened.");
      }
      const history = nextExplorations.splice(0, 1)[0];
      if (foundPath) {
        return;
      }
      const [curY, curX] = history[history.length - 1];
      if (curY < 0 || curY > DUNGEON_BLOCKS_Y || curX < 0 || curX > DUNGEON_BLOCKS_X) {
        return;
      }
      if (targetCoordinates[0] === curY && targetCoordinates[1] === curX) {
        foundPath = [...history];
        return;
      }
      if (tilesUsed[curY][curX] !== false) {
        return;
      }
      nextExplorations.push([...history, [curY - 1, curX]]);
      nextExplorations.push([...history, [curY + 1, curX]]);
      nextExplorations.push([...history, [curY, curX - 1]]);
      nextExplorations.push([...history, [curY, curX + 1]]);
      makeStep();
    }
    makeStep();
    if (!foundPath) {
      throw new Error("Failed to build a way. This should not have happened.");
    }

    (foundPath as [number, number][]).forEach(([pathY, pathX]) => {
      blocksUsed[pathY][pathX] = 1;
    });

    visitedRooms.push(targetRoomIndex);
  }

  for (let blockY = 0; blockY < DUNGEON_HEIGHT / 8; blockY++) {
    for (let blockX = 0; blockX < DUNGEON_WIDTH / 8; blockX++) {
      if (blocksUsed[blockY][blockX]) {
        for (let y = 0; y < BLOCK_SIZE; y++) {
          for (let x = 0; x < BLOCK_SIZE; x++) {
            combinedLayout[blockY * BLOCK_SIZE + y][blockX * BLOCK_SIZE + x] = 32;
          }
        }
      }
    }
  }


  // rooms.forEach((room, index) => {
  //   if (room.openings) {
  //     const [roomX, roomY] = roomOffsets[index];
  //     room.openings!.forEach(([openingY, openingX, openingDirection]) => {
  //       const actualX = roomX + openingX * 8;
  //       const actualY = roomY + openingY * 8;

  //       switch (openingDirection) {
  //         case 'top': {
  //           for (let y = -1; y >= TILED_PATH.length * -1; y--) {
  //             for (let x = 0; x < TILED_PATH[0].length; x++) {
  //               const corY = y + TILED_PATH.length;
  //               combinedLayout[y + actualY][x + actualX] = TILED_PATH[corY][x];
  //             }
  //           }
  //           break;
  //         }
  //         case 'right': {
  //           for (let y = 0; y < TILED_PATH.length; y++) {
  //             for (let x = 0; x < TILED_PATH[0].length; x++) {
  //               combinedLayout[y + actualY][x + actualX] = TILED_PATH[y][x];
  //             }
  //           }
  //           break;
  //         }
  //       }
  //     });
  //   }
  // });

  const map = scene.make.tilemap({
    data: combinedLayout,
    tileWidth: TILE_WIDTH,
    tileHeight: TILE_HEIGHT
  });
  const tileSets = Object.keys(tileSetCollections).map((tileSetName) => {
    const gid = tileSetGid[tileSetName];
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
  const tilesLayer = map.createStaticLayer(0, tileSets, 0, 0 );
  tilesLayer.setCollisionBetween(0, (Object.keys(tileSetGid).length + 1) * 1000, false);
  Object.keys(tileSetCollections).map((tileSetName) => {
    const gid = tileSetGid[tileSetName];

    tilesLayer.setCollisionBetween(gid, gid + 31, true);
    tilesLayer.setCollisionBetween(gid + 40, gid + 71, true);
  });

  const [startRoomBlockX, startRoomBlockY] = roomOffsets[startRoomIndex];
  const startRoomHeight = rooms[startRoomIndex].layout.length * TILE_HEIGHT;
  const startRoomWidth = rooms[startRoomIndex].layout[0].length * TILE_WIDTH;
  return [
    tilesLayer,
    npcs,
    startRoomBlockX * BLOCK_SIZE * TILE_WIDTH + (startRoomWidth / 2),
    startRoomBlockY * BLOCK_SIZE * TILE_HEIGHT + (startRoomHeight / 2)
  ];
};