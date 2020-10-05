import { GameObjects } from "phaser";
import { NpcPositioning, OpeningDirection } from "../../../typings/custom";
import globalState from "../worldstate";

export const DUNGEON_WIDTH = 128;
export const DUNGEON_BLOCKS_X = DUNGEON_WIDTH / 8;
export const DUNGEON_HEIGHT = 128;
export const DUNGEON_BLOCKS_Y = DUNGEON_HEIGHT / 8;
export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;
export const BLOCK_SIZE = 8;

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
  [ 32, 32, 38, 32, 32, 32, 38, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [ 32, 32, 32, 32, 32, 32, 32, 32],
  [  2,  2,  2,  2,  2,  2,  2,  2],
];
const CORRIDOR_UP_RIGHT = [
  [ 13,  8,  8,  8,  8,  8,  8,  8],
  [  6, 15, 15, 15, 15, 22, 15, 15],
  [  6, 18, 18, 18, 18, 25, 18, 18],
  [  6, 32, 32, 32, 32, 38, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32, 32],
  [  6, 32, 32, 32, 32, 32, 32,  1],
];
const CORRIDOR_UP_LEFT = [
  [  8,  8,  8,  8,  8,  8,  8, 12],
  [ 15, 15, 22, 15, 15, 15, 15, 4],
  [ 18, 18, 25, 18, 18, 18, 18, 4],
  [ 32, 32, 38, 32, 32, 32, 32, 4],
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
  [ 32, 32, 38, 32, 32, 32, 38, 32],
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
  1: TILED_PATH,
  2: TILED_PATH,
  3: CORRIDOR_DOWN_LEFT,
  4: TILED_PATH,
  5: CORRIDOR_UP,
  6: CORRIDOR_UP_LEFT,
  7: T_CROSSING_TOP_LEFT_BOTTOM,
  8: TILED_PATH,
  9: CORRIDOR_DOWN_RIGHT,
  10: CORRIDOR_LEFT,
  11: T_CROSSING_TOP_LEFT_RIGHT,
  12: CORRIDOR_UP_RIGHT,
  13: T_CROSSING_TOP_RIGHT_BOTTOM,
  14: T_CROSSING_LEFT_RIGHT_BOTTOM,
  15: CROSSWAY,
}


