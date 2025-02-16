export default class InventoryItemToken extends Phaser.GameObjects.Sprite {
	constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, frame: number) {
		super(scene, x, y, spriteName, frame === -1 ? 0 : frame);
	}
}
