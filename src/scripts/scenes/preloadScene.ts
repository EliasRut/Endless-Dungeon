import { getUrlParam } from "../helpers/browserState";
import { spriteDirectionList } from "../helpers/constants";

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

    // Tiles
    this.load.image('test-tileset', 'assets/img/til_Dungeon-extruded.png');

    // Ability effects
    this.load.image('fire', 'assets/img/muzzleflash3.png');
    this.load.image('ice', 'assets/img/ice_spike.png');
    this.load.image('snow', 'assets/img/snowflake.png');

    // NPCs
    this.neededAnimations.push('red-link');
    this.load.spritesheet('red-link', 'assets/img/red-link.png',
    { frameWidth: 40, frameHeight: 40 });

    // Rooms
    const roomId = getUrlParam('roomName') || 'room-firstTest';
    this.load.json(roomId, `assets/rooms/${roomId}.json`);
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