export default class PositionText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, 10, 340, '', { color: 'white', fontSize: '14px' })
    this.setScrollFactor(0);
    scene.add.existing(this)
    this.setOrigin(0);
    this.setDepth(1);
  }

  public update(yPos, xPos) {
    this.setText(`Pos y${yPos}, x${xPos}.`);
  }
}
