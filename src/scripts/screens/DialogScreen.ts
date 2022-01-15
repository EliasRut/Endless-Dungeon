import { UiDepths } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';

export default class DialogScreen extends OverlayScreen {
	// dialogText: Phaser.GameObjects.BitmapText;
	dialogText: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, 40, 300, 570, 100);

		// this.dialogText = new Phaser.GameObjects.BitmapText(
		// 	scene, 24, 308, 'pixelfont', '', 12);
		this.dialogText = new Phaser.GameObjects.Text(scene, 24, 286, '', {
			fontFamily: 'endlessDungeon',
			fontSize: '20px',
			color: '#000',
		});
		this.dialogText.setResolution(32);
		this.dialogText.setOrigin(0, 0);
		this.dialogText.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.dialogText.setScrollFactor(0);
		this.add(this.dialogText, true);
		// tslint:enable

		scene.add.existing(this);
		this.setVisible(false);
	}

	setText(text: string) {
		this.dialogText.setText(text);
	}
}
