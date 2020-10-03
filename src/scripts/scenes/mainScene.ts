import 'phaser'
import PlayerCharacterToken from '../objects/playerCharacterToken'
import FpsText from '../objects/fpsText'
import { getUrlParam } from '../helpers/browserState'
import { Room } from '../../../typings/custom'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import FireBallEffect from '../objects/fireBallEffect';
import { facingToSpriteNameMap } from '../helpers/constants';
import { getFacing, getVelocitiesForFacing } from '../helpers/orientation';
import FireBall from '../abilities/fireBall'
// import IceNova from '../abilities/iceNova'
import EnemyToken from '../objects/enemyToken';
import ItemToken from '../objects/itemToken';

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PlayerCharacterToken;
  upKey: Phaser.Input.Keyboard.Key;
  downKey: Phaser.Input.Keyboard.Key;
  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;
  abilityKey1: Phaser.Input.Keyboard.Key;
  effects: Map<string, FireBall>;
  fireballEffect: FireBallEffect | undefined;
  tileLayer: any;
  enemy: EnemyToken;
<<<<<<< HEAD
  item: ItemToken;
=======
  sportLight: Phaser.GameObjects.Light;
>>>>>>> 42f8cf088daed3b015fc434a6a07f9431fe9d127

  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {}

  create() {
    // tslint:disable-next-line:no-unused-expression
    this.mainCharacter =
      new PlayerCharacterToken(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.mainCharacter.setDepth(1);

    this.cameras.default.startFollow(this.mainCharacter);

    this.enemy = new EnemyToken(this, this.cameras.main.width/2+20, this.cameras.main.height /2+20);
    this.enemy.setDepth(1);

<<<<<<< HEAD
    this.item = new ItemToken(this, this.cameras.main.width/2-80, this.cameras.main.height /2-50);
    this.item.setDepth(1);
=======
>>>>>>> 42f8cf088daed3b015fc434a6a07f9431fe9d127
    // const fireball =
      // new FireBall(this, this.cameras.main.width / 2, this.cameras.main.height / 2);

    this.fpsText = new FpsText(this);

    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.abilityKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);

    this.drawRoom();
  }

  drawRoom() {
    const roomId = getUrlParam('roomName') || 'room-firstTest';
    const room = this.cache.json.get(roomId) as Room;

    const map = this.make.tilemap({data: room.layout, tileWidth: 16, tileHeight: 16});
    const tiles = map.addTilesetImage('test-tileset');
    const roomHeight = tiles.tileHeight * room.layout.length;
    const roomWidth = tiles.tileWidth * room.layout[0].length;
    this.tileLayer = map.createStaticLayer(
      0,
      tiles,
      (this.cameras.main.width / 2) - roomWidth / 2,
      (this.cameras.main.height / 2) - roomHeight / 2
    );
    this.tileLayer.setCollisionBetween(0, 31, true);
    this.tileLayer.setDepth(0);

    this.physics.add.collider(this.mainCharacter, this.tileLayer);
    this.physics.add.collider(this.enemy, this.tileLayer);

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
    this.enemy.update(globalState.playerCharacter);
    this.item.update(globalState.playerCharacter);

    if(globalState.playerCharacter.health <= 0){
      console.log("you died");
      return;
    }
    
    let yFacing = 0;
    let xFacing = 0;

    const speed = globalState.playerCharacter.movementSpeed * globalState.playerCharacter.slowFactor;

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

    globalState.playerCharacter.x = this.mainCharacter.x;
    globalState.playerCharacter.y = this.mainCharacter.y;

    if (this.fireballEffect) {
      this.fireballEffect.update();
    }

    if (this.abilityKey1.isDown && !this.fireballEffect) {
      const fireballVelocities = getVelocitiesForFacing(globalState.playerCharacter.currentFacing)!;
      this.fireballEffect = new FireBallEffect(
        this,
        this.mainCharacter.x + (16 * fireballVelocities.x),
        this.mainCharacter.y + (16 * fireballVelocities.y)
      );
      this.fireballEffect.setVelocity(fireballVelocities.x, fireballVelocities.y);
      this.fireballEffect.body.velocity.normalize().scale(300);

      this.physics.add.collider(this.fireballEffect, this.tileLayer, (effect) => {
        effect.destroy();
        this.fireballEffect = undefined;
      });
      this.physics.add.collider(this.fireballEffect, this.enemy, (effect, enemy) => {
        effect.destroy();
        this.fireballEffect = undefined;
        this.enemy.health = this.enemy.health - globalState.playerCharacter.damage;
        console.log("damage dome =" ,globalState.playerCharacter.damage);
        console.log("life remaining =" ,this.enemy.health);
      });
    }
  }
}
