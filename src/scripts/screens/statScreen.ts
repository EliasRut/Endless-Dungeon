import OverlayScreen from "./overlayScreen";

export default class StatScreen extends OverlayScreen {
  constructor(scene: Phaser.Scene) {
    super(scene, 64, 80, 200, 220);

    const header = new Phaser.GameObjects.Text(scene, 96, 64, "Statistics", {
      fontFamily: 'Arial', fontSize: '16px', color: '#333'
    });
    header.setOrigin(0);
    header.setDepth(5);
    this.add(header, true);

    const labelHealth = new Phaser.GameObjects.Text(scene, 54, 90, "Health", {
      fontFamily: 'Arial', fontSize: '14px', color: '#333'
    });
    labelHealth.setDepth(5);
    this.add(labelHealth, true);
  }
}