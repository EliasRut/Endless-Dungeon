const X_OFFSET = 10;
const Y_OFFSET = 340;

export default class PositionText extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_OFFSET, Y_OFFSET, '', { color: 'white', fontSize: '14px' });
		this.setScrollFactor(0);
		scene.add.existing(this);
		this.setOrigin(0);
		this.setDepth(10);
	}

	public update(yPos: number, xPos: number) {
		this.setText(`Pos y${yPos}, x${xPos}.`);
	}
}
