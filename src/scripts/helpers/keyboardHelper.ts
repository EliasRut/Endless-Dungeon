import globalState from "../worldstate";

export default class KeyboardHelper {
  upKey: Phaser.Input.Keyboard.Key;
  downKey: Phaser.Input.Keyboard.Key;
  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;
  abilityKey1: Phaser.Input.Keyboard.Key;
  abilityKey2: Phaser.Input.Keyboard.Key;
  abilityKey3: Phaser.Input.Keyboard.Key;
  abilityKey4: Phaser.Input.Keyboard.Key;

  constructor (scene: Phaser.Scene) {
    this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    this.abilityKey1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.abilityKey2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.abilityKey3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.abilityKey4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
  }

  getCharacterFacing() {
    let yFacing = 0;
    let xFacing = 0;

    const speed = globalState.playerCharacter.getSpeed();

    if (this.upKey.isDown) {
      yFacing = -1;
    } else if (this.downKey.isDown) {
      yFacing = 1;
    }

    if (this.leftKey.isDown) {
      xFacing = -1;
    } else if (this.rightKey.isDown) {
      xFacing = 1;
    }

    return [xFacing, yFacing];
  }

}