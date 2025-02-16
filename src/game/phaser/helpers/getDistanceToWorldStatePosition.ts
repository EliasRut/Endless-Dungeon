import { SCALE } from './constants';

export function getDistanceToWorldStatePosition(x: number, y: number, px: number, py: number) {
	const dx = x - px * SCALE;
	const dy = y - py * SCALE;
	return Math.hypot(dx, dy);
}
