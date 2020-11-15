import OverlayScreen from "./overlayScreen";

export default class InventoryScreen extends OverlayScreen {
  constructor(scene: Phaser.Scene) {
    super(scene, 290, 120, 320, 220);    
    const inventoryField = new Phaser.GameObjects.Image(scene, 414, 198, 'inventory-borders');
    inventoryField.setDepth(6);
    inventoryField.setScrollFactor(0);
    this.add(inventoryField, true);
  }
}