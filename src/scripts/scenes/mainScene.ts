import PhaserLogo from '../objects/phaserLogo'
import FpsText from '../objects/fpsText'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';

/*
  The main scene handles the actual game play.
*/
export default class MainScene extends Phaser.Scene {
  fpsText: Phaser.GameObjects.Text;
  mainCharacter: PhaserLogo;
  upKey: Phaser.Input.Keyboard.Key;
  downKey: Phaser.Input.Keyboard.Key;
  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;
  

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    // tslint:disable-next-line:no-unused-expression
    this.mainCharacter = new PhaserLogo(this, this.cameras.main.width / 2, 0)
    this.fpsText = new FpsText(this)
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

  //   setInterval(() => {
  //     // Set player character position
  //     globalState.playerCharacter.x = 0 * this.cameras.main.height;
  //     globalState.playerCharacter.y = 0 * this.cameras.main.height;
  //   }, 1000);
  }

  update() {
    this.fpsText.update();
    this.mainCharacter.setPosition(globalState.playerCharacter.x, globalState.playerCharacter.y);
    
    if (this.upKey.isDown)
    {
        globalState.playerCharacter.y--;
    }
    else if (this.downKey.isDown)
    {
      globalState.playerCharacter.y++;
    }

    if (this.leftKey.isDown)
    {
      globalState.playerCharacter.x--;
    }
    else if (this.rightKey.isDown)
    {
      globalState.playerCharacter.x++;
    }

  }
}
