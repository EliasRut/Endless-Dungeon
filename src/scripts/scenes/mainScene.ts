import 'phaser'
import PhaserLogo from '../objects/phaserLogo'
import FpsText from '../objects/fpsText'
import { getUrlParam } from '../helpers/browserState'
import { Room } from '../../../typings/custom'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';

/*
  The main scene handles the actual game play.
*/
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PhaserLogo;
  upKey: Phaser.Input.Keyboard.Key;
  downKey: Phaser.Input.Keyboard.Key;
  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;
  

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    // const roomId = getUrlParam('roomName') || 'room-firstTest';
    // this.load.json(roomId, `assets/rooms/${roomId}.json`);
  }

  create() {
    // tslint:disable-next-line:no-unused-expression
    this.mainCharacter = new PhaserLogo(this, this.cameras.main.width / 2, 0)
    this.fpsText = new FpsText(this)

    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    this.drawRoom()

  }

  drawRoom() {
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
    const tiles = map.addTilesetImage('test-tileset');
    const layer = map.createStaticLayer(0, tiles, 600, 200);
    layer.setCollisionBetween(0,31,true)


    this.physics.add.collider(this.mainCharacter, layer);

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // layer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });

  }

  update() {
    this.fpsText.update();

    let velocityY = 0;
    let velocityX = 0;
    if (this.upKey.isDown)
    {
      velocityY = -200;
    }
    else if (this.downKey.isDown)
    {
      velocityY = 200;
    }

    if (this.leftKey.isDown)
    {
      velocityX = -200;
    }
    else if (this.rightKey.isDown)
    {
      velocityX = 200;
    }

    this.mainCharacter.setVelocity(velocityX, velocityY);
    // globalState.playerCharacter.x = globalState.playerCharacter.x;
    // globalState.playerCharacter.lastY = globalState.playerCharacter.y;
  }
}
