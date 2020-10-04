import { Facings } from "../helpers/constants";
// This class handles the players character and all mechanical events associated with it.
export default class NPC extends Phaser.Physics.Arcade.Sprite {
    public health = 10;
    public damage = 10;
    public vision = 350;
    public movementSpeed = 35;
    public id = 0;
    public proximity = 15;

    public currentFacing: Facings = Facings.SOUTH;
    public isWalking = false;
  };