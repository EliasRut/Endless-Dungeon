import globalState from '../../worldstate/index';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import { TILE_SIZE } from '../../helpers/generateRoom';

const X_POSITION = 10;
const Y_POSITION = 180;

export default class Minimap extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_POSITION, Y_POSITION, '', { color: 'white', fontSize: '10px' });
		this.setScrollFactor(0);
		scene.add.existing(this);
		this.setOrigin(0);

	}

	public update() {
		const xPos = Math.round(globalState.playerCharacter.x / BLOCK_SIZE / TILE_WIDTH);
		const yPos = Math.round(globalState.playerCharacter.y / BLOCK_SIZE / TILE_HEIGHT);
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

			for (let y = Math.max(0,yDown); y < Math.min(height,yUp); y+=BLOCK_SIZE) {
				for (let x = Math.max(0,xLeft); x < Math.min(width,xRight); x+=BLOCK_SIZE) {
					// marker = y === yyPos && x === xxPos ? ' O ' : ' X ';
					const tile = layout[y][x]
					if(y === yyPos && x === xxPos) {
						marker = ' O ';
					} else {
						marker = ' X ';
						if(tile === 32) { // todo generalize for all floor tiles
							marker = ' . ';
						}
					}
					map += tile !== -1 ? marker : '   ';
				}
				map += '\n';
			}


			//yPos: ${Math.floor(yyPos)}, xPos:  ${Math.floor(xxPos)}\n\n
			this.setText(`${globalState.currentLevel}\n\n${map}`);
		// }
	}
}
