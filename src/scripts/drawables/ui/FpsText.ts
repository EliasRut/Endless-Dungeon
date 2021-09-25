import globalState from '../../worldstate/index';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import { UiDepths } from '../../helpers/constants';

const X_POSITION = 10;
const Y_POSITION = 0;

export default class FpsText extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_POSITION, Y_POSITION, '', { color: 'white', fontSize: '14px' });
		this.setScrollFactor(0);
		this.setDepth(UiDepths.UI_STICK_LAYER);
		scene.add.existing(this);
		this.setOrigin(0);
	}

	public update() {
		const xPos = Math.round(globalState.playerCharacter.x / BLOCK_SIZE / TILE_WIDTH);
		const yPos = Math.round(globalState.playerCharacter.y / BLOCK_SIZE / TILE_HEIGHT);
		this.setText(`fps: ${Math.floor(this.scene.game.loop.actualFps)}. ` +
			`Pos y${yPos}, x${xPos}.`);
	}
}
