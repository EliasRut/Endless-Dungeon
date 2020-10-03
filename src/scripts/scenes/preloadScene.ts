import { getUrlParam } from "../helpers/browserState";

/*
  The preload scene is the one we use to load assets. Once it's finished, it brings up the main
  scene.
*/
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.image('phaser-logo', 'assets/img/phaser-logo.png');
    this.load.image('test-tileset', 'assets/img/phaser-logo.png');

    const roomId = getUrlParam('roomName') || 'room-firstTest';
    this.load.json(roomId, `assets/rooms/${roomId}.json`);
  }

  create() {
    this.scene.start('MainScene');
  }
}
