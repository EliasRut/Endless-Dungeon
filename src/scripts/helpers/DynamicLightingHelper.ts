import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import { B_BOT, B_LFT, B_RGT, B_TOP, getTileIndex } from './cells';
import { DEFAULT_TILE_TINT, VISITED_TILE_TINT } from './constants';
import { GID_MULTIPLE, TILE_HEIGHT, TILE_WIDTH } from './generateDungeon';
import { isCollidingTile } from './movement';

const sightRadius = 14;
const lightRadius = 10;

const TEN_SECONDS_IN_FRAMES = 600;
const LIGHTRAY_PRECISION = 10000;

const enum Directions {
	CENTER = -1,
	NORTH = 0,
	NORTH_EAST = 1,
	EAST = 2,
	SOUTH_EAST = 3,
	SOUTH = 4,
	SOUTH_WEST = 5,
	WEST = 6,
	NORTH_WEST = 7,
}

const directionFromXY: Directions[][] = [
	[Directions.NORTH_WEST, Directions.WEST, Directions.SOUTH_WEST],
	[Directions.NORTH, Directions.CENTER, Directions.SOUTH],
	[Directions.NORTH_EAST, Directions.EAST, Directions.SOUTH],
];

const lightPassingTileIds: number[] = [
	// First row cells
	...Array.from(Array(24).keys()).map((i) => getTileIndex(0, i)),
	...Array.from(Array(24).keys()).map((i) => getTileIndex(1, i)),
	...Array.from(Array(24).keys()).map((i) => getTileIndex(2, i)),
	// B_LFT,
	// B_RGT,
	// B_TOP,
	// B_BOT,
	//1, 	2, 	3, 	4, 	5, 	6, 	7, 	8, 	9, 	10, 	11, 	12, 	13, 	14, 	15, 	45, 	46, 	47, 	48, 	49, 	50, 	51, 	52, 	53, 	54, 	55, 	56, 	57, 	58, 	59, 	60, 	61, 	62, 	88, 	89, 	90, 	94, 	95, 	96, 	99, 	100, 	101, 	102,
];

// const lightPassingTileIdsByDirection: number[][] = [
// 	/*NORTH: */ [...lightPassingTileIds, B_LFT, B_RGT],
// 	/*NORTH_EAST: */ [...lightPassingTileIds, B_LFT, B_TOP],
// 	/*EAST: */ [...lightPassingTileIds, B_TOP, B_BOT],
// 	/*SOUTH_EAST: */ [...lightPassingTileIds, B_LFT, B_BOT],
// 	/*SOUTH: */ [...lightPassingTileIds, B_LFT, B_RGT],
// 	/*SOUTH_WEST: */ [...lightPassingTileIds, B_RGT, B_BOT],
// 	/*WEST: */ [...lightPassingTileIds, B_TOP, B_BOT],
// 	/*NORTH_WEST: */ [...lightPassingTileIds, B_RGT, B_BOT],
// ];
const lightPassingTileIdsByDirection: number[][] = [
	/*NORTH: */ [...lightPassingTileIds], //, B_LFT, B_RGT],
	/*NORTH_EAST: */ [...lightPassingTileIds], //, B_LFT, B_TOP],
	/*EAST: */ [...lightPassingTileIds, B_TOP, B_BOT],
	/*SOUTH_EAST: */ [...lightPassingTileIds], //, B_LFT, B_BOT],
	/*SOUTH: */ [...lightPassingTileIds], //, B_LFT, B_RGT],
	/*SOUTH_WEST: */ [...lightPassingTileIds], //, B_RGT, B_BOT],
	/*WEST: */ [...lightPassingTileIds, B_TOP, B_BOT],
	/*NORTH_WEST: */ [...lightPassingTileIds], //, B_RGT, B_BOT],
];

const addHexColors = (color1: number, color2: number, intensity: number) => {
	const r = Math.min(255, Math.round((color1 >> 16) + (color2 >> 16) * intensity));
	const g = Math.min(255, Math.round((color1 >> 8) & 0xff) + ((color2 >> 8) & 0xff) * intensity);
	const b = Math.min(255, Math.round(color1 & 0xff) + (color2 & 0xff) * intensity);
	return (r << 16) + (g << 8) + b;
};

