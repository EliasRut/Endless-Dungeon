import PhaserLogo from '../objects/phaserLogo'
import FpsText from '../objects/fpsText'
import globalState from '../worldstate/index';

/*
  The main scene handles the actual game play.
*/
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text
  mainCharacter: PhaserLogo;

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    // tslint:disable-next-line:no-unused-expression
    this.mainCharacter = new PhaserLogo(this, this.cameras.main.width / 2, 0)
    this.fpsText = new FpsText(this)

    setInterval(() => {
      // Set player character position
      globalState.playerCharacter.x = Math.random() * this.cameras.main.width;
      globalState.playerCharacter.y = Math.random() * this.cameras.main.height;
    }, 1000);
  }

  update() {
    this.fpsText.update()
    this.mainCharacter.setPosition(globalState.playerCharacter.x, globalState.playerCharacter.y);
  }
}
