import MainScene from '../../scenes/MainScene';
import MenuIcon from './MenuIcon';

export default class BackpackIcon extends MenuIcon {
	constructor(scene: MainScene) {
		// tslint:disable-next-line: no-magic-numbers
		super(scene, scene.cameras.main.width - 32, 53, 'icon-backpack');
	}

	setScreens() {
		if (!this.screens) {
			this.screens = [
				this.scene.overlayScreens.inventory,
				this.scene.overlayScreens.itemScreen,
				this.scene.overlayScreens.statScreen,
			];
		}
	}
}
