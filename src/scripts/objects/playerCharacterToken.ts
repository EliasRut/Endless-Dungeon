import globalState from "../worldstate";
import CharacterToken from "./characterToken";

export default class PlayerCharacterToken extends CharacterToken {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'empty-tile')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.body.setCircle(10, 10, 12);

    this.stateObject = globalState.playerCharacter;
  }
}
