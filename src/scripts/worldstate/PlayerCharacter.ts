import { Facings } from "../helpers/constants";

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter {
  public health = 100;
  public damage = 10;

  public x = 0;
  public y = 0;

  public currentFacing: Facings = Facings.SOUTH;
  public isWalking = false;
};