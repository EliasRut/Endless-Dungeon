import { AbilityType } from "../abilities/abilityData";
import { AbilityKey, Facings, Faction } from "../helpers/constants";
import Character from './Character';
import Item, { ItemStats } from "./Item";

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter extends Character {
  // public itemHealth = 0;
  // public weaponDamage = 1;
  // public itemMovementSpeed = 0;
  public mainStat = 1;
  public slowFactor = 1;

  public x = 0;
  public y = 0;

  public abilityCastTime = [
    -Infinity,
    -Infinity,
    -Infinity,
    -Infinity
  ];

  public items: Item[] = [];

  constructor() {
    super('player', 100, 1, 200);
    this.faction = Faction.PLAYER;
  }

  public abilityKeyMapping = {
    [AbilityKey.ONE]: AbilityType.FIREBALL,
    [AbilityKey.TWO]: AbilityType.HEALING_LIGHT,
    [AbilityKey.THREE]: AbilityType.DUSTNOVA,
    [AbilityKey.FOUR]: AbilityType.ROUND_HOUSE_KICK,
  };

  public updateStats(){
    const healthBeforeUpdate = this.health;
    const maxHealthBeforeUpdate = this.maxHealth;

    const itemStats = this.items.reduce((stats, item) => {
      Object.keys(item).forEach((key) => {
        stats[key] = (stats[key] || 0) + item[key];
      });
      return stats;
    }, {} as ItemStats);

    this.maxHealth = 100 + (itemStats.maxHealth || 0);
    this.health = healthBeforeUpdate + (this.maxHealth - maxHealthBeforeUpdate);
    this.movementSpeed = 200 + (itemStats.movementSpeed || 0);
    this.mainStat = 1 + (itemStats.mainStat || 0);
    this.damage = (1 + (itemStats.damage || 0)) * this.mainStat;
  }
};