import Character from "../worldstate/Character";

export default class CharacterToken extends Phaser.Physics.Arcade.Sprite {
  stateObject: Character;
  constructor(scene: Phaser.Scene, x: number, y: number, tileName: string) {
    super(scene, x, y, tileName);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }
}
