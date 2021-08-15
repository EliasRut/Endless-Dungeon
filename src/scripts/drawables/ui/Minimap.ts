import globalState from '../../worldstate/index';
import {
	BLOCK_SIZE,
	TILE_WIDTH,
	TILE_HEIGHT
} from '../../helpers/generateDungeon';
import MainScene from '../../scenes/MainScene';

const X_POSITION = 10;
const Y_POSITION = 180;

const isTileVisible = (tile: Phaser.Tilemaps.Tile) => {
	// tslint:disable-next-line: no-magic-numbers
	return tile && tile.tint > 0x010101 && tile.index % 1000 > -1;
};

export default class Minimap extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_POSITION, Y_POSITION, '', {
			color: 'white',
			fontSize: '5px'
		});
		this.setScrollFactor(0);
		if (globalState.currentLevel.startsWith('dungeonLevel')) {
			scene.add.existing(this);
			this.setOrigin(0);
		}
	}

	public update() {
		const xPos = Math.floor(globalState.playerCharacter.x / BLOCK_SIZE / TILE_WIDTH);
		const yPos = Math.floor(globalState.playerCharacter.y / BLOCK_SIZE / TILE_HEIGHT);
		const xxPos = xPos * BLOCK_SIZE;
		const yyPos = yPos * BLOCK_SIZE;
		// if(globalState.dg) {

			// const gen = globalState.dg;
			// const levelData = globalState.roomAssignment[globalState.currentLevel];
			// const rooms = levelData.rooms;
			const layout = globalState.dungeon.levels[globalState.currentLevel].layout;
			const width = layout[0].length;
			const height = layout.length;

			const yDown = 	(yyPos - 3*TILE_HEIGHT);
			const yUp = 	(yyPos + 3*TILE_HEIGHT);
			const xLeft = 	(xxPos - 3*TILE_WIDTH);
			const xRight = 	(xxPos + 3*TILE_WIDTH);

			// const yDown = 0;
			// const yUp = height;
			// const xLeft = 0;
			// const xRight = width;

			let map = '';

			let marker: string = ' X ';

			let firstRow: string = '';
			let secondRow: string = '';
			let thirdRow: string = '';

			const mainScene = this.scene as MainScene;

			for (let y = Math.max(0, yDown); y < Math.min(height, yUp); y += BLOCK_SIZE) {
				firstRow = '';
				secondRow = '';
				thirdRow = '';
				for (let x = Math.max(0, xLeft); x < Math.min(width, xRight); x += BLOCK_SIZE) {

					// tslint:disable: no-magic-numbers
					const topLeftTile = mainScene.tileLayer.getTileAt(x, y);
					const topMiddleTile = mainScene.tileLayer.getTileAt(x + 4, y);
					const topRightTile = mainScene.tileLayer.getTileAt(x + 7, y);

					if (!isTileVisible(topLeftTile)) {
						marker = ' ';
					} else if (topLeftTile.index % 1000 === 164) {
						marker = '┌';
					} else if (topLeftTile.index % 1000 === 202) {
						marker = '┘';
					} else if (topLeftTile.index % 1000 === 201) {
						marker = '─';
					} else if (topLeftTile.index % 1000 === 162) {
						marker = '|';
					} else {
						marker = ' ';
					}

					if (!isTileVisible(topMiddleTile)) {
						marker += ' ';
					} else if (topMiddleTile.index % 1000 === 201) {
						marker += '─';
					} else {
						marker += ' ';
					}

					if (!isTileVisible(topRightTile)) {
						marker += ' ';
					} else if (topRightTile.index % 1000 === 163) {
						marker += '┐';
					} else if (topRightTile.index % 1000 === 200) {
						marker += '└';
					} else if (topRightTile.index % 1000 === 201) {
						marker += '─';
					} else if (topRightTile.index % 1000 === 160) {
						marker += '|';
					} else {
						marker += ' ';
					}
					firstRow += marker;

					const middleLeftTile = mainScene.tileLayer.getTileAt(x, y + 4);
					const middleMiddleTile = mainScene.tileLayer.getTileAt(x + 4, y + 4);
					const middleRightTile = mainScene.tileLayer.getTileAt(x + 7, y + 4);

					if (!isTileVisible(middleLeftTile)) {
						marker = ' ';
					} else if (middleLeftTile.index % 1000 === 162) {
						marker = '|';
					} else {
						marker = ' ';
					}

					if (!isTileVisible(middleMiddleTile)) {
						marker += ' ';
					} else if (y === yyPos && x === xxPos) {
						marker += 'O';
					} else if (middleMiddleTile.index % 1000 !== -1) {
						marker += '.';
					} else {
						marker += ' ';
					}

					if (!isTileVisible(middleRightTile)) {
						marker += ' ';
					} else if (middleRightTile.index % 1000 === 160) {
						marker += '|';
					} else {
						marker += ' ';
					}
					secondRow += marker;

					const bottomLeftTile = mainScene.tileLayer.getTileAt(x, y + 7);
					const bottomMiddleTile = mainScene.tileLayer.getTileAt(x + 4, y + 7);
					const bottomRightTile = mainScene.tileLayer.getTileAt(x + 7, y + 7);

					if (!isTileVisible(bottomLeftTile)) {
						marker = ' ';
					} else if (bottomLeftTile.index % 1000 === 124) {
						marker = '└';
					} else if (bottomLeftTile.index % 1000 === 122) {
						marker = '┐';
					} else if (bottomLeftTile.index % 1000 === 162) {
						marker = '|';
					} else if (bottomLeftTile.index % 1000 === 121) {
						marker = '─';
					} else {
						marker = ' ';
					}

					if (!isTileVisible(bottomMiddleTile)) {
						marker += ' ';
					} else if (bottomMiddleTile.index % 1000 === 121) {
						marker += '─';
					} else {
						marker += ' ';
					}

					if (!isTileVisible(bottomRightTile)) {
						marker += ' ';
					} else if (bottomRightTile.index % 1000 === 120) {
						marker += '┌';
					} else if (bottomRightTile.index % 1000 === 123) {
						marker += '┘';
					} else if (bottomRightTile.index % 1000 === 121) {
						marker += '─';
					} else if (bottomRightTile.index % 1000 === 160) {
						marker += '|';
					} else {
						marker += ' ';
					}
					thirdRow += marker;
				}
				map += `${firstRow}\n${secondRow}\n${thirdRow}\n`;
			}
			// tslint:enable: no-magic-numbers
			this.setText(`${globalState.currentLevel}\n\n${map}`);
		// }
	}
}
