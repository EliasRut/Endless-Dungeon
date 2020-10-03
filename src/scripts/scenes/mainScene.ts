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

  }

  update() {
    this.fpsText.update()
    const characterHealth = globalState.playerCharacter.health;
    this.mainCharacter.setPosition(globalState.playerCharacter.x, globalState.playerCharacter.y);
    // console.log(globalState.playerCharacter.name)
  }
}
