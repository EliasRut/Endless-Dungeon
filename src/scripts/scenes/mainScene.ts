import 'phaser'
import PlayerCharacterToken from '../objects/playerCharacterToken';
import { getUrlParam } from '../helpers/browserState'
import { Room} from '../../../typings/custom'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import FireBallEffect from '../objects/fireBallEffect';
import DustNovaEffect from '../objects/dustNovaEffect';
import IceSpikeEffect from '../objects/iceSpikeEffect';
import { getFacing, getRotationInRadiansForFacing, getVelocitiesForFacing } from '../helpers/orientation';
// import FireBall from '../abilities/fireBall'
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
import { Faction, VISITED_TILE_TINT } from '../helpers/constants';
import DungeonGenerator, { DUNGEON_BLOCKS_Y, DUNGEON_HEIGHT } from '../helpers/generateDungeon';
import FpsText from '../objects/fpsText';
import { fullColorHex } from '../helpers/colors';
import { TILE_WIDTH, TILE_HEIGHT, DUNGEON_BLOCKS_X, DUNGEON_WIDTH } from '../helpers/generateDungeon';

const visibleTiles: boolean[][] = [];

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PlayerCharacterToken;

  soundKey1: Phaser.Input.Keyboard.Key;
  soundKey2: Phaser.Input.Keyboard.Key;
  keyboardHelper: KeyboardHelper;

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
  alive: number;
  isPaused = false;
  healthBar: Phaser.GameObjects.Image;
  abilty1Icon: Phaser.GameObjects.Image;
  abilty2Icon: Phaser.GameObjects.Image;
  abilty3Icon: Phaser.GameObjects.Image;
  tileLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  lastLightLevel: number = 255;

  lightingLevels: number[][] = [];

  isBlockingTile: boolean[][] = [];
  updatedTiles: [number, number][] = [];
  visitedTiles: number[][] = [];

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.alive = 0;
    // tslint:disable-next-line:no-unused-expression
    this.cameras.main.fadeIn(1000);

    this.enemy = [];
    this.weapon = [];
    const [startX, startY] = this.drawRoom();

    this.prepareDynamicLighting();

    this.mainCharacter = new PlayerCharacterToken(this, startX, startY);
    this.mainCharacter.setDepth(1);
    this.cameras.main.startFollow(this.mainCharacter, false);
    this.physics.add.collider(this.mainCharacter, this.tileLayer);

    this.keyboardHelper = new KeyboardHelper(this);
    this.soundKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.soundKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
    
    this.drawOverlayScreens();

    this.drawGUI();

    this.sound.play('testSound', {volume: 0.08, loop: true});
  }

  collectItem(player, item) {
    item.disableBody(true, true);
  }

  drawRoom() {
    const dungeonGenerator = new DungeonGenerator();

    const [
      tileLayer,
      npcs,
      playerStartX,
      playerStartY
    ] = dungeonGenerator.generateDungeon(this);
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

  prepareDynamicLighting() {
    this.tileLayer.forEachTile((tile) => tile.tint = 0x000000);
    for (let x = 0; x < DUNGEON_WIDTH; x++) {
        this.isBlockingTile[x] = [];
        this.visitedTiles[x] = [];
      for (let y = 0; y < DUNGEON_HEIGHT; y++) {
        this.visitedTiles[x][y] = 0;
        const tile = this.tileLayer.getTileAt(x, y);
        if (!tile) {
          this.isBlockingTile[x][y] = true;
        } else {
          const tileIdNormalized = tile.index % 1000;
          this.isBlockingTile[x][y] = tileIdNormalized < 15 ||
            (tileIdNormalized >= 45 && tileIdNormalized < 60);
        }
      }
    }

    for (let x = 0; x < 18 * 16; x++) {
      this.lightingLevels[x] = [];
      for (let y = 0; y < 18 * 16; y++) {
        // Good old pythagoras for getting actual distance to the tile
        const distance = Math.hypot(x, y);
        // This will be a factor between 0 and 1
        const distanceNormalized = Math.max(0, 255 - distance) / 255;
        // We multiply by 300 to have a bit larger well-lit radius
        const d = Math.min(255, Math.round(distanceNormalized  * 300));
        // This will give us a hex value of 0xdddddd, so a greyscale lighting factor
        this.lightingLevels[x][y] = Math.max(VISITED_TILE_TINT,
          0x010000 * d + 0x000100 * d + 0x000001 * d);
      }
    }

    for (let x = 0; x < 32; x++) {
      visibleTiles[x] = [];
      for (let y = 0; y < 32; y++) {
        visibleTiles[x][y] = false;
      }
    }
  }

  drawGUI() {
    // GUI
    this.fpsText = new FpsText(this);

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
    heroIcon.setDepth(2);

    const guiBaseIcon = this.add.image(116, 50, 'icon-guibase');
    guiBaseIcon.setScrollFactor(0);
    guiBaseIcon.setDepth(2);

    this.healthBar = this.add.image(62, 36, 'icon-healthbar');
    this.healthBar.setScrollFactor(0);
    this.healthBar.setOrigin(0, 0.5);
    this.healthBar.setDepth(2);

    this.abilty1Icon = this.add.image(72, 63, 'icon-abilities', 0);
    this.abilty1Icon.setScrollFactor(0);
    this.abilty1Icon.setDepth(2);
    this.abilty2Icon = this.add.image(101, 63, 'icon-abilities', 1);
    this.abilty2Icon.setScrollFactor(0);
    this.abilty2Icon.setDepth(2);
    this.abilty3Icon = this.add.image(130, 63, 'icon-abilities', 2);
    this.abilty3Icon.setScrollFactor(0);
    this.abilty3Icon.setDepth(2);
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
    // We allow for multiple projectiles per ability.
    // Let's get the data for ability projectiles first.
    const projectileData = Abilities[type].projectileData;
    // Since we're allowing projectiles to have a spread, we'll be using radians for easier math
    const facingRotation = getRotationInRadiansForFacing(origin.currentFacing);
    const numProjectiles =  (Abilities[type].projectiles || 0);
    const fireProjectile = (projectileIndex: number) => {
      // Spread multiple projectiles over an arc on a circle
      const spread = projectileData?.spread ? projectileData!.spread : [0, 0];
      // The total arc we want to cover
      const spreadDistance = spread[1] - spread[0];
      // The current point in the arc we are at
      const currentSpread = spread[0] + spreadDistance * (projectileIndex / numProjectiles);
      // We want to combine the arc position with the characters facing to allow cone-like effects
      const yMultiplier = -Math.cos(currentSpread * Math.PI + facingRotation);
      const xMultiplier = Math.sin(currentSpread * Math.PI + facingRotation);
      const effect = new projectileData!.effect(
        this,
        origin.x + xMultiplier * projectileData!.xOffset,
        origin.y + yMultiplier * projectileData!.yOffset,
        '',
        origin.currentFacing
      );
      effect.setVelocity(xMultiplier, yMultiplier);
      effect.body.velocity.scale(projectileData!.velocity);

      effect.setDrag(projectileData!.drag || 0);

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
    // Go through all projectiles the ability should launch
    for (let i = 0; i < numProjectiles; i++) {
      // If the ability uses time delayed casting, use a timeout for each of them
      if (projectileData?.delay) {
        setTimeout(() => fireProjectile(i), i * projectileData.delay);
      } else { // If not, we can cast them immediately
        fireProjectile(i);
      }
    }
    // We just want to play the ability sound once, not once for each projectile
    if (Abilities[type].sound) {
      this.sound.play(Abilities[type].sound!, {volume: Abilities[type].sfxVolume!});
    }
  }

  update(globalTime, delta) {
    this.fpsText.update();

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

    globalState.playerCharacter.x = Math.round(this.mainCharacter.x);
    globalState.playerCharacter.y = Math.round(this.mainCharacter.y);

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

    if (this.soundKey2.isDown) {
      this.sound.stopAll();
    };
    this.overlayScreens.statScreen.update();

    const healthRatio = globalState.playerCharacter.health / globalState.playerCharacter.maxHealth;
    this.healthBar.scaleX = healthRatio * 98;

    const [cooldown1, cooldown2, cooldown3] = this.keyboardHelper.getAbilityCooldowns(globalTime);
    this.abilty1Icon.setAlpha(cooldown1);
    this.abilty2Icon.setAlpha(cooldown2);
    this.abilty3Icon.setAlpha(cooldown3);

    this.updateDynamicLighting();

    this.enemy.forEach(curEnemy => {
      curEnemy.update(globalTime);
    });
    this.weapon.forEach(curWeapon => {
      curWeapon.update(globalState.playerCharacter);
    });
  }

  // Used only for performance debugging
  dynamicLightingTimes: number[] = [];
  reducedLightingArray: number[][] = [];

  updateDynamicLighting() {
    // Take time for benchmarking
    const beforeDynamicLighting = window.performance.now();

    // We have a slight offset on the player token, not yet sure why
    const playerTokenX = globalState.playerCharacter.x - 5;
    const playerTokenY = globalState.playerCharacter.y;
    // Get the tile the player token is on
    const playerTileX = Math.round(playerTokenX / TILE_WIDTH);
    const playerTileY = Math.round(playerTokenY / TILE_HEIGHT);
    // We calculate darkness values for 32x32 tiles, seems to be enough visually speaking
    const lowerBoundX = Math.min(16, playerTileX) * -1;
    const upperBoundX = Math.min(16, 127 - playerTileX);
    const lowerBoundY = Math.min(16, playerTileY) * -1;
    const upperBoundY = Math.min(16, 127 - playerTileY);

    // The player character tile is always fully lit
    const playerTile = this.tileLayer.getTileAt(playerTileX, playerTileY);
    playerTile.tint = 0xffffff;

    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        visibleTiles[x][y] = false;
      }
    }

    for (let xVect = -14; xVect < 14; xVect++) {
      for (let yVect = -14; yVect < 14; yVect++) {
        this.castLightingRay(
          playerTileX,
          playerTileY,
          xVect / 14,
          yVect / 14,
          14
        );
      }
    }

    for (let x = lowerBoundX; x < upperBoundX; x++) {
      for (let y = lowerBoundY; y < upperBoundY; y++) {
        const tileX = playerTileX + x;
        const tileY = playerTileY + y;
        const tile = this.tileLayer.getTileAt(tileX, tileY);

        // Not all fields have tiles, black fields have no tile
        if (tile) {
          const distanceX = Math.abs(playerTokenX - tile.pixelX);
          const distanceY = Math.abs(playerTokenY - tile.pixelY);
          // Visited Tiles is either VISITED_TILE_TINT or 0 for each tile
          this.visitedTiles[tileX][tileY] = Math.max(
            VISITED_TILE_TINT * (visibleTiles[x + 16][y + 16] as unknown as number),
            this.visitedTiles[tileX][tileY]
          );

          // That is: lightingLevel for the distance if it is currently visible, 
          // VISITED_TILE_TINT if it has been visited before,
          // black otherwise
          tile.tint = visibleTiles[x + 16][y + 16] as unknown as number *
            this.lightingLevels[distanceX][distanceY] +
            (1 - (visibleTiles[x + 16][y + 16] as unknown as number)) *
              this.visitedTiles[tileX][tileY];
        }
      }
    }

    this.dynamicLightingTimes.push(window.performance.now() - beforeDynamicLighting);
    if (this.dynamicLightingTimes.length >= 600) {
      const avg = this.dynamicLightingTimes.reduce((sum, value) => sum + value)
        / this.dynamicLightingTimes.length;
      console.log(`Dynamic lighting took on avg ${avg} ms`);
      this.dynamicLightingTimes = [];
    }
  }

  // This is a bit performance optimized :D
  castLightingRay = (
    originX: number,
    originY: number,
    vectorX: number,
    vectorY: number,
    steps: number
  ) => {
    let x = 0;
    let y = 0;
    let xDelta = 0;
    let yDelta = 0;
    // Basically, we don't want to have to deal with decimal values, so multiply by 10000 and round
    const xThreshold = 10000;
    const yThreshold = 10000;
    const xStepDiff = vectorX < 0 ? -1 : 1;
    const yStepDiff = vectorY < 0 ? -1 : 1;
    const vectorXAbs = Math.abs(Math.round(vectorX * 10000));
    const vectorYAbs = Math.abs(Math.round(vectorY * 10000));
    // We don't want to multiply if we can prevent it, but we want to have if statements even less
    // So what we end up doing is using the boolean-as-a-number trick and multiply where we have to
    for (let i = 1; i <= steps; i++) {
      xDelta += vectorXAbs;
      yDelta += vectorYAbs;
      x += (xDelta >= xThreshold) as unknown as number * xStepDiff;
      y += (yDelta >= yThreshold) as unknown as number * yStepDiff;
      xDelta -= (xDelta >= xThreshold) as unknown as number * xThreshold;
      yDelta -= (yDelta >= yThreshold) as unknown as number * yThreshold;

      visibleTiles[x + 16][y + 16] = true;
      if (this.isBlockingTile[x + originX][y + originY]) {
        // Break actually stops this ray from being casted
        break;
      }
    }
  }
}
