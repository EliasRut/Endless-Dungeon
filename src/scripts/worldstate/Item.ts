// This class handles the items.
import PlayerCharacter from '../worldstate/PlayerCharacter';
export default class Item extends Phaser.Physics.Arcade.Sprite{
    public itemHealth = 10;
    public weaponDamage = 1;
    public itemMovementspeed = 0;
    public mainStat = 1;

    public equip(player: PlayerCharacter){
        player.itemHealth = this.itemHealth;
        player.weaponDamage = this.weaponDamage;
        player.itemMovementSpeed = this.itemMovementspeed;
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