export default class DynamicLightingHelper {
	// This is an array of arrays of arrays, where the first array is the radius,
	// the second is the intensity, the third is the x coordinate and the last array is the
	// y coordinate.
	tileBasesLightingLevels: number[][][] = [];
	lightingLevels: number[][] = [];

	tileLayer: Phaser.Tilemaps.TilemapLayer;
	decorationLayer: Phaser.Tilemaps.TilemapLayer;
	overlayLayer: Phaser.Tilemaps.TilemapLayer;
	lastLightLevel: number = 255;

	isBlockingTile: boolean[][][] = [];
	updatedTiles: [number, number][] = [];
	visitedTiles: number[][] = [];
	visibleTiles: boolean[][] = [];
	fieldsToUpdate: [number, number][] = [];

	mainScene: MainScene;

	constructor(
		tileLayer: Phaser.Tilemaps.TilemapLayer,
		decorationLayer: Phaser.Tilemaps.TilemapLayer,
		overlayLayer: Phaser.Tilemaps.TilemapLayer,
		mainScene: MainScene
	) {
		this.tileLayer = tileLayer;
		this.decorationLayer = decorationLayer;
		this.overlayLayer = overlayLayer;
		this.mainScene = mainScene;
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
		for (let direction = 0; direction < 8; direction++) {
			this.isBlockingTile[direction] = [];
		}
		for (let x = 0; x < dungeonWidth; x++) {
			for (let direction = 0; direction < 8; direction++) {
				this.isBlockingTile[direction][x] = [];
			}
			this.visitedTiles[x] = [];
			for (let y = 0; y < dungeonHeight; y++) {
				this.visitedTiles[x][y] = 0;
				const tile = this.tileLayer.getTileAt(x, y);
				if (!tile) {
					for (let direction = 0; direction < 8; direction++) {
						this.isBlockingTile[direction][x][y] = true;
					}
				} else {
					const tileIdNormalized = tile.index % GID_MULTIPLE;
					// tslint:disable: no-magic-numbers
					for (let direction = 0; direction < 8; direction++) {
						this.isBlockingTile[direction][x][y] =
							isCollidingTile(tile.index) &&
							!lightPassingTileIdsByDirection[direction].includes(tileIdNormalized);
					}
					// tileIdNormalized < 15 || (tileIdNormalized >= 45 && tileIdNormalized < 60);
					// tslint:enable: no-magic-numbers
				}
			}
		}

		// Prepare the player character specific lighting levels
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

		// Prepare the tile based lighting levels.
		for (let radius = 0; radius <= 10; radius++) {
			this.tileBasesLightingLevels[radius] = [];
			for (let x = 0; x <= radius; x++) {
				this.tileBasesLightingLevels[radius][x] = [];
				for (let y = 0; y <= radius; y++) {
					// Good old pythagoras for getting actual distance to the tile
					const distance = Math.hypot(x, y);
					// This will be a factor between 0 and 1
					const distanceNormalized = Math.max(0, radius + 1 - distance) / (radius + 1);
					// We substract 1 to allow our adding of 0x010101 later on, which will indicate that the
					// field is currently visible. That's a hack, but it works :P
					// tslint:disable: no-magic-numbers
					const d = Math.min(255 - 1, Math.round(distanceNormalized * 255));
					// This will give us a hex value of 0xdddddd, so a greyscale lighting factor
					this.tileBasesLightingLevels[radius][x][y] =
						0x010000 * d + 0x000100 * d + 0x000001 * d + 0x010101;
					// tslint:enable: no-magic-numbers
				}
			}
		}

		for (let x = 0; x < 2 * sightRadius + 2; x++) {
			this.visibleTiles[x] = [];
			for (let y = 0; y < 2 * sightRadius + 2; y++) {
				this.visibleTiles[x][y] = false;
			}
		}
	}

	// Used only for performance debugging
	dynamicLightingTimes: number[] = [];
	reducedLightingArray: number[][] = [];

