import OverlayScreen from "./overlayScreen";

export default class DialogScreen extends OverlayScreen {
  dialogText: Phaser.GameObjects.BitmapText;

  constructor(scene: Phaser.Scene) {
    super(scene, 40, 320, 570, 80);

    this.dialogText = new Phaser.GameObjects.BitmapText(
      scene, 24, 308, 'pixelfont', '', 12);
    this.dialogText.setOrigin(0, 0);
    this.dialogText.setDepth(5);
    this.dialogText.setScrollFactor(0);
    this.add(this.dialogText, true);

  }

  setText (text: string) {
    this.dialogText.setText(text);
  }
}