import MainScene from '../scenes/MainScene';
import { SCALE } from './constants';
import { TILE_HEIGHT, TILE_WIDTH } from './generateDungeon';

export function getOccupiedTile(
	bodyX: number | undefined,
	bodyY: number | undefined,
	scene?: MainScene
): Phaser.Tilemaps.Tile | null {
	if (bodyX !== undefined && bodyY !== undefined && scene) {
		const x = Math.round(bodyX / TILE_WIDTH / SCALE);
		const y = Math.round(bodyY / TILE_HEIGHT / SCALE);
		return scene.tileLayer!.getTileAt(x, y);
	}
	return null;
}
