import { UI_SCALE } from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import MenuIcon from './MenuIcon';

export default class SettingsIcon extends MenuIcon {
	constructor(scene: MainScene) {
		// tslint:disable-next-line: no-magic-numbers
		super(scene, scene.cameras.main.width - 32 * UI_SCALE, 157 * UI_SCALE, 'icon-settings');
	}

	setScreens() {
		if (!this.screens) {
			this.screens = [
				this.scene.overlayScreens!.contentManagementScreen,
				this.scene.overlayScreens!.settingsScreen,
			];
		}
	}
}
