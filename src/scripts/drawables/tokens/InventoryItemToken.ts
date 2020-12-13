import MainScene from '../../scenes/MainScene';

export default class InventoryItemToken extends Phaser.GameObjects.Image {
	constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
		super(scene, x, y, 'test-items-spritesheet', frame);
	}
}