import { Game } from "phaser";
import Item from "../worldstate/Item"
import Player from "../worldstate/PlayerCharacter"

export default class ItemToken extends Item {
  constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y, 'enemy')
  scene.add.existing(this)
  scene.physics.add.existing(this)
  this.itemHealth = 100;
    this.weaponDamage = 2;
    this.mainStat = 2;
    this.itemMovementspeed = 100;
  }
  public update(player: Player) {
    const px = player.x;
    const py = player.y;
    const distance = Math.sqrt((this.x - px)*(this.x - px) + (this.y - py)*(this.y - py));
    if (distance < 30){
        this.equip(player);
        this.destroy();
    }
}
}