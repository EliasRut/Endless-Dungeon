import Item from "../worldstate/Item"
import MainScene from "../scenes/mainScene";
import globalState from "../worldstate";

export default class ItemToken extends Phaser.Physics.Arcade.Sprite {
  stateObject: Item;
  public itemLocation = 0; //0 is ground, 1-80 are inventory slots, 80+ are equipped

  constructor(scene: Phaser.Scene, x: number, y: number, icon: number) {
    super(scene, x, y, 'test-items-spritesheet', icon);
    scene.add.existing(this);
  }

  public update(scene: MainScene) {
    if (this.itemLocation === 0) {
      const px = scene.mainCharacter.x;
      const py = scene.mainCharacter.y;
      const distance = Math.hypot(this.x - px, this.y - py);
      //if you run over item, put into inventory
      if (distance < 30) {
        if (globalState.inventory.sortIntoInventory(this)) {          
          scene.overlayScreens.inventory.add(this, false);
          this.setVisible(false);
          this.setDepth(7);
          this.setScrollFactor(0);
          this.setInteractive();
          this.on('pointerdown', () => {
            if(this.itemLocation > 0 && this.itemLocation < 81){
              globalState.inventory.equip(this);
            } else if(this.itemLocation > 80){
              globalState.inventory.unequip(this);
            }
          })
        }
      }
    }
  }

  destroy() {    
    super.destroy(true);
  }
}