import { UI_SCALE } from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import MenuIcon from './MenuIcon';

export default class QuestsIcon extends MenuIcon {
	constructor(scene: MainScene) {
		// tslint:disable-next-line: no-magic-numbers
		super(scene, scene.cameras.main.width - 32 * UI_SCALE, 105 * UI_SCALE, 'icon-quests');
	}

	setScreens() {
		if (!this.screens) {
			this.screens = [
				this.scene.overlayScreens.questLogScreen,
				this.scene.overlayScreens.questDetailsScreen,
			];
		}
	}
}
