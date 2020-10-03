export default class PlayerCharacterToken extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'empty-tile')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.body.setCircle(8, 12, 12);
  }
}
