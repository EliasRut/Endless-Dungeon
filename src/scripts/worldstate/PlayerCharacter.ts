import { Facings } from "../helpers/constants";

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter {
  public itemHealth = 0;
  public health = 100 + this.itemHealth;
  public weaponDamage = 1;
  public itemMovementSpeed = 0;
  public movementSpeed = 200 + this.itemMovementSpeed;
  public slowFactor = 1;
  public mainStat = 1;
  public damage = 1 * this.weaponDamage * this.mainStat;

  public x = 0;
  public y = 0;

  public currentFacing: Facings = Facings.SOUTH;
  public isWalking = false;

  public updateStats(){
    this.health = 100 + this.itemHealth;
    this.movementSpeed = 200 + this.itemMovementSpeed;
    this.damage = 1 * this.weaponDamage * this.mainStat;

  }
};