import OverlayScreen from "./overlayScreen";

export default class InventoryScreen extends OverlayScreen {
  constructor(scene: Phaser.Scene) {
    super(scene, 320, 80, 320, 220);
  }
}