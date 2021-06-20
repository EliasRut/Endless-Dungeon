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
		this.on('pointerdown', () => this.openSetting());

		scene.add.existing(this);
	}
	openSetting(){
		if (this.scene.isPaused) {
			this.scene.physics.resume();
			this.scene.time.paused = false;
		} else {
			this.scene.physics.pause();
			this.scene.time.paused = true;
		}
		this.scene.isPaused = !this.scene.isPaused;

		Object.values(this.scene.icons)
			.filter(e => e.name !== this.name)
			.forEach(value => value.setScreenVisibility(false)
		);

		this.scene.overlayScreens.settingsScreen.toggleVisible();
	}

	setScreenVisibility(visible: boolean): void {
		this.scene.overlayScreens.settingsScreen.setVisible(visible);
	}
}
