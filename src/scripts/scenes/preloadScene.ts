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
    this.load.image('empty-char', 'assets/img/empty_16x16_char.png');
    this.load.image('phaser-logo', 'assets/img/phaser-logo.png');

    this.load.image('test-tileset', 'assets/img/til_Test.png');

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
        frameRate: 8,
        repeat: -1
      });
    }


    this.scene.start('MainScene');
  }
}
