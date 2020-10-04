import { Facings } from "../helpers/constants";
import Character from './Character';

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter extends Character {
  public itemHealth = 0;
  public weaponDamage = 1;
  public itemMovementSpeed = 0;
  public slowFactor = 1;
  public mainStat = 1;

  public x = 0;
  public y = 0;

  constructor() {
    super('player', 100, 1, 200);
  }

  public updateStats(){
    this.health = 100 + this.itemHealth;
    this.movementSpeed = 200 + this.itemMovementSpeed;
    this.damage = 1 * this.weaponDamage * this.mainStat;
  }
};