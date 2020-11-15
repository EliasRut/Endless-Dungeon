// This class handles the items.
import PlayerCharacter from '../worldstate/PlayerCharacter';

export interface ItemStats {
  maxHealth?: number;
  damage?: number;
  movementSpeed?: number;
  mainStat?: number;
}

export default class Item implements ItemStats {
    public maxHealth = 10;
    public damage = 1;
    public movementSpeed = 0;
    public mainStat = 1;

    public iconFrame = 0;

    constructor(
        maxHealth: number,
        damage: number,
        movementSpeed: number,
        mainStat: number,
        iconFrame: number
      ) {
      this.maxHealth = maxHealth;
      this.damage = damage;
      this.movementSpeed = movementSpeed;
      this.mainStat = mainStat;
      this.iconFrame = iconFrame;
    }
    public equip(player: PlayerCharacter) {
      console.log(`Equipping item ${JSON.stringify(this)}.`);
      player.items.push(this);
      player.updateStats();
    }

    public unequip(player: PlayerCharacter){
      console.log(`Unequipping item ${JSON.stringify(this)}.`);
      const itemIndex = player.items.findIndex((item) => item === this);
      if (itemIndex > -1) {
        player.items.splice(itemIndex, 1);
        player.updateStats();
      }
    }
  };