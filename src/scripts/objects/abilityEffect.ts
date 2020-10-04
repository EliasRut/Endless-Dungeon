import { Facings } from "../helpers/constants";

export default class AbilityEffect extends Phaser.Physics.Arcade.Sprite {
    destroyed = false;
    constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings) {
      super(scene, x, y, spriteName);
    }

    destroy() {
      this.destroyed = true;
      super.destroy();
    }
  }