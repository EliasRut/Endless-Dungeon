import { getUrlParam } from "../helpers/browserState";
import { spriteDirectionList } from "../helpers/constants";
import globalState from "../worldstate";

/*
  The preload scene is the one we use to load assets. Once it's finished, it brings up the main
  scene.
*/
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  neededAnimations = ['player'];

  preload() {
    // Empty tile
    this.load.image('empty-tile', 'assets/img/empty_16x16_tile.png');

    // Player
    this.load.spritesheet('player', 'assets/img/main-character.png',
      { frameWidth: 40, frameHeight: 40 });

    // Overlay screens
    this.load.spritesheet('screen-background', 'assets/img/screen-background.png',
      { frameWidth: 64, frameHeight: 64 });

    // Ability effects
    this.load.image('fire', 'assets/img/muzzleflash3.png');
    this.load.image('ice', 'assets/img/ice_spike.png');
    this.load.image('snow', 'assets/img/snowflake.png');

    // GUI
    this.load.image('icon-backpack', 'assets/img/backpack-icon.png');
    this.load.image('icon-hero', 'assets/img/hero-icon.png');
    this.load.image('icon-guibase', 'assets/img/gui-base.png');
    this.load.image('icon-healthbar', 'assets/img/gui-life.png');
    this.load.spritesheet('icon-abilities', 'assets/img/abilities-sheet.png',
      { frameWidth: 20, frameHeight: 20 });

    // Items
    this.load.spritesheet('test-items-spritesheet', 'assets/img/items-test-small.png',
      { frameWidth: 16, frameHeight: 16 });

    console.log(this.textures.list)

    // load test music
    this.load.audio('testSound', 'assets/sounds/testSound.MP3');
    this.load.audio('sound-fireball', 'assets/sounds/fireball.wav');
    this.load.audio('sound-icespike', 'assets/sounds/icespike.wav');
    this.load.audio('sound-icespike-hit', 'assets/sounds/icespike-hit.wav');
    this.load.audio('sound-fireball-explosion', 'assets/sounds/fireball-explosion.wav');
    this.load.bitmapFont('pixelfont', 'assets/fonts/font.png', 'assets/fonts/font.fnt');

    // Find out which files we need by going through all rendered rooms
    const requiredTilesets = new Set<string>();
    const requiredNpcs = new Set<string>();
    globalState.availableRooms.forEach((room) => {
      requiredTilesets.add(room.tileset);
      room.npcs?.forEach((npc) => {
        requiredNpcs.add(npc.id);
      })
    })

    // Tiles
    requiredTilesets.forEach((tileSet) => {
      this.load.image(tileSet, `assets/tilesets/${tileSet}.png`);
    })

    // NPCs
    requiredNpcs.forEach((npc) => {
    this.load.spritesheet(npc, `assets/img/${npc}.png`,
      { frameWidth: 40, frameHeight: 40 });
      this.neededAnimations.push(npc);
    })
  }

  create() {

    // Create character animations
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
      const numIdleFrames = 4;
      const numWalkFrames = 8;

      const idleFrameOffset = numIdleFrames * directionIndex;
      const firstWalkFrame = numIdleFrames * spriteDirectionList.length;
      const walkFrameOffset = firstWalkFrame + numWalkFrames * directionIndex;

      const directionName = spriteDirectionList[directionIndex];

      this.neededAnimations.forEach((tokenName) => {
        this.anims.create({
          key: `${tokenName}-idle-${directionName}`,
          frames: this.anims.generateFrameNumbers(tokenName, {
            start: idleFrameOffset,
            end: idleFrameOffset /* Currently only 1 drawn */
          }),
          frameRate: 5,
          repeat: -1
        });
        this.anims.create({
          key: `${tokenName}-walk-${directionName}`,
          frames: this.anims.generateFrameNumbers(tokenName, {
            start: walkFrameOffset,
            end: walkFrameOffset + numWalkFrames - 1
          }),
          frameRate: 12,
          repeat: -1
        });
      });
    }

    this.scene.start('MainScene');
  }
}