export const generateDungeon: (scene: Phaser.Scene) => [
    Phaser.Tilemaps.StaticTilemapLayer,
    NpcPositioning[],
    number,
    number,
  ] = (scene) => {
  let restarts = 0;
  let dungeon;
  do {
    if (restarts > 100) {
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
      roomYBlockOffset = 1 + Math.floor(Math.random() * (DUNGEON_BLOCKS_Y - roomHeight - 2));

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
      roomYBlockOffset,
      roomXBlockOffset
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

    rooms.forEach((room, roomIndex) => {
      const [roomYBlockOffset, roomXBlockOffset] = roomOffsets[roomIndex];
      console.log(`Placed room ${room.name} at [${roomYBlockOffset}, ${roomXBlockOffset}]`);
    })

    let debugOutput = 'tiles used for rooms';
    for (let y = 0; y < DUNGEON_BLOCKS_Y; y++) {
      for (let x = 0; x < DUNGEON_BLOCKS_X; x++) {
        debugOutput += tilesUsed[y][x] ? 'X' : ' ';
      }
      debugOutput += '\n';
    }
    console.log(debugOutput);

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
      const [roomYBlockOffset, roomXBlockOffset] = roomOffsets[roomIndex];
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
  let numOpenings = 1;
  const visitedOpenings: [number, number, number, OpeningDirection][] = 
    [[startRoomIndex, ...rooms[startRoomIndex].openings[0]]];
  const targetOpenings: [number, number, number, OpeningDirection][] = [];

  rooms[startRoomIndex].openings.slice(1).forEach((opening) => {
    numOpenings++;
    targetOpenings.push([startRoomIndex, ...opening]);
  });
  rooms.forEach((room, roomIndex) => {
    if (roomIndex === startRoomIndex) {
      return;
    }
    room.openings.forEach((opening) => {
      numOpenings++;
      targetOpenings.push([roomIndex, ...opening]);
    })
  });

  let pathIndex = 1;
  while (visitedOpenings.length < numOpenings) {
    const source = visitedOpenings[Math.floor(Math.random() * visitedOpenings.length)];
    const sourceRoomIndex = source[0];
    const sourceRoom = rooms[startRoomIndex];
    const sourceOpening = source.slice(1) as [number, number, OpeningDirection];

    // const possibleTargets = rooms
    //   .map((_, index) => index)
    //   .filter((_, index) => !visitedRooms.includes(index));
    const target = targetOpenings[Math.floor(Math.random() * targetOpenings.length)];
    const targetRoomIndex = target[0];
    const targetRoom = rooms[targetRoomIndex];
    const targetOpening = target.slice(1) as [number, number, OpeningDirection];
    const targetCoordinates = [
      roomOffsets[targetRoomIndex][0] + targetOpening[0],
      roomOffsets[targetRoomIndex][1] + targetOpening[1]
    ];

    const currentBlockY = roomOffsets[sourceRoomIndex][0] + sourceOpening[0];
    const currentBlockX = roomOffsets[sourceRoomIndex][1] + sourceOpening[1];
    let zeroStepY = currentBlockY;
    let zeroStepX = currentBlockX;
    switch (sourceOpening[2]) {
      case 'top':
        zeroStepY++;
        break;
      case 'right':
        zeroStepX--;
        break;
      case 'bottom':
        zeroStepY--;
        break;
      case 'left':
        zeroStepX++;
        break;
    }
    let lastStepY = targetCoordinates[0];
    let lastStepX = targetCoordinates[1];
    switch (targetOpening[2]) {
      case 'top':
        lastStepY++;
        break;
      case 'right':
        lastStepX--;
        break;
      case 'bottom':
        lastStepY--;
        break;
      case 'left':
        lastStepX++;
        break;
    }

    let foundPath: [number, number][] | undefined;
    const nextExplorations: [number, number][][] = [[
      [zeroStepY, zeroStepX],
      [currentBlockY, currentBlockX]
    ]];
    const exploredBlocks: boolean[][] = [];
    for (let y = 0; y < DUNGEON_HEIGHT / 8; y++) {
      exploredBlocks[y] = [];
      for (let x = 0; x < DUNGEON_WIDTH / 8; x++) {
        exploredBlocks[y][x] = tilesUsed[y][x];
      }
    }
    const makeStep = () => {
      if (nextExplorations.length === 0) {
        throw new Error("Failed to build a way. This should not have happened.");
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
      if (tilesUsed[curY][curX] !== false) {
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

    foundPath = [...foundPath, [lastStepY, lastStepX]];

    for (let pathStep = 1; pathStep < foundPath.length - 1; pathStep++) {
      const prevStepY = foundPath[pathStep - 1][0];
      const prevStepX = foundPath[pathStep - 1][1];
      const curStepY = foundPath[pathStep][0];
      const curStepX = foundPath[pathStep][1];
      const nextStepY = foundPath[pathStep + 1][0];
      const nextStepX = foundPath[pathStep + 1][1];
      const newValue =
        ((prevStepY < curStepY || nextStepY < curStepY) ? 1 : 0) +
        ((prevStepX < curStepX || nextStepX < curStepX) ? 2 : 0) +
        ((prevStepY > curStepY || nextStepY > curStepY) ? 4 : 0) +
        ((prevStepX > curStepX || nextStepX > curStepX) ? 8 : 0);
      blocksUsed[curStepY][curStepX] = blocksUsed[curStepY][curStepX] | newValue;
    }

    console.log(`Build a way from ${sourceRoom.name} to ${targetRoom.name}: ${JSON.stringify(foundPath)}`);
    const entryPosition = visitedOpenings.findIndex((opening) => {
      return opening[0] === target[0] &&
          opening[1] === target[1] &&
          opening[2] === target[2] &&
          opening[3] === target[3];
    })
    if (entryPosition === -1) {
      visitedOpenings.push(target);
    }
  }

  debugOutput = 'blocks used:\n';
  for (let y = 0; y < DUNGEON_BLOCKS_Y; y++) {
    for (let x = 0; x < DUNGEON_BLOCKS_X; x++) {
      debugOutput += blocksUsed[y][x] ? blocksUsed[y][x] : (tilesUsed[y][x] ? 'X' : ' ');
    }
    debugOutput += '\n';
  }
  console.log(debugOutput);

  for (let blockY = 0; blockY < DUNGEON_HEIGHT / 8; blockY++) {
    for (let blockX = 0; blockX < DUNGEON_WIDTH / 8; blockX++) {
      if (blocksUsed[blockY][blockX]) {
        const blockLayout = CORRIDOR_LAYOUTS[blocksUsed[blockY][blockX]];
        for (let y = 0; y < BLOCK_SIZE; y++) {
          for (let x = 0; x < BLOCK_SIZE; x++) {
            combinedLayout[blockY * BLOCK_SIZE + y][blockX * BLOCK_SIZE + x] = blockLayout[y][x];
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

  const [startRoomBlockY, startRoomBlockX] = roomOffsets[startRoomIndex];
  const startRoomHeight = rooms[startRoomIndex].layout.length * TILE_HEIGHT;
  const startRoomWidth = rooms[startRoomIndex].layout[0].length * TILE_WIDTH;
  return [
    tilesLayer,
    npcs,
    startRoomBlockX * BLOCK_SIZE * TILE_WIDTH + (startRoomWidth / 2),
    startRoomBlockY * BLOCK_SIZE * TILE_HEIGHT + (startRoomHeight / 2)
  ];
};