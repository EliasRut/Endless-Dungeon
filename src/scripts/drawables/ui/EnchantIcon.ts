import { UI_SCALE } from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import MenuIcon from './MenuIcon';

export default class EnchantIcon extends MenuIcon {
	constructor(scene: MainScene) {
		// tslint:disable-next-line: no-magic-numbers
		super(scene, scene.cameras.main.width - 32 * UI_SCALE, 208 * UI_SCALE, 'icon-enchantments');
	}

	setScreens() {
		if (!this.screens) {
			this.screens = [this.scene.overlayScreens.enchantingScreen];
		}
	}
}
