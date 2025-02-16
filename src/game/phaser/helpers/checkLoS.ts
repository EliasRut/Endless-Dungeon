import MainScene from '../scenes/MainScene';
import { VISITED_TILE_TINT } from './constants';
import { getOccupiedTile } from './getOccupiedTile';

export function checkLoS(
	bodyX: number | undefined,
	bodyY: number | undefined,
	scene?: MainScene
): boolean {
	// Instead of ray tracing we're using the players line of sight calculation, which tints the
	// tile the enemy stands on.
	const tile = getOccupiedTile(bodyX, bodyY, scene);
	return !!(tile && tile.tint > VISITED_TILE_TINT);
}
