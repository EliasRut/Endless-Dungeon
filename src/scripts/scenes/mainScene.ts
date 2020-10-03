import 'phaser'
import PhaserLogo from '../objects/phaserLogo'
import FpsText from '../objects/fpsText'
import { getUrlParam } from '../helpers/browserState'
import { Room } from '../../../typings/custom'

/*
  The main scene handles the actual game play.
*/
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    const roomId = getUrlParam('roomName') || 'room-firstTest';
    this.load.json(roomId, `assets/rooms/${roomId}.json`);
  }

  create() {
    // tslint:disable-next-line:no-unused-expression
    new PhaserLogo(this, this.cameras.main.width / 2, 0)
    this.fpsText = new FpsText(this)

    const roomId = getUrlParam('roomName') || 'room-firstTest';
    const room = this.cache.json.get(roomId) as Room;

    // //  Create some map data dynamically
    // //  Map size is 128x128 tiles
    // const data: number[][] = [];

    // for (let y = 0; y < 128; y++)
    // {
    //   data[y] = [];
    //     for (let x = 0; x < 128; x++)
    //     {
    //         data[y][x] = Math.floor(Math.random() * 20);
    //     }
    // }

    const map = this.make.tilemap({data: room.layout, tileWidth: 16, tileHeight: 16});
    const tiles = map.addTilesetImage('phaser-logo');
    const layer = map.createStaticLayer(0, tiles, 600, 200);
    layer.setCollisionBetween(0,31,true)

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // layer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

  }

  update() {
    this.fpsText.update()
    // const characterHealth = globalState.playerCharacter.health
  }
}
