import DungeonLevel from '../worldstate/DungeonLevel';
import { TILE_HEIGHT, TILE_WIDTH, GID_MULTIPLE } from './generateDungeon';

// Add tile collision for all tilesets for tile numbers 0-31 and 40-71.
// tslint:disable-next-line: no-magic-numbers
const COLIDING_TILE_RANGES = [[0, 31], [40, 71]];

const createLayer: (
	scene: Phaser.Scene,
	layout: number[][],
	tilesets: string[],
	layerId: string | number
) => Phaser.Tilemaps.DynamicTilemapLayer = (scene, layout, tilesets, _layerId) => {
	const map = scene.make.tilemap({
		data: layout,
		tileWidth: TILE_WIDTH,
		tileHeight: TILE_HEIGHT
	});

	const tileSets = tilesets.map((tileSetName, index) => {
		const gid = index * GID_MULTIPLE;
		return map.addTilesetImage(
			`${tileSetName}-image`,
			tileSetName,
			TILE_WIDTH,
			TILE_HEIGHT,
			1,
			2,
			gid
		);
	});

	const tileLayer = map.createDynamicLayer(0, tileSets, 0, 0);

	return tileLayer;
};

export const generateTilemap: (scene: Phaser.Scene, dungeonLevel: DungeonLevel) =>
	[
		Phaser.Tilemaps.DynamicTilemapLayer,
		Phaser.Tilemaps.DynamicTilemapLayer,
		Phaser.Tilemaps.DynamicTilemapLayer
	] = (scene, dungeonLevel) => {

	const tileLayer = createLayer(scene, dungeonLevel.layout, dungeonLevel.tilesets, 0);

	tileLayer.setCollisionBetween(0, (dungeonLevel.tilesets.length + 1) * GID_MULTIPLE, false);

	const decorationTileLayer =
		createLayer(scene, dungeonLevel.decorationLayout, dungeonLevel.tilesets, 1);

	decorationTileLayer.setCollisionBetween(
		0, (dungeonLevel.tilesets.length + 1) * GID_MULTIPLE, false);

	const overlayTileLayer =
		createLayer(scene, dungeonLevel.overlayLayout, dungeonLevel.tilesets, 2);

	overlayTileLayer.setCollisionBetween(
		0, (dungeonLevel.tilesets.length + 1) * GID_MULTIPLE, false);

	dungeonLevel.tilesets.map((tileSetName, index) => {
		const gid = index * GID_MULTIPLE;

		COLIDING_TILE_RANGES.forEach(([first, last]) => {
			tileLayer.setCollisionBetween(gid + first, gid + last, true);
			decorationTileLayer.setCollisionBetween(gid + first, gid + last, true);
		});
	});

	return [tileLayer, decorationTileLayer, overlayTileLayer];
};
