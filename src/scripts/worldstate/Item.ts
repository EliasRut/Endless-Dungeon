// This class handles the items.
import PlayerCharacter from '../worldstate/PlayerCharacter';
export default class Item {
    public itemHealth = 10;
    public weaponDamage = 1;
    public itemMovementSpeed = 0;
    public mainStat = 1;

    constructor(
        itemHealth: number,
        weaponDamage: number,
        itemMovementSpeed: number,
        mainStat: number
      ) {
      this.itemHealth = itemHealth;
      this.weaponDamage = weaponDamage;
      this.itemMovementSpeed = itemMovementSpeed;
      this.mainStat = mainStat;
    }
    public equip(player: PlayerCharacter){
        player.itemHealth = this.itemHealth;
        player.weaponDamage = this.weaponDamage;
        player.itemMovementSpeed = this.itemMovementSpeed;
        player.mainStat = this.mainStat;
        player.updateStats();
    }

    public unequip(player: PlayerCharacter){
        player.itemHealth = 0;
        player.weaponDamage = 1;
        player.itemMovementSpeed = 0;
        player.mainStat = 1;
        player.updateStats();
    }
  };