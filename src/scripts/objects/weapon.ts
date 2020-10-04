import { ENGINE_METHOD_PKEY_ASN1_METHS } from "constants";
import { World } from "matter";
import { Physics } from "phaser";
export default class Weapon extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'test-items')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // this.body.setCircle(10, 10, 12);
  }
}
