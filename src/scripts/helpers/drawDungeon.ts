import DungeonLevel from "../worldstate/DungeonLevel";
import { TILE_HEIGHT, TILE_WIDTH } from "./generateDungeon";

export const generateTilemap: (scene: Phaser.Scene, dungeonLevel: DungeonLevel) =>
  Phaser.Tilemaps.DynamicTilemapLayer = (scene, dungeonLevel) => {

  const map = scene.make.tilemap({
    data: dungeonLevel.layout,
    tileWidth: TILE_WIDTH,
    tileHeight: TILE_HEIGHT
  });
  const tileSets = dungeonLevel.tilesets.map((tileSetName, index) => {
    const gid = index * 1000;
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
  const tileLayer = map.createDynamicLayer(0, tileSets, 0, 0);
  tileLayer.setCollisionBetween(0, (dungeonLevel.tilesets.length + 1) * 1000, false);
  dungeonLevel.tilesets.map((tileSetName, index) => {
    const gid = index * 1000;

    // Add tile collision for all tilesets for tile numbers 0-31 and 40-71.
    tileLayer.setCollisionBetween(gid, gid + 31, true);
    tileLayer.setCollisionBetween(gid + 40, gid + 71, true);
  });

  return tileLayer;
};
