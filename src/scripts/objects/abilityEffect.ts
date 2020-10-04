import { Facings } from "../helpers/constants";
import { getRotationInRadiansForFacing, getVelocitiesForFacing } from "../helpers/orientation";

export default class AbilityEffect extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings) {
      super(scene, x, y, 'ice');
    }
  }