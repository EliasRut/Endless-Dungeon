import 'phaser'
import PlayerCharacterToken from '../objects/playerCharacterToken';
import globalState from '../worldstate/index';
import { getFacing, getRotationInRadiansForFacing } from '../helpers/orientation';
// import FireBall from '../abilities/fireBall'
import EnemyToken from '../objects/enemyToken';
import RangedEnemyToken from '../objects/rangedEnemyToken';
import MeleeEnemyToken from '../objects/meleeEnemyToken';
import Weapon from '../objects/weapon';
import StatScreen from '../screens/statScreen';
import InventoryScreen from '../screens/inventoryScreen'
import KeyboardHelper from '../helpers/keyboardHelper'
import AbilityEffect from '../objects/abilityEffect';
import Character from '../worldstate/Character';
import { Abilities, AbilityType } from '../abilities/abilityData';
import CharacterToken from '../objects/characterToken';
import { Faction, VISITED_TILE_TINT } from '../helpers/constants';
import DungeonGenerator, { DUNGEON_HEIGHT } from '../helpers/generateDungeon';
import FpsText from '../objects/fpsText';
import { TILE_WIDTH, TILE_HEIGHT, DUNGEON_WIDTH } from '../helpers/generateDungeon';
import Inventory from '../worldstate/Inventory';

const visibleTiles: boolean[][] = [];

const sightRadius = 12;
const lightRadius = 8;

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PlayerCharacterToken;

  soundKey1: Phaser.Input.Keyboard.Key;
  soundKey2: Phaser.Input.Keyboard.Key;
  keyboardHelper: KeyboardHelper;

  enemy: EnemyToken[];
  inventory: Inventory;
  groundItem: Weapon[];
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
  abilty4Icon: Phaser.GameObjects.Image;
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
    this.groundItem = [];
    const [startX, startY] = this.drawRoom();

    this.prepareDynamicLighting();

    this.mainCharacter = new PlayerCharacterToken(this, startX, startY);
    this.mainCharacter.setDepth(1);
    this.cameras.main.startFollow(this.mainCharacter, false);
    this.physics.add.collider(this.mainCharacter, this.tileLayer);

    this.inventory = new Inventory(this);
    const rndItem = Math.floor(Math.random() * 63); // todo calculate from tileset
    const length = this.groundItem.push(new Weapon(this, startX-30, startY-30, rndItem));
    this.groundItem[length-1].setDepth(1);

    this.keyboardHelper = new KeyboardHelper(this);
    this.soundKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.soundKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);

    this.drawOverlayScreens();

    this.drawGUI();
    var pointers = this.input.activePointer;
    this.input.on('pointerdown', function (pointer) {
      console.log("mouse x", pointers.x)
      console.log("mouse y", pointers.y)
});


