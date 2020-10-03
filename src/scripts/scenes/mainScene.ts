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
    const roomId = getUrlParam('roomName') || 'room-firstTest';
    this.load.json(roomId, `assets/rooms/${roomId}.json`);
  }

  create() {
    // tslint:disable-next-line:no-unused-expression
    this.mainCharacter = new PhaserLogo(this, this.cameras.main.width / 2, 0)
    this.fpsText = new FpsText(this)
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

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

  //   setInterval(() => {
  //     // Set player character position
  //     globalState.playerCharacter.x = 0 * this.cameras.main.height;
  //     globalState.playerCharacter.y = 0 * this.cameras.main.height;
  //   }, 1000);
  }

  update() {
    this.fpsText.update();
    this.mainCharacter.setPosition(globalState.playerCharacter.x, globalState.playerCharacter.y);
    
    if (this.upKey.isDown)
    {
        globalState.playerCharacter.y--;
    }
    else if (this.downKey.isDown)
    {
      globalState.playerCharacter.y++;
    }

    if (this.leftKey.isDown)
    {
      globalState.playerCharacter.x--;
    }
    else if (this.rightKey.isDown)
    {
      globalState.playerCharacter.x++;
    }

  }
}
