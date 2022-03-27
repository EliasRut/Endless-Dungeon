import MainScene from '../../scenes/MainScene';

export default class InventoryItemToken extends Phaser.GameObjects.Sprite {
	constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
		super(
			scene,
			x,
			y,
			frame === -1 ? 'empty-tile' : 'test-items-spritesheet',
			frame === -1 ? 0 : frame
		);
	}
}
