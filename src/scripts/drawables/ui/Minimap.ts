import globalState from '../../worldstate/index';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import { TILE_SIZE } from '../../helpers/generateRoom';
import { isCollidingTile } from '../../helpers/movement';

const X_POSITION = 10;
const Y_POSITION = 180;

export default class Minimap extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_POSITION, Y_POSITION, '', {
			color: 'white',
			fontSize: '5px'
		});
		this.setScrollFactor(0);
		scene.add.existing(this);
		this.setOrigin(0);

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

			for (let y = Math.max(0, yDown); y < Math.min(height, yUp); y += BLOCK_SIZE) {
				firstRow = '';
				secondRow = '';
				thirdRow = '';
				for (let x = Math.max(0, xLeft); x < Math.min(width, xRight); x += BLOCK_SIZE) {
					// marker = y === yyPos && x === xxPos ? ' O ' : ' X ';
					if (layout[y][x] % 1000 === 164) {
						marker = '┌';
					} else if (layout[y][x] % 1000 === 202) {
						marker = '┘';
					} else if (layout[y][x] % 1000 === 201) {
						marker = '─';
					} else if (layout[y][x] % 1000 === 162) {
						marker = '|';
					} else if (layout[y][x] % 1000 !== -1) {
						marker = ' ';
					} else {
						marker = ' ';
					}
					if (layout[y][x + 4] % 1000 === 201) {
						marker += '─';
					} else if (layout[y][x + 4] % 1000 !== -1) {
						marker += ' ';
					} else {
						marker += ' ';
					}
					if (layout[y][x + 7] % 1000 === 163) {
						marker += '┐';
					} else if (layout[y][x + 7] % 1000 === 200) {
						marker += '└';
					} else if (layout[y][x + 7] % 1000 === 201) {
						marker += '─';
					} else if (layout[y][x + 7] % 1000 === 160) {
						marker += '|';
					} else if (layout[y][x + 7] % 1000 !== -1) {
						marker += ' ';
					} else {
						marker += ' ';
					}
					firstRow += marker;

					if (layout[y + 4][x] % 1000 === 162) {
						marker = '|';
					} else {
						marker = ' ';
					}
					if (y === yyPos && x === xxPos) {
						marker += 'O';
					} else if (layout[y + 4][x + 4] % 1000 !== -1) {
						marker += ' ';
					} else {
						marker += '.';
					}

					if (layout[y + 4][x + 7] % 1000 === 160) {
						marker += '|';
					} else {
						marker += ' ';
					}
					secondRow += marker;

					if (layout[y + 7][x] % 1000 === 124) {
						marker = '└';
					} else if (layout[y + 7][x] % 1000 === 121) {
						marker = '┐';
					} else if (layout[y + 7][x] % 1000 === 162) {
						marker = '|';
					} else if (layout[y + 7][x] % 1000 === 121) {
						marker = '─';
					} else if (layout[y + 7][x] % 1000 !== -1) {
						marker = ' ';
					} else {
						marker = ' ';
					}
					if (layout[y + 7][x + 4] % 1000 === 121) {
						marker += '─';
					} else if (layout[y + 7][x + 4] % 1000 !== -1) {
						marker += ' ';
					} else {
						marker += ' ';
					}
					if (layout[y + 7][x + 7] % 1000 === 120) {
						marker += '┌';
					} else if (layout[y + 7][x + 7] % 1000 === 123) {
						marker += '┘';
					} else if (layout[y + 7][x + 7] % 1000 === 121) {
						marker += '─';
					} else if (layout[y + 7][x + 7] % 1000 === 160) {
						marker += '|';
					} else if (layout[y + 7][x + 7] % 1000 !== -1) {
						marker += ' ';
					} else {
						marker += ' ';
					}
					thirdRow += marker;
					// map += tile !== -1 ? marker : '   ';
				}
				map += `${firstRow}\n${secondRow}\n${thirdRow}\n`;
			}

			//yPos: ${Math.floor(yyPos)}, xPos:  ${Math.floor(xxPos)}\n\n
			this.setText(`${globalState.currentLevel}\n\n${map}`);
		// }
	}
}
