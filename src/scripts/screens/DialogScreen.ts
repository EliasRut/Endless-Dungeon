import { UiDepths, UI_SCALE } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';

export default class DialogScreen extends OverlayScreen {
	// dialogText: Phaser.GameObjects.BitmapText;
	dialogText: Phaser.GameObjects.Text;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(
			scene,
			40 * UI_SCALE,
			window.innerHeight - 104 * UI_SCALE,
			window.innerWidth - 80 * UI_SCALE,
			80 * UI_SCALE
		);

		// this.dialogText = new Phaser.GameObjects.BitmapText(
		// 	scene, 24, 308, 'pixelfont', '', 12);
		this.dialogText = new Phaser.GameObjects.Text(
			scene,
			56 * UI_SCALE,
			window.innerHeight - 92 * UI_SCALE,
			'',
			{
				fontFamily: 'endlessDungeon',
				fontSize: `${12 * UI_SCALE}pt`,
				color: 'white',
				wordWrap: { width: (window.innerWidth - 112) * UI_SCALE, useAdvancedWrap: true },
			}
		);
		this.dialogText.setOrigin(0);
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
