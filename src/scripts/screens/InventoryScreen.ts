import { UI_DEPTHS } from '../helpers/uiDepths';
import OverlayScreen from './OverlayScreen';

export default class InventoryScreen extends OverlayScreen {
	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, 290, 120, 320, 220);
		const inventoryField = new Phaser.GameObjects.Image(scene, 414, 198, 'inventory-borders');
		inventoryField.setDepth(UI_DEPTHS.UI_BACKGROUND_LAYER);
		inventoryField.setScrollFactor(0);
		this.add(inventoryField, true);
		// tslint:enable

		scene.add.existing(this);
		this.setVisible(false);
	}
}