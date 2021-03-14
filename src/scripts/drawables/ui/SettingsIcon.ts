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
			if (scene.isPaused) {
				scene.physics.resume();
				scene.time.paused = false;
			} else {
				scene.physics.pause();
				scene.time.paused = true;
			}
			scene.isPaused = !scene.isPaused;
			// scene.overlayScreens.settingsScreen.save();
			scene.overlayScreens.settingsScreen.toggleVisible();
		});

		scene.add.existing(this);
	}

	// public update() {
	// 	const xPos = Math.round(globalState.playerCharacter.x / BLOCK_SIZE / TILE_WIDTH);
	// 	const yPos = Math.round(globalState.playerCharacter.y / BLOCK_SIZE / TILE_HEIGHT);
	// 	this.setText(`fps: ${Math.floor(this.scene.game.loop.actualFps)}. ` +
	// 		`Pos y${yPos}, x${xPos}.`);
	// }
}
