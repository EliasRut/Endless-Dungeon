export const POSITION_TEXT_X_OFFSET = 10;
export const POSITION_TEXT_Y_OFFSET = 20;

export default class PositionText extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, POSITION_TEXT_X_OFFSET, scene.cameras.main.height - POSITION_TEXT_Y_OFFSET, '',
			{ color: 'white', fontSize: '14px' });
		this.setScrollFactor(0);
		scene.add.existing(this);
		this.setOrigin(0);
		this.setDepth(10);
	}

	public update(yPos: number, xPos: number) {
		this.setText(`Pos y${yPos}, x${xPos}.`);
	}
}
