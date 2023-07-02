import { COLUMNS_PER_TILESET, getTileIndex } from './constants';

// Ground tiles
export const EMPTY = getTileIndex(0, 32);
export const DCR_L = getTileIndex(0, 37);
export const DCR_M = getTileIndex(0, 38);
export const DCR_R = getTileIndex(0, 39);

// Wall tiles
// Wall top parts, empty
export const W_LTE = getTileIndex(0, 1);
export const W_MTE = getTileIndex(0, 2);
export const W_RTE = getTileIndex(0, 3);

// Wall bottom parts, empty
export const W_LBE = getTileIndex(1, 1);
export const W_MBE = getTileIndex(1, 2);
export const W_RBE = getTileIndex(1, 3);

// Wall parts with decoration
export const W_LTD = getTileIndex(0, 7);
export const W_LBD = getTileIndex(1, 7);
export const W_MTD = getTileIndex(0, 8);
export const W_MBD = getTileIndex(1, 8);
export const W_RTD = getTileIndex(0, 9);
export const W_RBD = getTileIndex(1, 9);

// Borders
export const B_LFT = getTileIndex(4, 2);
export const B_RGT = getTileIndex(4, 0);
export const B_TOP = getTileIndex(5, 1);
export const B_BOT = getTileIndex(3, 1);

// Inner corners
export const IC_BR = getTileIndex(3, 3);
export const IC_BL = getTileIndex(3, 4);
export const IC_TR = getTileIndex(4, 3);
export const IC_TL = getTileIndex(4, 4);

// Outer corners
export const OC_TL = getTileIndex(5, 2);
export const OC_TR = getTileIndex(5, 0);
export const OC_BL = getTileIndex(3, 2);
export const OC_BR = getTileIndex(3, 0);

export const updateAnimatedTile: (tile: Phaser.Tilemaps.Tile | undefined) => void = (tile) => {
	if (tile) {
		const tileThousands = Math.floor(tile.index / 1000);
		const modTileIndex = tile.index % 1000;

		const tileRowNumber = Math.floor(modTileIndex / COLUMNS_PER_TILESET);
		const tileColumnNumber = modTileIndex % COLUMNS_PER_TILESET;

		if (tileColumnNumber === 40) {
			tile.index = tileRowNumber * COLUMNS_PER_TILESET + tileThousands * 1000 + 41;
		} else if (tileColumnNumber === 41) {
			tile.index = tileRowNumber * COLUMNS_PER_TILESET + tileThousands * 1000 + 42;
		} else if (tileColumnNumber === 42) {
			tile.index = tileRowNumber * COLUMNS_PER_TILESET + tileThousands * 1000 + 43;
		} else if (tileColumnNumber === 43) {
			tile.index = tileRowNumber * COLUMNS_PER_TILESET + tileThousands * 1000 + 40;
		}
	}
};
