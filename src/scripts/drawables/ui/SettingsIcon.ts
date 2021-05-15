import globalState from '../../worldstate/index';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import MainScene from '../../scenes/MainScene';
import { UiDepths } from '../../helpers/constants';

const X_POSITION = 10;
const Y_POSITION = 0;

export default class SettingsIcon extends Phaser.GameObjects.Text {
	constructor(scene: MainScene) {
		super(scene, scene.cameras.main.width - 70, 83, 'Settings', { color: 'white', fontSize: '14px' });
		this.setScrollFactor(0);
		this.setInteractive();

		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.on('pointerdown', () => {
			scene.pause();

			scene.overlayScreens.settingsScreen.toggleVisible();
		});

		scene.add.existing(this);
	}
}
