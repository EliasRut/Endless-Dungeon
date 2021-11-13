import globalState from '../worldstate';
import { DEFAULT_TILE_TINT, VISITED_TILE_TINT } from './constants';
import { GID_MULTIPLE, TILE_HEIGHT, TILE_WIDTH } from './generateDungeon';
import { isCollidingTile } from './movement';

const sightRadius = 14;
const lightRadius = 10;

const TEN_SECONDS_IN_FRAMES = 600;
const LIGHTRAY_PRECISION = 10000;

const lightPassingTileIds = [
	1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
	53, 54, 84, 85, 86, 90, 91, 92,
];

export default class DynamicLightingHelper {
	lightingLevels: number[][] = [];
	tileLayer: Phaser.Tilemaps.TilemapLayer;
	decorationLayer: Phaser.Tilemaps.TilemapLayer;
	overlayLayer: Phaser.Tilemaps.TilemapLayer;
	lastLightLevel: number = 255;

	isBlockingTile: boolean[][] = [];
	updatedTiles: [number, number][] = [];
	visitedTiles: number[][] = [];
	visibleTiles: boolean[][] = [];

	constructor(
		tileLayer: Phaser.Tilemaps.TilemapLayer,
		decorationLayer: Phaser.Tilemaps.TilemapLayer,
		overlayLayer: Phaser.Tilemaps.TilemapLayer
	) {
		this.tileLayer = tileLayer;
		this.decorationLayer = decorationLayer;
		this.overlayLayer = overlayLayer;
		this.prepareDynamicLighting();
	}

	getCurrentLevel() {
		return globalState.roomAssignment[globalState.currentLevel];
	}

	prepareDynamicLighting() {
		const { width, height } = this.getCurrentLevel();
		const dungeonWidth = width * TILE_WIDTH;
		const dungeonHeight = height * TILE_HEIGHT;
		this.tileLayer.forEachTile((tile) => (tile.tint = 0x000000));
		this.decorationLayer.forEachTile((tile) => (tile.tint = 0x000000));
		this.overlayLayer.forEachTile((tile) => (tile.tint = 0x000000));
		for (let x = 0; x < dungeonWidth; x++) {
			this.isBlockingTile[x] = [];
			this.visitedTiles[x] = [];
			for (let y = 0; y < dungeonHeight; y++) {
				this.visitedTiles[x][y] = 0;
				const tile = this.tileLayer.getTileAt(x, y);
				if (!tile) {
					this.isBlockingTile[x][y] = true;
				} else {
					const tileIdNormalized = tile.index % GID_MULTIPLE;
					// tslint:disable: no-magic-numbers
					this.isBlockingTile[x][y] =
						isCollidingTile(tile.index) && !lightPassingTileIds.includes(tileIdNormalized);
					// tileIdNormalized < 15 || (tileIdNormalized >= 45 && tileIdNormalized < 60);
					// tslint:enable: no-magic-numbers
				}
			}
		}

		const maxLightDistance = lightRadius * TILE_HEIGHT;
		for (let x = 0; x < (sightRadius + 2) * TILE_HEIGHT; x++) {
			this.lightingLevels[x] = [];
			for (let y = 0; y < (sightRadius + 2) * TILE_HEIGHT; y++) {
				// Good old pythagoras for getting actual distance to the tile
				const distance = Math.hypot(x, y);
				// This will be a factor between 0 and 1
				const distanceNormalized = Math.max(0, maxLightDistance - distance) / maxLightDistance;
				// We multiply by 300 to have a bit larger well-lit radius
				// We substract 1 to allow our adding of 0x010101 later on, which will indicate that the
				// field is currently visible. That's a hack, but it works :P
				// tslint:disable: no-magic-numbers
				const d = Math.min(255 - 1, Math.round(distanceNormalized * 300));
				// This will give us a hex value of 0xdddddd, so a greyscale lighting factor
				this.lightingLevels[x][y] = 0x010000 * d + 0x000100 * d + 0x000001 * d + 0x010101;
				// tslint:enable: no-magic-numbers
			}
		}

		for (let x = 0; x < 2 * sightRadius; x++) {
			this.visibleTiles[x] = [];
			for (let y = 0; y < 2 * sightRadius; y++) {
				this.visibleTiles[x][y] = false;
			}
		}
	}

	// Used only for performance debugging
	dynamicLightingTimes: number[] = [];
	reducedLightingArray: number[][] = [];

