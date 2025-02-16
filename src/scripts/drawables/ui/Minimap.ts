import worldstate from '../../worldState';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import MainScene from '../../scenes/MainScene';
import { UiDepths, UI_SCALE } from '../../helpers/constants';

import {
	EMPTY,
	DCR_L,
	DCR_M,
	DCR_R,
	W_LTE,
	W_MTE,
	W_RTE,
	W_LBE,
	W_MBE,
	W_RBE,
	W_LTD,
	W_LBD,
	W_MTD,
	W_MBD,
	W_RTD,
	W_RBD,
	B_LFT,
	B_RGT,
	B_TOP,
	B_BOT,
	IC_BR,
	IC_BL,
	IC_TR,
	IC_TL,
	OC_TL,
	OC_TR,
	OC_BL,
	OC_BR,
} from '../../helpers/cells';

const X_POSITION = 10;
const Y_POSITION = 160;

const isTileVisible = (tile: Phaser.Tilemaps.Tile) => {
	// tslint:disable-next-line: no-magic-numbers
	return tile && tile.tint > 0x010101 && tile.index % 1000 > -1;
};

export default class Minimap extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_POSITION * UI_SCALE, Y_POSITION * UI_SCALE, '', {
			color: 'white',
			fontSize: `${4 * UI_SCALE}pt`,
			fontStyle: 'bold',
		});
		this.setLineSpacing(-1 * UI_SCALE);
		this.setScrollFactor(0);
		scene.add.existing(this);
		this.setOrigin(0);
		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
	}

	public update() {
		const xPos = Math.floor(worldstate.playerCharacter.x / BLOCK_SIZE / TILE_WIDTH);
		const yPos = Math.floor(worldstate.playerCharacter.y / BLOCK_SIZE / TILE_HEIGHT);
		const xxPos = xPos * BLOCK_SIZE;
		const yyPos = yPos * BLOCK_SIZE;

		const layout = worldstate.dungeon.levels[worldstate.currentLevel].layout;
		const width = layout[0].length;
		const height = layout.length;

		const yDown = yyPos - 3 * TILE_HEIGHT;
		const yUp = yyPos + 3 * TILE_HEIGHT;
		const xLeft = xxPos - 3 * TILE_WIDTH;
		const xRight = xxPos + 3 * TILE_WIDTH;

		let map = '';

		let marker: string = ' X ';

		let firstRow: string = '';
		let secondRow: string = '';
		let thirdRow: string = '';

		const mainScene = this.scene as MainScene;
		if (!mainScene?.tileLayer) {
			return;
		}

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
				} else if (topLeftTile.index % 1000 === IC_TL) {
					marker = '┌';
				} else if (topLeftTile.index % 1000 === OC_TL) {
					marker = '┘';
				} else if (topLeftTile.index % 1000 === B_TOP) {
					marker = '─';
				} else if (topLeftTile.index % 1000 === B_LFT) {
					marker = '│';
				} else {
					marker = ' ';
				}

				if (!isTileVisible(topMiddleTile)) {
					marker += ' ';
				} else if (topMiddleTile.index % 1000 === B_TOP) {
					marker += '─';
				} else {
					marker += ' ';
				}

				if (!isTileVisible(topRightTile)) {
					marker += ' ';
				} else if (topRightTile.index % 1000 === IC_TR) {
					marker += '┐';
				} else if (topRightTile.index % 1000 === OC_TR) {
					marker += '└';
				} else if (topRightTile.index % 1000 === B_TOP) {
					marker += '─';
				} else if (topRightTile.index % 1000 === B_RGT) {
					marker += '│';
				} else {
					marker += ' ';
				}
				firstRow += marker;

				const middleLeftTile = mainScene.tileLayer.getTileAt(x, y + 4);
				const middleMiddleTile = mainScene.tileLayer.getTileAt(x + 4, y + 4);
				const middleRightTile = mainScene.tileLayer.getTileAt(x + 7, y + 4);

				if (!isTileVisible(middleLeftTile)) {
					marker = ' ';
				} else if (middleLeftTile.index % 1000 === B_LFT) {
					marker = '│';
				} else {
					marker = ' ';
				}

				if (!isTileVisible(middleMiddleTile)) {
					marker += ' ';
				} else if (y === yyPos && x === xxPos) {
					marker += 'o';
				} else if (middleMiddleTile.index % 1000 !== -1) {
					marker += ' ';
				} else {
					marker += ' ';
				}

				if (!isTileVisible(middleRightTile)) {
					marker += ' ';
				} else if (middleRightTile.index % 1000 === B_RGT) {
					marker += '│';
				} else {
					marker += ' ';
				}
				secondRow += marker;

				const bottomLeftTile = mainScene.tileLayer.getTileAt(x, y + 7);
				const bottomMiddleTile = mainScene.tileLayer.getTileAt(x + 4, y + 7);
				const bottomRightTile = mainScene.tileLayer.getTileAt(x + 7, y + 7);

				if (!isTileVisible(bottomLeftTile)) {
					marker = ' ';
				} else if (bottomLeftTile.index % 1000 === IC_BL) {
					marker = '└';
				} else if (bottomLeftTile.index % 1000 === OC_BL) {
					marker = '┐';
				} else if (bottomLeftTile.index % 1000 === B_LFT) {
					marker = '│';
				} else if (bottomLeftTile.index % 1000 === B_BOT) {
					marker = '─';
				} else {
					marker = ' ';
				}

				if (!isTileVisible(bottomMiddleTile)) {
					marker += ' ';
				} else if (bottomMiddleTile.index % 1000 === B_BOT) {
					marker += '─';
				} else {
					marker += ' ';
				}

				if (!isTileVisible(bottomRightTile)) {
					marker += ' ';
				} else if (bottomRightTile.index % 1000 === OC_BR) {
					marker += '┌';
				} else if (bottomRightTile.index % 1000 === IC_BR) {
					marker += '┘';
				} else if (bottomRightTile.index % 1000 === B_BOT) {
					marker += '─';
				} else if (bottomRightTile.index % 1000 === B_RGT) {
					marker += '│';
				} else {
					marker += ' ';
				}
				thirdRow += marker;
			}
			map += `${firstRow}\n${secondRow}\n${thirdRow}\n`;
		}
		// tslint:enable: no-magic-numbers
		this.setText(map);
	}
}
