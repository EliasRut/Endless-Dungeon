import worldstate from '../../worldState';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import { SCALE, UiDepths } from '../../helpers/constants';

const X_POSITION = 4;
const Y_POSITION = 4;

export default class FpsText extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_POSITION * SCALE, Y_POSITION * SCALE, '', {
			fontFamily: 'endlessDungeon',
			color: 'white',
			fontSize: '18pt',
		});
		this.setScrollFactor(0);
		this.setDepth(UiDepths.UI_STICK_LAYER);
		scene.add.existing(this);
		this.setOrigin(0);
	}

	public update() {
		const xPos = Math.round(worldstate.playerCharacter.x / BLOCK_SIZE / TILE_WIDTH);
		const yPos = Math.round(worldstate.playerCharacter.y / BLOCK_SIZE / TILE_HEIGHT);
		this.setText(
			`fps: ${Math.floor(this.scene.game.loop.actualFps)}. ` + `Pos y${yPos}, x${xPos}.`
		);
	}
}
