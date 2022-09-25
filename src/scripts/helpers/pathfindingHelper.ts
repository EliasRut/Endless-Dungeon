'use strict';

class Queue<T> {
	_stack1: T[] = [];
	_stack2: T[] = [];

	push(item: T) {
		this._stack1.push(item);
	}

	shift() {
		if (this._stack2.length === 0) {
			const tmp = this._stack2;
			this._stack2 = this._stack1.reverse();
			this._stack1 = tmp;
		}
		return this._stack2.pop();
	}

	get length() {
		return this._stack1.length + this._stack2.length;
	}
}

export const getNeighbours: (
	x: number,
	y: number,
	map: boolean[][]
) => [number, number, number][] = (x, y, map) => {
	const neighbors: [number, number, number][] = [];
	// top
	if (map[y - 1] && map[y - 1][x]) {
		const hasNoNewAdjacentObstacles =
			((map[y] && !map[y][x - 1]) || map[y - 1][x - 1]) &&
			((map[y] && !map[y][x + 1]) || map[y - 1][x + 1]);
		neighbors.push([x, y - 1, hasNoNewAdjacentObstacles ? 1 : 2.1]);
	}
	// right
	if (map[y] && map[y][x + 1]) {
		const hasNoNewAdjacentObstacles =
			((map[y - 1] && !map[y - 1][x]) || (map[y - 1] && map[y - 1][x + 1])) &&
			((map[y + 1] && !map[y + 1][x]) || (map[y + 1] && map[y + 1][x + 1]));
		neighbors.push([x + 1, y, hasNoNewAdjacentObstacles ? 1 : 2.1]);
	}
	// bottom
	if (map[y + 1] && map[y + 1][x]) {
		const hasNoNewAdjacentObstacles =
			((map[y] && !map[y][x - 1]) || map[y + 1][x - 1]) &&
			((map[y] && !map[y][x + 1]) || map[y + 1][x + 1]);
		neighbors.push([x, y + 1, hasNoNewAdjacentObstacles ? 1 : 2.1]);
	}
	// left
	if (map[y] && map[y][x - 1]) {
		const hasNoNewAdjacentObstacles =
			((map[y - 1] && !map[y - 1][x]) || (map[y - 1] && map[y - 1][x - 1])) &&
			((map[y + 1] && !map[y + 1][x]) || (map[y + 1] && map[y + 1][x - 1]));
		neighbors.push([x - 1, y, hasNoNewAdjacentObstacles ? 1 : 2.1]);
	}
	// top right
	if (map[y - 1] && map[y - 1][x + 1] && map[y - 1][x] && map[y] && map[y][x + 1]) {
		neighbors.push([x + 1, y - 1, 1.4]);
	}
	// bottom right
	if (map[y + 1] && map[y + 1][x + 1] && map[y + 1][x] && map[y] && map[y][x + 1]) {
		neighbors.push([x + 1, y + 1, 1.4]);
	}
	// bottom left
	if (map[y + 1] && map[y + 1][x - 1] && map[y + 1][x] && map[y] && map[y][x - 1]) {
		neighbors.push([x - 1, y + 1, 1.4]);
	}
	// top left
	if (map[y - 1] && map[y - 1][x - 1] && map[y - 1][x] && map[y] && map[y][x - 1]) {
		neighbors.push([x - 1, y - 1, 1.4]);
	}
	return neighbors;
};

const gridSize = 48;

/**
 *
 * @param absoluteStartX the start x position from which the path should be calculated
 * @param absoluteStartY the start y position from which the path should be calculated
 * @param absoluteEndX the end x position to which the path should be calculated
 * @param absoluteEndY the end y position to which the path should be calculated
 * @param map a y-x indexed grid of booleans, where true means the tile is walkable
 */
export const findNextPathSegmentTo: (
	absoluteStartX: number,
	absoluteStartY: number,
	absoluteEndX: number,
	absoluteEndY: number,
	map: boolean[][]
) => [number, number][] = (absoluteStartX, absoluteStartY, absoluteEndX, absoluteEndY, map) => {
	const topLeft = { x: absoluteStartX - gridSize / 2, y: absoluteStartY - gridSize / 2 };
	const startX = absoluteStartX - topLeft.x;
	const startY = absoluteStartY - topLeft.y;
	const endX = absoluteEndX - topLeft.x;
	const endY = absoluteEndY - topLeft.y;
	if (endX < 0 || endX > gridSize || endY < 0 || endY > gridSize) {
		return [[absoluteStartX, absoluteStartY]];
	}
	const minimumPriceMap: number[][] = [];
	const previousNodeMap: ([number, number] | undefined)[][] = [];
	for (let y = 0; y < gridSize; y++) {
		minimumPriceMap[y] = [];
		previousNodeMap[y] = [];
		for (let x = 0; x < gridSize; x++) {
			minimumPriceMap[y][x] = Infinity;
			previousNodeMap[y][x] = undefined;
		}
	}

	const queue: Queue<[number, number]> = new Queue();
	queue.push([startX, startY]);
	minimumPriceMap[startY][startX] = 0;

	while (queue.length > 0) {
		const [x, y] = queue.shift()!;
		if (x === endX && y === endY) {
			break;
		}
		const neighbors = getNeighbours(x + topLeft.x, y + topLeft.y, map);
		for (const [neighborXAbsolute, neighborYAbsolute, neighborStepPrice] of neighbors) {
			const neighborX = neighborXAbsolute - topLeft.x;
			const neighborY = neighborYAbsolute - topLeft.y;
			if (neighborX < 0 || neighborX >= gridSize || neighborY < 0 || neighborY >= gridSize) {
				continue;
			}
			const neighborPrice = minimumPriceMap[y][x] + neighborStepPrice;
			if (neighborPrice < minimumPriceMap[neighborY][neighborX]) {
				minimumPriceMap[neighborY][neighborX] = neighborPrice;
				previousNodeMap[neighborY][neighborX] = [x, y];
				queue.push([neighborX, neighborY]);
			}
		}
	}
	const returnPath: [number, number][] = [[endX + topLeft.x, endY + topLeft.y]];
	let [pathX, pathY] = [endX, endY];
	// let [lastX, lastY] = [pathX, pathY];
	while (previousNodeMap[pathY][pathX] !== undefined) {
		[pathX, pathY] = previousNodeMap[pathY][pathX]!;
		// if (
		// 	pathX + topLeft.x !== returnPath[returnPath.length - 1][0] &&
		// 	pathY + topLeft.y !== returnPath[returnPath.length - 1][1]
		// ) {
		// if (
		// 	Math.abs(absoluteStartX - (lastX + topLeft.x)) > 1 ||
		// 	Math.abs(absoluteStartY - (lastY + topLeft.y)) > 1
		// ) {
		returnPath.push([pathX + topLeft.x, pathY + topLeft.y]);
		// }
		// }
		// [lastX, lastY] = [pathX, pathY];
	}
	if (returnPath.length > 1) {
		returnPath.pop();
	}
	return returnPath.reverse();
};
