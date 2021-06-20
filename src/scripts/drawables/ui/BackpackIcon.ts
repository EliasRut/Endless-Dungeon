import { UiDepths } from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import { Icons } from './Icons';

const ICON = 'icon-backpack';
export default class BackpackIcon extends Phaser.GameObjects.Image implements Icons {
	scene: MainScene;
	icon: string;
	constructor(scene: MainScene) {
		// tslint:disable-next-line: no-magic-numbers
		super(scene, scene.cameras.main.width - 32, 53, ICON);
		this.scene = scene;
		this.name = ICON;
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

		Object.values(this.scene.icons)
			.filter(e => e.name !== this.name)
			.forEach(value => value.setScreenVisibility(false)
		);

		this.scene.isPaused = !this.scene.isPaused;
		this.scene.overlayScreens.inventory.toggleVisible();
		this.scene.overlayScreens.itemScreen.toggleVisible();
		this.scene.overlayScreens.statScreen.toggleVisible();
	}

	setScreenVisibility(visible: boolean): void {
		this.scene.overlayScreens.inventory.setVisible(visible);
		this.scene.overlayScreens.itemScreen.setVisible(visible);
		this.scene.overlayScreens.statScreen.setVisible(visible);
	}
}