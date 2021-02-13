import { UiDepths } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';

export default class DialogScreen extends OverlayScreen {
	dialogText: Phaser.GameObjects.BitmapText;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, 40, 320, 570, 80);

		this.dialogText = new Phaser.GameObjects.BitmapText(
			scene, 24, 308, 'pixelfont', '', 12);
		this.dialogText.setOrigin(0, 0);
		this.dialogText.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.dialogText.setScrollFactor(0);
		this.add(this.dialogText, true);
		// tslint:enable

		scene.add.existing(this);
		this.setVisible(false);
	}

	setText (text: string) {
		this.dialogText.setText(text);
	}
}