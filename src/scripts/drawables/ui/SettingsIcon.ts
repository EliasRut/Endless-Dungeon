import globalState from '../../worldstate/index';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import MainScene from '../../scenes/MainScene';
import { UiDepths } from '../../helpers/constants';
import { Icons } from './Icons';

const ICON = 'Settings';
export default class SettingsIcon extends Phaser.GameObjects.Text implements Icons {

	scene: MainScene;

	constructor(scene: MainScene) {
		super(scene, scene.cameras.main.width - 70, 83, ICON, { color: 'white', fontSize: '14px' });
		this.scene = scene;
		this.setName(ICON);
		this.setScrollFactor(0);
		this.setInteractive();

		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.on('pointerdown', () => {
			scene.pause();

			Object.values(this.scene.icons)
				.filter(e => e.name !== this.name)
				.forEach(value => value.setScreenVisibility(false)
			);

			scene.overlayScreens.settingsScreen.toggleVisible();
		});

		scene.add.existing(this);
	}
	setScreenVisibility(visibile: boolean): void {
		this.scene.overlayScreens.settingsScreen.setVisible(visibile);
	}
}
