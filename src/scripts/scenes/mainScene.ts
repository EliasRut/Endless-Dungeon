import PhaserLogo from '../objects/phaserLogo'
import FpsText from '../objects/fpsText'
import globalState from '../worldstate/index';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import FireBall from '../objects/fireBall';

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
    new FireBall(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.fpsText = new FpsText(this)
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    // const particles = this.add.particles('fire');

    // particles.createEmitter({
    //   alpha: { start: 1, end: 0 },
    //   scale: { start: 0.5, end: 2.5 },
    //   tint: { start: 0xff945e, end: 0xff945e },
    //   speed: 20,
    //   accelerationY: -300,
    //   angle: { min: -85, max: -95 },
    //   rotate: { min: -180, max: 180 },
    //   lifespan: { min: 1000, max: 1100 },
    //   blendMode: Phaser.BlendModes.ADD,
    //   frequency: 110,
    //   maxParticles: 8,
    //   x: 400,
    //   y: 300,
    // });
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
