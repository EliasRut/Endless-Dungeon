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
import Character from '../worldstate/Character';
import { Abilities, AbilityType } from '../abilities/abilityData';
import CharacterToken from '../objects/characterToken';
import { Faction } from '../helpers/constants';

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PlayerCharacterToken;

  soundKey1: Phaser.Input.Keyboard.Key;
  soundKey2: Phaser.Input.Keyboard.Key;
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
  abilityEffects: AbilityEffect[] = [];

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
    this.soundKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.soundKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    const roomSize = this.drawRoom()
    this.drawOverlayScreens();

    // Spawn item in location
    const sprite = this.physics.add.sprite(
      (this.cameras.main.width / 2) + (roomSize[0] / 4),
      (this.cameras.main.height / 2) + (roomSize[1] / 4),
      'test-items-spritesheet', 34
    );
    this.physics.add.overlap(this.mainCharacter,sprite,this.collectItem,undefined,this);

    this.sound.play('testSound', {volume: 0.08, loop: true});
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

  triggerAbility(origin: Character, type: AbilityType) {
    // throw all projectiles
    const projectileData = Abilities[type].projectileData;
    const facingVelocities = getVelocitiesForFacing(origin.currentFacing)!;

    for (let i = 0; i < (Abilities[type].projectiles || 0); i++) {
      const effect = new projectileData!.effect(
        this,
        origin.x + facingVelocities.x * projectileData!.xOffset,
        origin.y + facingVelocities.y * projectileData!.yOffset,
        '',
        origin.currentFacing
      );
      effect.setVelocity(facingVelocities.x, facingVelocities.y);
      effect.body.velocity.normalize().scale(projectileData!.velocity);

      this.physics.add.collider(effect, this.tileLayer, () => {
        effect.destroy();
        if (projectileData?.collisionSound) {
          this.sound.play(projectileData.collisionSound!, {volume: projectileData.sfxVolume!});
        }
      });

      const targetTokens = origin.faction === Faction.PLAYER ? this.enemy : this.mainCharacter;
      this.physics.add.collider(effect, targetTokens, (effect, target) => {
        effect.destroy();
        const enemy = target as CharacterToken;
        enemy.stateObject.health -= origin.damage;
        if (projectileData?.collisionSound) {
          this.sound.play(projectileData.collisionSound!, {volume: projectileData.sfxVolume!});
        }
      });
      this.abilityEffects.push(effect);
    }
    if (Abilities[type].sound) {
      this.sound.play(Abilities[type].sound!, {volume: Abilities[type].sfxVolume!});
    }
  }

  update(globalTime, delta) {
    this.enemy.forEach(curEnemy => {
      curEnemy.update(globalTime);
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

    const castAbilities = this.keyboardHelper.getCastedAbilities(globalTime);
    castAbilities.forEach((ability) => {
      this.triggerAbility(globalState.playerCharacter, ability);
    });

    this.abilityEffects = this.abilityEffects.filter(
      (effect) => !effect.destroyed
    );
    this.abilityEffects.forEach((effect) => {
      effect.update();
    });

    // if (this.keyboardHelper.abilityKey3.isDown && !this.dustnovaEffect) {
    //   const fireballVelocities = getVelocitiesForFacing(globalState.playerCharacter.currentFacing)!;
    //   this.dustnovaEffect = new DustNovaEffect(
    //     this,
    //     this.mainCharacter.x + (16 * fireballVelocities.x),
    //     this.mainCharacter.y + (16 * fireballVelocities.y)
    //   );
    //   this.dustnovaEffect.setVelocity(fireballVelocities.x, fireballVelocities.y);
    //   this.dustnovaEffect.body.velocity.normalize().scale(300);

    //   this.physics.add.collider(this.dustnovaEffect, this.tileLayer, (effect) => {
    //     effect.destroy();
    //     this.dustnovaEffect = undefined;
    //   });
    //   this.physics.add.collider(this.dustnovaEffect, this.enemy, (effect, enemy) => {
    //     effect.destroy();
    //     this.dustnovaEffect = undefined;
    //     this.enemy[0].health = this.enemy[0].health - globalState.playerCharacter.damage;
    //   });
    // }
    
    if (this.soundKey2.isDown) {
      this.sound.stopAll();
    };
    
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