// console.log("mouse x", this.input.activePointer.x)
// debugger;
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

    const maxLightDistance = lightRadius * 16;
    for (let x = 0; x < (sightRadius + 2) * 16; x++) {
      this.lightingLevels[x] = [];
      for (let y = 0; y < (sightRadius + 2) * 16; y++) {
        // Good old pythagoras for getting actual distance to the tile
        const distance = Math.hypot(x, y);
        // This will be a factor between 0 and 1
        const distanceNormalized = Math.max(0, maxLightDistance - distance) / maxLightDistance;
        // We multiply by 300 to have a bit larger well-lit radius
        // We substract 1 to allow our adding of 0x010101 later on, which will indicate that the
        // field is currently visible. That's a hack, but it works :P
        const d = Math.min(255 - 1, Math.round(distanceNormalized * 300));
        // This will give us a hex value of 0xdddddd, so a greyscale lighting factor
        this.lightingLevels[x][y] =
          0x010000 * d + 0x000100 * d + 0x000001 * d + 0x010101;
      }
    }

    for (let x = 0; x < 2 * sightRadius; x++) {
      visibleTiles[x] = [];
      for (let y = 0; y < 2 * sightRadius; y++) {
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
    backpackIcon.setDepth(2);
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

    this.healthBar = this.add.image(62, 35, 'icon-healthbar');
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
    this.abilty4Icon = this.add.image(159, 63, 'icon-abilities', 2);
    this.abilty4Icon.setScrollFactor(0);
    this.abilty4Icon.setDepth(2);
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
      this.cameras.main.fadeOut(1000);
      console.log("you died");
      this.alive = 1;
      // this.scene.pause();
      return;
    }

    const castAbilities = this.keyboardHelper.getCastedAbilities(globalTime);
    const msSinceLastCast = this.keyboardHelper.getMsSinceLastCast(globalTime);
    const isCasting = msSinceLastCast < 250;

    const [xFacing, yFacing] = this.keyboardHelper.getCharacterFacing();
    const newFacing = getFacing(xFacing, yFacing);

    const hasMoved = isCasting ? false : (xFacing !== 0 || yFacing !== 0);
    const playerAnimation = globalState.playerCharacter.updateMovingState(hasMoved, newFacing);
    if (playerAnimation) {
      this.mainCharacter.play(playerAnimation);
    }

    const speed = isCasting ? 0 : globalState.playerCharacter.getSpeed();

    this.mainCharacter.setVelocity(xFacing * speed, yFacing * speed);
    this.mainCharacter.body.velocity.normalize().scale(speed);

    globalState.playerCharacter.x = Math.round(this.mainCharacter.x);
    globalState.playerCharacter.y = Math.round(this.mainCharacter.y);

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
    this.healthBar.scaleX = Math.max(0, healthRatio * 98);

    const [
      cooldown1,
      cooldown2,
      cooldown3,
      cooldown4
    ] = this.keyboardHelper.getAbilityCooldowns(globalTime);
    this.abilty1Icon.setAlpha(cooldown1);
    this.abilty2Icon.setAlpha(cooldown2);
    this.abilty3Icon.setAlpha(cooldown3);
    this.abilty4Icon.setAlpha(cooldown4);

    this.updateDynamicLighting();

    this.enemy.forEach(curEnemy => {
      curEnemy.update(globalTime);
    });
    this.groundItem.forEach(curItem => { //TODO: remove items that are picked up
      curItem.update(this);
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
    const lowerBoundX = Math.min(sightRadius, playerTileX) * -1;
    const upperBoundX = Math.min(sightRadius, 127 - playerTileX);
    const lowerBoundY = Math.min(sightRadius, playerTileY) * -1;
    const upperBoundY = Math.min(sightRadius, 127 - playerTileY);

    // The player character tile is always fully lit
    const playerTile = this.tileLayer.getTileAt(playerTileX, playerTileY);
    playerTile.tint = 0xffffff;

    for (let x = 0; x < 2 * sightRadius; x++) {
      for (let y = 0; y < 2 * sightRadius; y++) {
        visibleTiles[x][y] = false;
      }
    }

    for (let xVect = -sightRadius; xVect < sightRadius; xVect++) {
      for (let yVect = -sightRadius; yVect < sightRadius; yVect++) {
        this.castLightingRay(
          playerTileX,
          playerTileY,
          xVect / sightRadius,
          yVect / sightRadius,
          sightRadius
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
            VISITED_TILE_TINT *
              ((visibleTiles[x + sightRadius][y + sightRadius] &&
                (Math.hypot(distanceX, distanceY) <= (lightRadius * 16))) as unknown as number),
            this.visitedTiles[tileX][tileY]
          );
          //

          // That is: lightingLevel for the distance if it is currently visible, 
          // VISITED_TILE_TINT if it has been visited before,
          // black otherwise
          tile.tint = Math.max(
            visibleTiles[x + sightRadius][y + sightRadius] as unknown as number *
              this.lightingLevels[distanceX][distanceY],
            this.visitedTiles[tileX][tileY] +
              (visibleTiles[x + sightRadius][y + sightRadius] as unknown as number)
          );
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

      visibleTiles[x + sightRadius][y + sightRadius] = true;
      if (this.isBlockingTile[x + originX][y + originY]) {
        // Break actually stops this ray from being casted
        break;
      }
    }
  }
}
