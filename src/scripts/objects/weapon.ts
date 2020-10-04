import { ENGINE_METHOD_PKEY_ASN1_METHS } from "constants";
import { World } from "matter";
import { Physics } from "phaser";
import Item from "../worldstate/Item";
import ItemToken from "./itemToken";
import Player from "../worldstate/PlayerCharacter"

export default class Weapon extends ItemToken {
  constructor(scene: Phaser.Scene, x: number, y: number, icon: number) {
    super(scene, x, y, icon);
    this.stateObject = new Item(
      Math.random() * 100,
      Math.random() + 1,
      Math.random() * 100,
      Math.random() + 1
    );
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // this.body.setCircle(10, 10, 12);
  }
  destroy() {
    super.destroy();
  }
}
