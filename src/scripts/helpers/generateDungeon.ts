import { GameObjects } from "phaser";
import { NpcPositioning } from "../../../typings/custom";
import globalState from "../worldstate";

export const DUNGEON_WIDTH = 128;
export const DUNGEON_HEIGHT = 128;
export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;

const corridorSize = 7;

const CORRIDOR_UP = [ 8,  9, 32, 32, 32,  7,  8,];

export const generateDungeon: (scene: Phaser.Scene) => [
    Phaser.Tilemaps.StaticTilemapLayer,
    NpcPositioning[],
    number,
    number,
  ] = (scene) => {
  let restarts = 0;
  let dungeon;
  do {
    if (restarts > 3) {
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
  ] = (scene) => {
  const tilesUsed: boolean[][] = [];
  let tries = 0;

  for (let y = 0; y < DUNGEON_HEIGHT; y++) {
    tilesUsed[y] = [];
    for (let x = 0; x < DUNGEON_WIDTH; x++) {
      tilesUsed[y][x] = false;
    }
  }

  const rooms = globalState.availableRooms;
  const startRoomIndex = Math.max(0, rooms.findIndex((room) => room.startRoom));
  const roomOffsets: [number, number][] = [];
  const tileSetCollections: {[name: string]: number[]} = {};
  const tileSetGid: {[name: string]: number} = {};
  rooms.forEach((room, roomIndex) => {
    let overlaps = false;
    let roomXOffset;
    let roomYOffset;
    do {
      roomXOffset = corridorSize +
        Math.floor(Math.random() * (DUNGEON_WIDTH - room.layout[0].length - 2 * corridorSize));
      roomYOffset = corridorSize +
        Math.floor(Math.random() * (DUNGEON_WIDTH - room.layout[0].length - 2 * corridorSize));

      for (let y = 0; y < room.layout.length; y ++) {
        const rowIndex = y + roomYOffset;
        for (let x = 0; x < room.layout[y].length; x++) {
          const columnIndex = x + roomXOffset;
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
    roomOffsets.push([roomXOffset, roomYOffset]);
    for (let y = 0; y < room.layout.length; y ++) {
      const rowIndex = y + roomYOffset;
      for (let x = 0; x < room.layout[y].length; x++) {
        const columnIndex = x + roomXOffset;
        tilesUsed[rowIndex][columnIndex] = true;
      }
    }
    if (!tileSetCollections[room.tileset]) {
      tileSetCollections[room.tileset] = [];
      tileSetGid[room.tileset] = Object.keys(tileSetGid).length * 1000;
    }
    tileSetCollections[room.tileset].push(roomIndex);
  });

  const npcs: NpcPositioning[] = [];
  const combinedLayout: number[][] = [];
  for (let y = 0; y < DUNGEON_HEIGHT; y++) {
    combinedLayout[y] = [];
    for (let x = 0; x < DUNGEON_WIDTH; x++) {
      combinedLayout[y][x] = 32;
    }
  }
  Object.keys(tileSetCollections).map((tileSetName) => {
    const gid = tileSetGid[tileSetName];
    tileSetCollections[tileSetName].forEach((roomIndex) => {
      const [roomXOffset, roomYOffset] = roomOffsets[roomIndex];
      const roomLayout = rooms[roomIndex].layout;

      for (let y = 0; y < roomLayout.length; y++) {
        for (let x = 0; x < roomLayout[y].length; x++) {
          combinedLayout[y + roomYOffset][x + roomXOffset] = gid + roomLayout[y][x];
        }
      }

      rooms[roomIndex].npcs?.forEach((npc) => {
        npcs.push({
          ...npc,
          x: (npc.x + roomXOffset) * TILE_WIDTH,
          y: (npc.y + roomYOffset) * TILE_HEIGHT
        });
      });
    });
  });

  // rooms.forEach((room, index) => {
  //   if (room.openings) {
  //     const [roomX, roomY] = roomOffsets[index];
  //     room.openings!.forEach(([openingX, openingY, openingDirection]) => {
  //       const actualX = roomX + openingX;
  //       const actualY = roomY + openingY;

  //     });
  //   }
  // })

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

  const [startRoomX, startRoomY] = roomOffsets[startRoomIndex];
  const startRoomHeight = rooms[startRoomIndex].layout.length * TILE_HEIGHT;
  const startRoomWidth = rooms[startRoomIndex].layout[0].length * TILE_WIDTH;
  return [
    tilesLayer,
    npcs,
    startRoomX * TILE_WIDTH + (startRoomWidth / 2),
    startRoomY * TILE_HEIGHT + (startRoomHeight / 2)
  ];
};