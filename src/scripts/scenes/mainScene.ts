import 'phaser'
import PlayerCharacterToken from '../objects/playerCharacterToken'
import FpsText from '../objects/fpsText'
import { getUrlParam } from '../helpers/browserState'
import { Room, Weapon } from '../../../typings/custom'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import FireBall from '../objects/fireBall';
import { facingToSpriteNameMap } from '../helpers/constants';
import { getFacing } from '../helpers/orientation';

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PlayerCharacterToken;
  upKey: Phaser.Input.Keyboard.Key;
  downKey: Phaser.Input.Keyboard.Key;
  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;
  weapon: Weapon;

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {}

  create() {
    // tslint:disable-next-line:no-unused-expression
    this.mainCharacter =
      new PlayerCharacterToken(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.mainCharacter.setDepth(1);

    // this.weapon = new Weapon(this, this.cameras.main.width / 2 +5, this.cameras.main.height / 2+5);
    // this.weapon.setDepth(2);
    // const fireball =
      // new FireBall(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.fpsText = new FpsText(this);

    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    // this.drawRoom()

    // const itemId =  'weapons';
    // const item = this.cache.json.get(itemId) as Weapon;
    // this.add.tileSprite(120,120,16,16,'test-items')
    const sprite = this.add.sprite(120, 120, 'test-items-spritesheet', 8);
    // sprite.frame = new Phaser.Textures.Frame('test-items',)

    // const map = this.make.tilemap({data: [[3]], tileWidth: 16, tileHeight: 16});
    // const tiles = map.addTilesetImage('test-items');
    
    // const layer = map.createStaticLayer(
    //   0,
    //   tiles, 120,120
    //   // (this.cameras.main.width / 2) + 10,
    //   // (this.cameras.main.height / 2) + 10
    // );
    // layer.setDepth(0);


  }

  drawRoom() {
    const roomId = getUrlParam('roomName') || 'room-firstTest';
    const room = this.cache.json.get(roomId) as Room;

    const map = this.make.tilemap({data: room.layout, tileWidth: 16, tileHeight: 16});
    const tiles = map.addTilesetImage('test-tileset');
    const roomHeight = tiles.tileHeight * room.layout.length;
    const roomWidth = tiles.tileWidth * room.layout[0].length;
    const layer = map.createStaticLayer(
      0,
      tiles,
      (this.cameras.main.width / 2) - roomWidth / 2,
      (this.cameras.main.height / 2) - roomHeight / 2
    );
    layer.setCollisionBetween(0, 31, true);
    layer.setDepth(0);

    this.physics.add.collider(this.mainCharacter, layer);

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // layer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), 
      // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });
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
