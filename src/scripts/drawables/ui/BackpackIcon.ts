import { UiDepths } from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';

export default class BackpackIcon extends Phaser.GameObjects.Image {
	constructor(scene: MainScene) {
		// tslint:disable-next-line: no-magic-numbers
		super(scene, scene.cameras.main.width - 32, 53, 'icon-backpack');

		this.setScrollFactor(0);
		this.setInteractive();
		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.on('pointerdown', () => {
			if (scene.isPaused) {
				scene.physics.resume();
				scene.time.paused = false;
			} else {
				scene.physics.pause();
				scene.time.paused = true;
			}
			scene.isPaused = !scene.isPaused;
			scene.overlayScreens.inventory.toggleVisible();
			scene.overlayScreens.itemScreen.toggleVisible();
			scene.overlayScreens.statScreen.toggleVisible();
		});

		scene.add.existing(this);
	}
}