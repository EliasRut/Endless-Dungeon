import 'phaser'
import PlayerCharacterToken from '../objects/playerCharacterToken';
import { getUrlParam } from '../helpers/browserState'
import { Room} from '../../../typings/custom'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import FireBallEffect from '../objects/fireBallEffect';
import DustNovaEffect from '../objects/dustNovaEffect';
import IceSpikeEffect from '../objects/iceSpikeEffect';
import { getFacing, getVelocitiesForFacing } from '../helpers/orientation';
import FireBall from '../abilities/fireBall'
import EnemyToken from '../objects/enemyToken';
import RangedEnemyToken from '../objects/rangedEnemyToken';
import MeleeEnemyToken from '../objects/meleeEnemyToken';
import ItemToken from '../objects/itemToken';
import Weapon from '../objects/weapon';
import OverlayScreen from '../screens/overlayScreen'
import StatScreen from '../screens/statScreen';
import InventoryScreen from '../screens/inventoryScreen'
import KeyboardHelper from '../helpers/keyboardHelper'
import AbilityEffect from '../objects/abilityEffect';
import Character from '../worldstate/Character';
import { Abilities, AbilityType } from '../abilities/abilityData';
import CharacterToken from '../objects/characterToken';
import { Faction } from '../helpers/constants';
import { DUNGEON_HEIGHT, DUNGEON_WIDTH, generateDungeon, TILE_HEIGHT, TILE_WIDTH } from '../helpers/generateDungeon';

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PlayerCharacterToken;

  soundKey1: Phaser.Input.Keyboard.Key;
  soundKey2: Phaser.Input.Keyboard.Key;
  keyboardHelper: KeyboardHelper;
  effects: Map<string, FireBall>;
  tileLayer: any;
  enemy: EnemyToken[];
  weapon: Weapon[];
  sportLight: Phaser.GameObjects.Light;
  overlayScreens: {
    inventory: InventoryScreen;
    statScreen: StatScreen;
  };
  lastCameraPosition: {x: number, y: number};
  abilityEffects: AbilityEffect[] = [];
  abilities: AbilityEffect[];
  alive:number;
  isPaused = false;
  healthBar: Phaser.GameObjects.Image;
  abilty1Icon: Phaser.GameObjects.Image;
  abilty2Icon: Phaser.GameObjects.Image;
  abilty3Icon: Phaser.GameObjects.Image;

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.alive = 0;
    // tslint:disable-next-line:no-unused-expression
    this.cameras.main.fadeIn(1000);

    this.enemy = [];
    this.weapon = [];
    const [startX, startY] = this.drawRoom()

    this.mainCharacter = new PlayerCharacterToken(this, startX, startY);
    this.mainCharacter.setDepth(1);
    this.cameras.main.startFollow(this.mainCharacter, false);
    this.physics.add.collider(this.mainCharacter, this.tileLayer);

    this.keyboardHelper = new KeyboardHelper(this);
    this.soundKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.soundKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    this.drawOverlayScreens();

    this.sound.play('testSound', {volume: 0.08, loop: true});

    // GUI
    const backpackIcon = this.add.image(this.cameras.main.width - 32, 53, 'icon-backpack');
    backpackIcon.setScrollFactor(0);
    backpackIcon.setInteractive();
    backpackIcon.on('pointerdown', () => {
      if (this.isPaused) {
        this.physics.resume();
        this.time.paused = false;
      } else {
        this.physics.pause();
        this.time.paused = true;
      }
      this.isPaused = !this.isPaused;
      this.overlayScreens.inventory.toggleVisible();
      this.overlayScreens.statScreen.toggleVisible();
    });

    const heroIcon = this.add.image(32, 40, 'icon-hero');
    heroIcon.setScrollFactor(0);

    const guiBaseIcon = this.add.image(116, 50, 'icon-guibase');
    guiBaseIcon.setScrollFactor(0);

    this.healthBar = this.add.image(62, 36, 'icon-healthbar');
    this.healthBar.setScrollFactor(0);
    this.healthBar.setOrigin(0, 0.5);

    this.abilty1Icon = this.add.image(72, 63, 'icon-abilities', 0);
    this.abilty1Icon.setScrollFactor(0);
    this.abilty2Icon = this.add.image(101, 63, 'icon-abilities', 1);
    this.abilty2Icon.setScrollFactor(0);
    this.abilty3Icon = this.add.image(130, 63, 'icon-abilities', 2);
    this.abilty3Icon.setScrollFactor(0);

  }

  collectItem(player, item) {
    item.disableBody(true, true);
  }

  drawRoom() {
    // const roomId = getUrlParam('roomName') || 'firstTest';
    // const room = this.cache.json.get(`room-${roomId}`) as Room;
    // const roomTileset = room.tileset;

    // const map = this.make.tilemap({data: room.layout, tileWidth: 16, tileHeight: 16});
    // const tiles = map.addTilesetImage(`${roomTileset}-image`, roomTileset, 16, 16, 1, 2);
    // const roomHeight = tiles.tileHeight * room.layout.length;
    // const roomWidth = tiles.tileWidth * room.layout[0].length;

    // const roomOriginX = (this.cameras.main.width / 2) - roomWidth / 2;
    // const roomOriginY = (this.cameras.main.height / 2) - roomHeight / 2;

    const [
      tileLayer,
      npcs,
      playerStartX,
      playerStartY
    ] = generateDungeon(this);
    this.tileLayer = tileLayer;

    this.tileLayer.setDepth(0);
    let npcCounter = 0;
    npcs.forEach((npc) => {
      switch(npc.id) {
        case 'red-link': {
          this.enemy[npcCounter] =
                new MeleeEnemyToken( this, npc.x, npc.y, npc.id);
          break;
        }
        case 'red-ball': {
          this.enemy[npcCounter] =
                new RangedEnemyToken( this, npc.x, npc.y, npc.id);
          break;
        }
        default: {
          console.log("Unknown enemy.")
          break;
        }
      }

      this.enemy[npcCounter].setDepth(1);
      this.physics.add.collider(this.enemy[npcCounter], this.tileLayer);
      npcCounter++;
    });

    return [playerStartX, playerStartY];
  }

  renderDebugGraphics() {
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    this.tileLayer.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  }

  drawOverlayScreens() {
    const statScreen = new StatScreen(this);
    this.add.existing(statScreen);
    statScreen.setVisible(false);

    const inventory = new InventoryScreen(this);
    this.add.existing(inventory);
    inventory.setVisible(false);
    this.overlayScreens = {
      statScreen,
      inventory
    };
  }

  triggerAbility(origin: Character, type: AbilityType) {
    // throw all projectiles
    const projectileData = Abilities[type].projectileData;
    const facingVelocities = origin.getFacingVelocities();

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
    this.weapon.forEach(curWeapon => {
      curWeapon.update(globalState.playerCharacter);
    });

    if(globalState.playerCharacter.health <= 0 && this.alive ===0){
      this.cameras.main.fadeOut(3000);
      console.log("you died");
      this.alive = 1;
      // this.scene.pause();
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
    this.overlayScreens.statScreen.update();

    const healthRatio = globalState.playerCharacter.health / globalState.playerCharacter.maxHealth;
    this.healthBar.scaleX = healthRatio * 98;

    const [cooldown1, cooldown2] = this.keyboardHelper.getAbilityCooldowns(globalTime);
    this.abilty1Icon.setAlpha(cooldown1);
    this.abilty2Icon.setAlpha(cooldown2);
  }
}
