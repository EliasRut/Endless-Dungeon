import 'phaser'
import PhaserLogo from '../objects/playerCharacterToken'
import FpsText from '../objects/fpsText'
import { getUrlParam } from '../helpers/browserState'
import { Room } from '../../../typings/custom'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import FireBall from '../objects/fireBall';
import { facingToSpriteNameMap } from '../helpers/constants';
import { getFacing } from '../helpers/orientation';

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PhaserLogo;
  upKey: Phaser.Input.Keyboard.Key;
  downKey: Phaser.Input.Keyboard.Key;
  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;

  mapX: integer = 600;
  mapY: integer = 200;
  tileWidth: integer = 16;
  tileHeight: integer = 16;

  room: Room;

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {}

  create() {
    const layer = this.drawRoom();

    // tslint:disable-next-line:no-unused-expression
    this.mainCharacter = new PhaserLogo(this
                            , this.mapX+(this.room.layout.length/2.0*this.tileWidth)
                            , this.mapY+(this.room.layout[0].length/2.0*this.tileHeight));
    this.mainCharacter.setDepth(1);

    // const fireball =
    // new FireBall(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.fpsText = new FpsText(this);

    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    this.physics.add.collider(this.mainCharacter, layer);
  }

  drawRoom() {
    const roomId = getUrlParam('roomName') || 'room-firstTest';
    this.room = this.cache.json.get(roomId) as Room;

    const map = this.make.tilemap({data: this.room.layout
                    , tileWidth: this.tileWidth
                    , tileHeight: this.tileHeight});
    const tiles = map.addTilesetImage('test-tileset');
    const layer = map.createStaticLayer(0, tiles, this.mapX, this.mapY);
    layer.setCollisionBetween(0,31,true)
    layer.setDepth(0);

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // layer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), 
      // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });
    return layer;
  }

  update() {
    this.fpsText.update();

    let yFacing = 0;
    let xFacing = 0;

    const speed = 100;

    if (this.upKey.isDown)
    {
      yFacing = -1;
      globalState.playerCharacter.y--;
    }
    else if (this.downKey.isDown)
    {
      yFacing = 1;
      globalState.playerCharacter.y++;
    }

    if (this.leftKey.isDown)
    {
      xFacing = -1;
      globalState.playerCharacter.x--;
    }
    else if (this.rightKey.isDown)
    {
      xFacing = 1;
      globalState.playerCharacter.x++;
    }

    if (yFacing !== 0 || xFacing !== 0) {
      const lastFacing = globalState.playerCharacter.currentFacing;
      const newFacing = getFacing(xFacing, yFacing);

      if (lastFacing !== newFacing || globalState.playerCharacter.isWalking === false) {
        const characterDirection = facingToSpriteNameMap[newFacing];
        this.mainCharacter.play(`player-walk-${characterDirection}`);
        globalState.playerCharacter.currentFacing = newFacing;
        globalState.playerCharacter.isWalking = true;
      }
    } else /* No movement keys pressed */ {
      const characterDirection = facingToSpriteNameMap[globalState.playerCharacter.currentFacing];
      this.mainCharacter.play(`player-character-idle-${characterDirection}`);
      globalState.playerCharacter.isWalking = false;
    }

    this.mainCharacter.setVelocity(xFacing * speed, yFacing * speed);
    this.mainCharacter.body.velocity.normalize().scale(speed);
  }
}
