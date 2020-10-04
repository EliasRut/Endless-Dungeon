import 'phaser'
import PlayerCharacterToken from '../objects/playerCharacterToken'
import FpsText from '../objects/fpsText'
import { getUrlParam } from '../helpers/browserState'
import { Room } from '../../../typings/custom'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import FireBallEffect from '../objects/fireBallEffect';
import DustNovaEffect from '../objects/dustNovaEffect';
import IceSpikeEffect from '../objects/iceSpikeEffect';
import { facingToSpriteNameMap } from '../helpers/constants';
import { getFacing, getVelocitiesForFacing } from '../helpers/orientation';
import FireBall from '../abilities/fireBall'
import EnemyToken from '../objects/enemyToken';
import ItemToken from '../objects/itemToken';
import OverlayScreen from '../screens/overlayScreen'
import StatScreen from '../screens/statScreen';
import InventoryScreen from '../screens/inventoryScreen'
import KeyboardHelper from '../helpers/keyboardHelper'

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PlayerCharacterToken;
  keyboardHelper: KeyboardHelper;
  effects: Map<string, FireBall>;
  fireballEffect: FireBallEffect | undefined;
  dustnovaEffect: DustNovaEffect | undefined;
  icespikeEffect: IceSpikeEffect | undefined;
  tileLayer: any;
  enemy: EnemyToken;
  item: ItemToken;
  overlayScreens: {[name: string]: OverlayScreen} = {};
  lastCameraPosition: {x: number, y: number};

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    // tslint:disable-next-line:no-unused-expression
    this.mainCharacter =
      new PlayerCharacterToken(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.mainCharacter.setDepth(1);

    this.lastCameraPosition = {x: 0, y: 0};
    this.cameras.main.startFollow(this.mainCharacter, false);

    this.enemy = new EnemyToken(this, this.cameras.main.width/2+20, this.cameras.main.height /2+20);
    this.enemy.setDepth(1);

    this.item = new ItemToken(this, this.cameras.main.width/2-80, this.cameras.main.height /2-50);
    this.item.setDepth(1);

    this.fpsText = new FpsText(this);

    this.keyboardHelper = new KeyboardHelper(this);

    this.drawRoom();
    this.drawOverlayScreens();
  }

  drawRoom() {
    const roomId = getUrlParam('roomName') || 'room-firstTest';
    const room = this.cache.json.get(roomId) as Room;

    const map = this.make.tilemap({data: room.layout, tileWidth: 16, tileHeight: 16});
    const tiles = map.addTilesetImage('test-tileset-image', 'test-tileset', 16, 16, 1, 2);
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

  drawOverlayScreens() {
    this.overlayScreens.statScreen = new StatScreen(this);
    this.overlayScreens.statScreen.incXY(-this.cameras.main.width/2, -this.cameras.main.height /2);
    this.add.existing(this.overlayScreens.statScreen);
    // this.overlayScreens.statScreen.setVisible(false);

    this.overlayScreens.inventory = new InventoryScreen(this);
    this.overlayScreens.inventory.incXY(-this.cameras.main.width/2, -this.cameras.main.height /2);
    this.add.existing(this.overlayScreens.inventory);
    this.overlayScreens.inventory.setVisible(false);
  }

  update() {
    this.fpsText.update();

    this.enemy.update(globalState.playerCharacter);
    this.item.update(globalState.playerCharacter);

    if(globalState.playerCharacter.health <= 0){
      console.log("you died");
      return;
    }

    const speed = globalState.playerCharacter.getSpeed();
    const [xFacing, yFacing] = this.keyboardHelper.getCharacterFacing();
    const newFacing = getFacing(xFacing, yFacing);
    const hasMoved = xFacing !== 0 || yFacing !== 0;
    const playerAnimation = globalState.playerCharacter.updateMovingState(hasMoved, newFacing);
    if (playerAnimation) {
      this.mainCharacter.play(playerAnimation);
    }

    this.mainCharacter.setVelocity(xFacing * speed, yFacing * speed);
    this.mainCharacter.body.velocity.normalize().scale(speed);

    globalState.playerCharacter.x = this.mainCharacter.x;
    globalState.playerCharacter.y = this.mainCharacter.y;

    if (this.fireballEffect) {
      this.fireballEffect.update();
    }

    if (this.keyboardHelper.abilityKey1.isDown && !this.fireballEffect) {
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

    if (this.icespikeEffect) {
      this.icespikeEffect.update();
    }

    if (this.keyboardHelper.abilityKey2.isDown && !this.icespikeEffect) {
      const iceSpikeVelocities = getVelocitiesForFacing(globalState.playerCharacter.currentFacing)!;
      this.icespikeEffect = new IceSpikeEffect(
        this,
        this.mainCharacter.x + (16 * iceSpikeVelocities.x),
        this.mainCharacter.y + (16 * iceSpikeVelocities.y),
        globalState.playerCharacter.currentFacing
      );
      this.icespikeEffect.setVelocity(iceSpikeVelocities.x, iceSpikeVelocities.y);
      this.icespikeEffect.body.velocity.normalize().scale(300);

      this.physics.add.collider(this.icespikeEffect, this.tileLayer, (effect) => {
        (effect as IceSpikeEffect).destroy(() => {
          this.icespikeEffect = undefined;
        });
      });
      this.physics.add.collider(this.icespikeEffect, this.enemy, (effect, enemy) => {
        this.enemy.health = this.enemy.health - 3;
        const castEffect = (effect as IceSpikeEffect);
        castEffect.attachToEnemy(enemy);
        castEffect.destroy(() => {
          this.icespikeEffect = undefined;
        });
      });
    }

    if (this.keyboardHelper.abilityKey3.isDown && !this.dustnovaEffect) {
      const fireballVelocities = getVelocitiesForFacing(globalState.playerCharacter.currentFacing)!;
      this.dustnovaEffect = new DustNovaEffect(
        this,
        this.mainCharacter.x + (16 * fireballVelocities.x),
        this.mainCharacter.y + (16 * fireballVelocities.y)
      );
      this.dustnovaEffect.setVelocity(fireballVelocities.x, fireballVelocities.y);
      this.dustnovaEffect.body.velocity.normalize().scale(300);

      this.physics.add.collider(this.dustnovaEffect, this.tileLayer, (effect) => {
        effect.destroy();
        this.dustnovaEffect = undefined;
      });
      this.physics.add.collider(this.dustnovaEffect, this.enemy, (effect, enemy) => {
        effect.destroy();
        this.dustnovaEffect = undefined;
        this.enemy.health = this.enemy.health - globalState.playerCharacter.damage;
        console.log("damage dome =" ,globalState.playerCharacter.damage);
        console.log("life remaining =" ,this.enemy.health);
      });
    }

    Object.values(this.overlayScreens).forEach((screen) => {
      if (screen) {
        screen.incXY(
          globalState.playerCharacter.x - this.lastCameraPosition.x,
          globalState.playerCharacter.y - this.lastCameraPosition.y
        );
      }
    })
    this.lastCameraPosition = {x: globalState.playerCharacter.x, y: globalState.playerCharacter.y};
  }
}
