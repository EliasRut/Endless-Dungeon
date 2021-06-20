import { UiDepths } from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';

export default class BackpackIcon extends Phaser.GameObjects.Image {
	scene: MainScene;
	constructor(scene: MainScene) {
		// tslint:disable-next-line: no-magic-numbers
		super(scene, scene.cameras.main.width - 32, 53, 'icon-backpack');
		this.scene = scene;
		this.setScrollFactor(0);
		this.setInteractive();
		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.on('pointerdown', () => {			
			this.openBackpack();
		});

		scene.add.existing(this);
	}
	openBackpack(){
		if (this.scene.isPaused) {
			this.scene.physics.resume();
			this.scene.time.paused = false;
		} else {
			this.scene.physics.pause();
			this.scene.time.paused = true;
		}
		this.scene.isPaused = !this.scene.isPaused;
		this.scene.overlayScreens.inventory.toggleVisible();
		this.scene.overlayScreens.itemScreen.toggleVisible();
		this.scene.overlayScreens.statScreen.toggleVisible();
	}
}