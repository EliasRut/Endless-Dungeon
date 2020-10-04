import { Game } from "phaser";
import Item from "../worldstate/Item"
import Player from "../worldstate/PlayerCharacter"

export default class ItemToken extends Phaser.Physics.Arcade.Sprite {
  stateObject: Item;
  constructor(scene: Phaser.Scene, x: number, y: number, icon: number) {
  super(scene, x, y, 'test-items-spritesheet', icon);
  scene.add.existing(this);
  scene.physics.add.existing(this);
  }
  public update(player: Player) {
    const px = player.x;
    const py = player.y;
    const distance = Math.sqrt((this.x - px)*(this.x - px) + (this.y - py)*(this.y - py));
    if (distance < 30){
        this.stateObject.equip(player);
        this.destroy();
    }
} 
destroy(){
  super.destroy();
}
}