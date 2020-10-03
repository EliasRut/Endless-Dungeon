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
    this.load.image('fire', 'assets/img/muzzleflash3.png');
  }

  create() {
    this.scene.start('MainScene');
  }
}
