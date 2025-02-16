import { UiDepths, UI_SCALE } from '../helpers/constants';

export default class OverlayScreen extends Phaser.GameObjects.Group {
	visibility: boolean = false;

	constructor(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number) {
		super(scene);

		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);

		const leftBorderX = startX;
		const topBorderY = startY;
		const screenWidth = width;
		const screenHeight = height;
		const tileSize = 64;
		const rightBorderX = leftBorderX + screenWidth - tileSize * UI_SCALE;
		const bottomBorderY = topBorderY + screenHeight - tileSize * UI_SCALE;
		const middlePieceX = leftBorderX + tileSize;
		const middlePieceY = topBorderY + tileSize;
		const xStretchFactor = (screenWidth - 2 * tileSize) / tileSize;
		const yStretchFactor = (screenHeight - 2 * tileSize) / tileSize;

		// tslint:disable: no-magic-numbers
		const topLeftCorner = new Phaser.GameObjects.Image(
			scene,
			leftBorderX,
			topBorderY,
			'screen-background',
			0
		);
		const topRightCorner = new Phaser.GameObjects.Image(
			scene,
			rightBorderX,
			topBorderY,
			'screen-background',
			2
		);
		const bottomLeftCorner = new Phaser.GameObjects.Image(
			scene,
			leftBorderX,
			bottomBorderY,
			'screen-background',
			6
		);
		const bottomRightCorner = new Phaser.GameObjects.Image(
			scene,
			rightBorderX,
			bottomBorderY,
			'screen-background',
			8
		);
		topLeftCorner.setScale(UI_SCALE);
		topRightCorner.setScale(UI_SCALE);
		bottomLeftCorner.setScale(UI_SCALE);
		bottomRightCorner.setScale(UI_SCALE);

		const topBorder = new Phaser.GameObjects.Image(
			scene,
			middlePieceX,
			topBorderY,
			'screen-background',
			1
		);
		topBorder.scaleY = UI_SCALE;
		topBorder.scaleX = xStretchFactor;
		const bottomBorder = new Phaser.GameObjects.Image(
			scene,
			middlePieceX,
			bottomBorderY,
			'screen-background',
			7
		);
		bottomBorder.scaleY = UI_SCALE;
		bottomBorder.scaleX = xStretchFactor;

		const leftBorder = new Phaser.GameObjects.Image(
			scene,
			leftBorderX,
			middlePieceY,
			'screen-background',
			3
		);
		leftBorder.scaleX = UI_SCALE;
		leftBorder.scaleY = yStretchFactor;
		const rightBorder = new Phaser.GameObjects.Image(
			scene,
			rightBorderX,
			middlePieceY,
			'screen-background',
			5
		);
		rightBorder.scaleX = UI_SCALE;
		rightBorder.scaleY = yStretchFactor;

		const centerPiece = new Phaser.GameObjects.Image(
			scene,
			middlePieceX,
			middlePieceY,
			'screen-background',
			4
		);
		centerPiece.scaleX = xStretchFactor;
		centerPiece.scaleY = yStretchFactor;
		// tslint:enable

		const pieces = [
			topLeftCorner,
			topRightCorner,
			bottomLeftCorner,
			bottomRightCorner,
			topBorder,
			bottomBorder,
			leftBorder,
			rightBorder,
			centerPiece,
		];
		pieces.forEach((piece) => {
			piece.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			piece.setScrollFactor(0);
			piece.setOrigin(0);
		});
		this.addMultiple(pieces, true);
	}

	toggleVisibility() {
		this.toggleVisible();
		this.visibility = !this.visibility;
	}

	update() {}

	// sets a screen modifier: For the duration of this opening, its behaviour is somehow modified.
	modify(modifier?: any) {}
}
