import globalState from '../worldstate/index';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../helpers/generateDungeon';
export default class FpsText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, 10, 0, '', { color: 'white', fontSize: '14px' })
    this.setScrollFactor(0);
    scene.add.existing(this)
    this.setOrigin(0)
  }

  public update() {
    const xPos = Math.round(globalState.playerCharacter.x / BLOCK_SIZE / TILE_WIDTH);
    const yPos = Math.round(globalState.playerCharacter.y / BLOCK_SIZE / TILE_HEIGHT);
    this.setText(`fps: ${Math.floor(this.scene.game.loop.actualFps)}. ` +
      `Pos y${yPos}, x${xPos}.`);
  }
}
