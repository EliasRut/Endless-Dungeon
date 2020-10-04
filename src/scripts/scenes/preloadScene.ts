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

  preload() {
    this.load.spritesheet('main-character', 'assets/img/main-character.png',
      { frameWidth: 40, frameHeight: 40 });
    this.load.spritesheet('screen-background', 'assets/img/screen-background.png',
      { frameWidth: 64, frameHeight: 64 });
    this.load.image('empty-tile', 'assets/img/empty_16x16_tile.png');
    this.load.image('phaser-logo', 'assets/img/phaser-logo.png');

    this.load.image('test-tileset', 'assets/img/til_Dungeon-extruded.png');

    this.load.image('fire', 'assets/img/muzzleflash3.png');
    this.load.image('ice', 'assets/img/ice_spike.png');
    this.load.image('snow', 'assets/img/snowflake.png');

    this.load.spritesheet('red-link', 'assets/img/red-link.png',
    { frameWidth: 40, frameHeight: 40 });

    const roomId = getUrlParam('roomName') || 'room-firstTest';
    this.load.json(roomId, `assets/rooms/${roomId}.json`);
  }

  create() {

    // Create player character animations
    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
      const numIdleFrames = 4;
      const numWalkFrames = 8;

      const idleFrameOffset = numIdleFrames * directionIndex;
      const firstWalkFrame = numIdleFrames * spriteDirectionList.length;
      const walkFrameOffset = firstWalkFrame + numWalkFrames * directionIndex;

      const directionName = spriteDirectionList[directionIndex];

      this.anims.create({
        key: `player-character-idle-${directionName}`,
        frames: this.anims.generateFrameNumbers('main-character', {
          start: idleFrameOffset,
          end: idleFrameOffset /* Currently only 1 drawn */
        }),
        frameRate: 5,
        repeat: -1
      });
      this.anims.create({
        key: `player-walk-${directionName}`,
        frames: this.anims.generateFrameNumbers('main-character', {
          start: walkFrameOffset,
          end: walkFrameOffset + numWalkFrames - 1
        }),
        frameRate: 12,
        repeat: -1
      });
      this.anims.create({
        key: `red-link-idle-${directionName}`,
        frames: this.anims.generateFrameNumbers('red-link', {
          start: idleFrameOffset,
          end: idleFrameOffset /* Currently only 1 drawn */
        }),
        frameRate: 5,
        repeat: -1
      });
      this.anims.create({
        key: `red-link-walk-${directionName}`,
        frames: this.anims.generateFrameNumbers('red-link', {
          start: walkFrameOffset,
          end: walkFrameOffset + numWalkFrames - 1
        }),
        frameRate: 12,
        repeat: -1
      });
    }

    this.scene.start('MainScene');
  }
}