	updateDynamicLighting() {
		const { width, height } = this.getCurrentLevel();
		const dungeonWidth = width * TILE_WIDTH;
		const dungeonHeight = height * TILE_HEIGHT;
		// Take time for benchmarking
		const beforeDynamicLighting = window.performance.now();

		// We have a slight offset on the player token, not yet sure why
		// tslint:disable-next-line: no-magic-numbers
		const playerTokenX = globalState.playerCharacter.x - 5;
		const playerTokenY = globalState.playerCharacter.y;
		// Get the tile the player token is on
		const playerTileX = Math.round(playerTokenX / TILE_WIDTH);
		const playerTileY = Math.round(playerTokenY / TILE_HEIGHT);
		// We calculate darkness values for 32x32 tiles, seems to be enough visually speaking
		const lowerBoundX = Math.min(sightRadius, playerTileX) * -1;
		const upperBoundX = Math.min(sightRadius, dungeonWidth - 1 - playerTileX);
		const lowerBoundY = Math.min(sightRadius, playerTileY) * -1;
		const upperBoundY = Math.min(sightRadius, dungeonHeight - 1 - playerTileY);

		// The player character tile is always fully lit
		const playerTile = this.tileLayer.getTileAt(playerTileX, playerTileY);
		playerTile.tint = DEFAULT_TILE_TINT;

		for (let x = 0; x < 2 * sightRadius; x++) {
			for (let y = 0; y < 2 * sightRadius; y++) {
				this.visibleTiles[x][y] = false;
			}
		}

		for (let xVect = -sightRadius; xVect < sightRadius; xVect++) {
			for (let yVect = -sightRadius; yVect < sightRadius; yVect++) {
				this.castLightingRay(
					playerTileX,
					playerTileY,
					xVect / sightRadius,
					yVect / sightRadius,
					sightRadius
				);
			}
		}

		for (let x = lowerBoundX; x < upperBoundX; x++) {
			for (let y = lowerBoundY; y < upperBoundY; y++) {
				const tileX = playerTileX + x;
				const tileY = playerTileY + y;
				const tile = this.tileLayer.getTileAt(tileX, tileY);
				const decorationTile = this.decorationLayer.getTileAt(tileX, tileY);
				const overlayTile = this.overlayLayer.getTileAt(tileX, tileY);

				// Not all fields have tiles, black fields have no tile
				const relevantTile = tile || decorationTile || overlayTile;
				if (relevantTile) {
					const distanceX = Math.abs(playerTokenX - relevantTile.pixelX);
					const distanceY = Math.abs(playerTokenY - relevantTile.pixelY);
					// Visited Tiles is either VISITED_TILE_TINT or 0 for each tile
					this.visitedTiles[tileX][tileY] = Math.max(
						VISITED_TILE_TINT *
							((this.visibleTiles[x + sightRadius][y + sightRadius] &&
								Math.hypot(distanceX, distanceY) <=
									lightRadius * TILE_HEIGHT) as unknown as number),
						this.visitedTiles[tileX][tileY]
					);
					//

					// That is: lightingLevel for the distance if it is currently visible,
					// VISITED_TILE_TINT if it has been visited before,
					// black otherwise
					const tint = Math.max(
						(this.visibleTiles[x + sightRadius][y + sightRadius] as unknown as number) *
							this.lightingLevels[distanceX][distanceY],
						this.visitedTiles[tileX][tileY] +
							(this.visibleTiles[x + sightRadius][y + sightRadius] as unknown as number)
					);
					if (tile) {
						tile.tint = tint;
					}
					if (decorationTile) {
						decorationTile.tint = tint;
					}
					if (overlayTile) {
						overlayTile.tint = tint;
					}
				}
			}
		}

		this.dynamicLightingTimes.push(window.performance.now() - beforeDynamicLighting);
		if (this.dynamicLightingTimes.length >= TEN_SECONDS_IN_FRAMES) {
			const avg =
				this.dynamicLightingTimes.reduce((sum, value) => sum + value) /
				this.dynamicLightingTimes.length;
			// tslint:disable-next-line: no-console
			console.log(`Dynamic lighting took on avg ${avg} ms`);
			this.dynamicLightingTimes = [];
		}
	}

	// This is a bit performance optimized :D
	castLightingRay = (
		originX: number,
		originY: number,
		vectorX: number,
		vectorY: number,
		steps: number
	) => {
		let x = 0;
		let y = 0;
		let xDelta = 0;
		let yDelta = 0;
		// Basically, we don't want to have to deal with decimal values, so multiply by 10000 and round
		const xThreshold = LIGHTRAY_PRECISION;
		const yThreshold = LIGHTRAY_PRECISION;
		const xStepDiff = vectorX < 0 ? -1 : 1;
		const yStepDiff = vectorY < 0 ? -1 : 1;
		const vectorXAbs = Math.abs(Math.round(vectorX * LIGHTRAY_PRECISION));
		const vectorYAbs = Math.abs(Math.round(vectorY * LIGHTRAY_PRECISION));
		// We don't want to multiply if we can prevent it, but we want to have if statements even less
		// So what we end up doing is using the boolean-as-a-number trick and multiply where we have to
		for (let i = 1; i <= steps; i++) {
			xDelta += vectorXAbs;
			yDelta += vectorYAbs;
			x += ((xDelta >= xThreshold) as unknown as number) * xStepDiff;
			y += ((yDelta >= yThreshold) as unknown as number) * yStepDiff;
			xDelta -= ((xDelta >= xThreshold) as unknown as number) * xThreshold;
			yDelta -= ((yDelta >= yThreshold) as unknown as number) * yThreshold;

			this.visibleTiles[x + sightRadius][y + sightRadius] = true;
			if (this.isBlockingTile[x + originX][y + originY]) {
				// Break actually stops this ray from being casted
				break;
			}
		}
	};
}
