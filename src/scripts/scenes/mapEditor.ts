import 'phaser'
import { TILE_WIDTH, TILE_HEIGHT } from '../helpers/generateDungeon';

const visibleTiles: boolean[][] = [];

// The main scene handles the actual game play.
export default class MapEditor extends Phaser.Scene {
  tileSetName: string = 'dungeon';
  roomLayout: number[][] = [
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8],
  ];
  roomWidth = 8;
  roomHeight = 8;

  tileLayer: Phaser.Tilemaps.StaticTilemapLayer;

  constructor() {
    super({ key: 'MapEditor' })
  }

  create() {
    this.drawRoom();
    // this.add(this.tileLayer)
  }

  drawRoom() {
    const map = this.make.tilemap({
      data: this.roomLayout,
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT
    });
    const tileSet = map.addTilesetImage(
      `${this.tileSetName}-image`,
      this.tileSetName,
      TILE_WIDTH,
      TILE_HEIGHT,
      1,
      2
    );
    this.tileLayer = map.createStaticLayer(0, tileSet, 0, 0);
  }

  renderDebugGraphics() {
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    this.tileLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  }

  update(globalTime, delta) {
  }
}
