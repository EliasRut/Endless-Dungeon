export default class OverlayScreen extends Phaser.GameObjects.Group {
  constructor(scene: Phaser.Scene, startX: number, startY: number, width: number, height: number) {
    super(scene);

    this.setDepth(3);

    const leftBorderX = startX;
    const topBorderY = startY;
    const screenWidth = width;
    const screenHeight = height;
    const tileSize = 64;
    const rightBorderX = leftBorderX + screenWidth - tileSize;
    const bottomBorderY = topBorderY + screenHeight - tileSize;
    const middlePieceX = leftBorderX + screenWidth / 2 - tileSize / 2;
    const middlePieceY = topBorderY + screenHeight / 2 - tileSize / 2;
    const xStretchFactor = (screenWidth - 2 * tileSize) / tileSize;
    const yStretchFactor = (screenHeight - 2 * tileSize) / tileSize;

    const topLeftCorner =
      new Phaser.GameObjects.Image(scene, leftBorderX, topBorderY, 'screen-background', 0);
    const topRightCorner =
      new Phaser.GameObjects.Image(scene, rightBorderX, topBorderY, 'screen-background', 2);
    const bottomLeftCorner =
      new Phaser.GameObjects.Image(scene, leftBorderX, bottomBorderY, 'screen-background', 6);
    const bottomRightCorner =
      new Phaser.GameObjects.Image(scene, rightBorderX, bottomBorderY, 'screen-background', 8);

    const topBorder =
      new Phaser.GameObjects.Image(scene, middlePieceX, topBorderY, 'screen-background', 1);
    topBorder.scaleX = xStretchFactor;
    const bottomBorder =
      new Phaser.GameObjects.Image(scene, middlePieceX, bottomBorderY, 'screen-background', 7);
    bottomBorder.scaleX = xStretchFactor;

    const leftBorder =
      new Phaser.GameObjects.Image(scene, leftBorderX, middlePieceY, 'screen-background', 3);
    leftBorder.scaleY = yStretchFactor;
    const rightBorder =
      new Phaser.GameObjects.Image(scene, rightBorderX, middlePieceY, 'screen-background', 5);
    rightBorder.scaleY = yStretchFactor;

    const centerPiece =
      new Phaser.GameObjects.Image(scene, middlePieceX, middlePieceY, 'screen-background', 4);
    centerPiece.scaleX = xStretchFactor;
    centerPiece.scaleY = yStretchFactor;

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
    pieces.forEach((piece) => piece.setDepth(3));
    this.addMultiple(pieces, true);
  }
  
  update() {}
}