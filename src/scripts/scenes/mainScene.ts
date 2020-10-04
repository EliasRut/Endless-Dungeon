import 'phaser'
import PlayerCharacterToken from '../objects/playerCharacterToken';
import { getUrlParam } from '../helpers/browserState'
import { Room, Weapon } from '../../../typings/custom'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import FireBallEffect from '../objects/fireBallEffect';
import DustNovaEffect from '../objects/dustNovaEffect';
import IceSpikeEffect from '../objects/iceSpikeEffect';
import { getFacing, getVelocitiesForFacing } from '../helpers/orientation';
import FireBall from '../abilities/fireBall'
import EnemyToken from '../objects/enemyToken';
import ItemToken from '../objects/itemToken';
import OverlayScreen from '../screens/overlayScreen'
import StatScreen from '../screens/statScreen';
import InventoryScreen from '../screens/inventoryScreen'
import KeyboardHelper from '../helpers/keyboardHelper'
import AbilityEffect from '../objects/abilityEffect';

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
  enemy: EnemyToken[];
  item: ItemToken;
  sportLight: Phaser.GameObjects.Light;
  overlayScreens: {[name: string]: OverlayScreen} = {};
  lastCameraPosition: {x: number, y: number};
  abilities: AbilityEffect[];

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

    this.enemy = [];

    this.item = new ItemToken(this, this.cameras.main.width/2-80, this.cameras.main.height /2-50);
    this.item.setDepth(1);

    this.keyboardHelper = new KeyboardHelper(this);

    const roomSize = this.drawRoom()
    this.drawOverlayScreens();

    // Spawn item in location
    const sprite = this.physics.add.sprite(
      (this.cameras.main.width / 2) + (roomSize[0] / 4),
      (this.cameras.main.height / 2) + (roomSize[1] / 4),
      'test-items-spritesheet', 34
    );
    this.physics.add.overlap(this.mainCharacter,sprite,this.collectItem,undefined,this);
  }

  collectItem(player, item) {
    item.disableBody(true, true);
  }

  drawRoom() {
    const roomId = getUrlParam('roomName') || 'firstTest';
    const room = this.cache.json.get(`room-${roomId}`) as Room;
    const roomTileset = room.tileset;

    const map = this.make.tilemap({data: room.layout, tileWidth: 16, tileHeight: 16});
    const tiles = map.addTilesetImage(`${roomTileset}-image`, roomTileset, 16, 16, 1, 2);
    const roomHeight = tiles.tileHeight * room.layout.length;
    const roomWidth = tiles.tileWidth * room.layout[0].length;

    const roomOriginX = (this.cameras.main.width / 2) - roomWidth / 2;
    const roomOriginY = (this.cameras.main.height / 2) - roomHeight / 2;
    this.tileLayer = map.createStaticLayer(
      0,
      tiles,
      roomOriginX,
      roomOriginY
    );
    this.tileLayer.setCollisionBetween(0, 31, true);
    this.tileLayer.setCollisionBetween(40, 71, true);
    this.tileLayer.setDepth(0);
    let npcCounter = 0;
    room.npcs?.forEach((npc) => {
      this.enemy[npcCounter] = new EnemyToken(
        this,
        roomOriginX + npc.x * tiles.tileWidth,
        roomOriginY + npc.y * tiles.tileHeight,
        npc.id
      );
      this.enemy[npcCounter].setDepth(1);
      this.physics.add.collider(this.enemy[npcCounter], this.tileLayer);
      npcCounter++;
    })

    this.physics.add.collider(this.mainCharacter, this.tileLayer);

    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // layer.renderDebug(debugGraphics, {
    //   tileColor: null, // Color of non-colliding tiles
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), 
      // Color of colliding tiles
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    // });
    return [roomWidth, roomHeight]
  }

  drawOverlayScreens() {
    this.overlayScreens.statScreen = new StatScreen(this);
    this.overlayScreens.statScreen.incXY(-this.cameras.main.width/2, -this.cameras.main.height /2);
    this.add.existing(this.overlayScreens.statScreen);
    this.overlayScreens.statScreen.setVisible(false);

    this.overlayScreens.inventory = new InventoryScreen(this);
    this.overlayScreens.inventory.incXY(-this.cameras.main.width/2, -this.cameras.main.height /2);
    this.add.existing(this.overlayScreens.inventory);
    this.overlayScreens.inventory.setVisible(false);
  }

  triggerAbility() {
    // if (this.keyboardHelper.abilityKey1.isDown && !this.fireballEffect) {
    //   const fireballVelocities = getVelocitiesForFacing(globalState.playerCharacter.currentFacing)!;
    //   this.fireballEffect = new FireBallEffect(
    //     this,
    //     this.mainCharacter.x + (16 * fireballVelocities.x),
    //     this.mainCharacter.y + (16 * fireballVelocities.y)
    //   );
    //   this.fireballEffect.setVelocity(fireballVelocities.x, fireballVelocities.y);
    //   this.fireballEffect.body.velocity.normalize().scale(300);

    //   this.physics.add.collider(this.fireballEffect, this.tileLayer, (effect) => {
    //     effect.destroy();
    //     this.fireballEffect = undefined;
    //   });
    //   this.physics.add.collider(this.fireballEffect, this.enemy, (effect, target) => {
    //     effect.destroy();
    //     this.fireballEffect = undefined;
    //     const enemy = target as EnemyToken;
    //     enemy.health = enemy.health - globalState.playerCharacter.damage;
    //   });
    // }
  }

  update(globalTime, delta) {
    this.enemy.forEach(curEnemy => {
      curEnemy.update(globalState.playerCharacter)
    });

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
      this.physics.add.collider(this.fireballEffect, this.enemy, (effect, target) => {
        effect.destroy();
        this.fireballEffect = undefined;
        const enemy = target as EnemyToken;
        enemy.health = enemy.health - globalState.playerCharacter.damage;
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
      this.physics.add.collider(this.icespikeEffect, this.enemy, (effect, target) => {
        const enemy = target as EnemyToken;
        enemy.health = enemy.health - globalState.playerCharacter.damage;
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
        this.enemy[0].health = this.enemy[0].health - globalState.playerCharacter.damage;
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