	updateDynamicLighting(globalTime: number) {
		const currentLevel = this.getCurrentLevel();
		if (!currentLevel) {
			return;
		}
		const { width, height } = currentLevel;
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
		const lowerBoundX = Math.min(sightRadius - 1, playerTileX) * -1;
		const upperBoundX = Math.min(sightRadius - 1, dungeonWidth - 1 - playerTileX);
		const lowerBoundY = Math.min(sightRadius - 1, playerTileY) * -1;
		const upperBoundY = Math.min(sightRadius - 1, dungeonHeight - 1 - playerTileY);

		// The player character tile is always fully lit
		const playerTile = this.tileLayer.getTileAt(playerTileX, playerTileY);
		playerTile.tint = DEFAULT_TILE_TINT;

		// Hide all tiles that are in our update list from spells
		this.fieldsToUpdate.forEach(([tileX, tileY]) => {
			const tile = this.tileLayer.getTileAt(tileX, tileY);
			const decorationTile = this.decorationLayer.getTileAt(tileX, tileY);
			const overlayTile = this.overlayLayer.getTileAt(tileX, tileY);

			if (tile) {
				tile.tint = this.visitedTiles[tileX][tileY];
			}
			if (decorationTile) {
				decorationTile.tint = this.visitedTiles[tileX][tileY];
			}
			if (overlayTile) {
				overlayTile.tint = this.visitedTiles[tileX][tileY];
			}
		});
		this.fieldsToUpdate = [];

		for (let x = 0; x < 2 * sightRadius + 2; x++) {
			for (let y = 0; y < 2 * sightRadius + 2; y++) {
				this.visibleTiles[x][y] = false;
			}
		}

		// for (let x = -sightRadius - 1; x < sightRadius + 2; x++) {
		// 	for (let y = -sightRadius - 2; y < sightRadius + 2; y++) {
		// 		const tileX = playerTileX + x;
		// 		const tileY = playerTileY + y;
		// 		const tile = this.tileLayer.getTileAt(tileX, tileY);
		// 		if (tile) {
		// 			tile.tint = 0x00ff00;
		// 		}
		// 	}
		// }

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
					if (tile || decorationTile || overlayTile) {
						const tint = Math.max(
							(this.visibleTiles[x + sightRadius][y + sightRadius] as unknown as number) *
								this.lightingLevels[distanceX][distanceY],
							this.visitedTiles[tileX][tileY] +
								(this.visibleTiles[x + sightRadius][y + sightRadius] as unknown as number),
							0x010101
						);
						if (tile) {
							tile.tint = tint;
							tile.visible = tint > 0;
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
		}

		const lightingObjects = this.mainScene.getLightingSources();

		for (const lightingObject of lightingObjects) {
			// Update lighting through light sources
			for (let x = -lightingObject.radius; x <= lightingObject.radius; x++) {
				for (let y = -lightingObject.radius; y <= lightingObject.radius; y++) {
					const tileX = lightingObject.x + x;
					const tileY = lightingObject.y + y;
					this.fieldsToUpdate.push([tileX, tileY]);
					const tile = this.tileLayer.getTileAt(tileX, tileY);
					const decorationTile = this.decorationLayer.getTileAt(tileX, tileY);
					const overlayTile = this.overlayLayer.getTileAt(tileX, tileY);

					const intensity = lightingObject.strength
						? lightingObject.strength / 10
						: (lightingObject.minStrength! +
								(Math.abs(
									((globalTime - lightingObject.seed!) % lightingObject.frequency!) -
										lightingObject.frequency! / 2
								) /
									(lightingObject.frequency! / 2)) *
									(lightingObject.maxStrength! - lightingObject.minStrength!)) /
						  10;
					if (tile) {
						tile.tint = addHexColors(
							tile.tint,
							this.tileBasesLightingLevels[lightingObject.radius][Math.abs(x)][Math.abs(y)],
							intensity
						);
					}
					if (decorationTile) {
						decorationTile.tint = addHexColors(
							decorationTile.tint,
							this.tileBasesLightingLevels[lightingObject.radius][Math.abs(x)][Math.abs(y)],
							intensity
						);
					}
					if (overlayTile) {
						overlayTile.tint = addHexColors(
							overlayTile.tint,
							this.tileBasesLightingLevels[lightingObject.radius][Math.abs(x)][Math.abs(y)],
							intensity
						);
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

		// if (DEBUG_VISIBILITY) {
		// }
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
		const direction = directionFromXY[xStepDiff + 1][yStepDiff + 1];
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
			if (this.isBlockingTile[direction][x + originX][y + originY]) {
				// Break actually stops this ray from being casted
				break;
			}
		}
	};
}
