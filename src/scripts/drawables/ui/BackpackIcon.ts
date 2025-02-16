import { UI_SCALE } from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import MenuIcon from './MenuIcon';

export default class BackpackIcon extends MenuIcon {
	constructor(scene: MainScene) {
		// tslint:disable-next-line: no-magic-numbers
		super(scene, scene.cameras.main.width - 32 * UI_SCALE, 53 * UI_SCALE, 'icon-backpack');
	}

	setScreens() {
		if (!this.screens) {
			this.screens = [
				this.scene.overlayScreens!.itemScreen,
				this.scene.overlayScreens!.statScreen,
				this.scene.overlayScreens!.inventory,
			];
		}
	}
}
