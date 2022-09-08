import { findNextPathSegmentTo, getNeighbours } from '../pathfindingHelper';

const x = false;
const o = true;

const diagonalCost = 1.4;
const blockedCost = 2.1;

describe('getNeighbors', () => {
	test('produces 8 neighbours on an open field', () => {
		const neighbors = getNeighbours(1, 1, [
			[o, o, o],
			[o, o, o],
			[o, o, o],
		]);

		expect(neighbors).toEqual([
			[1, 0, 1],
			[2, 1, 1],
			[1, 2, 1],
			[0, 1, 1],
			[2, 0, diagonalCost],
			[2, 2, diagonalCost],
			[0, 2, diagonalCost],
			[0, 0, diagonalCost],
		]);
	});

	test('produces no neighbours on an open field', () => {
		const neighbors = getNeighbours(1, 1, [
			[x, x, x],
			[x, x, x],
			[x, x, x],
		]);

		expect(neighbors).toEqual([]);
	});

	test('returns only the expect neighbours for partially blocked fields', () => {
		const neighbors = getNeighbours(1, 1, [
			[x, x, x], // y = 0
			[x, o, o], // y = 1
			[x, o, o], // y = 2
		]);

		expect(neighbors).toEqual([
			[2, 1, 1],
			[1, 2, 1],
			[2, 2, diagonalCost],
		]);
	});

	test('returns only non-diagonal neighbours if the corner fields are blocked', () => {
		let neighbors = getNeighbours(1, 1, [
			[o, o, o], // y = 0
			[x, o, x], // y = 1
			[o, o, o], // y = 2
		]);

		expect(neighbors).toEqual([
			[1, 0, 1],
			[1, 2, 1],
		]);

		neighbors = getNeighbours(1, 1, [
			[o, x, o], // y = 0
			[o, o, o], // y = 1
			[o, x, o], // y = 2
		]);

		expect(neighbors).toEqual([
			[2, 1, 1],
			[0, 1, 1],
		]);

		neighbors = getNeighbours(1, 1, [
			[o, x, o], // y = 0
			[x, o, x], // y = 1
			[o, x, o], // y = 2
		]);

		expect(neighbors).toEqual([]);
	});

	test('returns higher costs for fields adjecent to new obstacles', () => {
		let neighbors = getNeighbours(1, 1, [
			[x, o, o], // y = 0
			[o, o, o], // y = 1
			[x, o, o], // y = 2
		]);

		expect(neighbors).toEqual([
			[1, 0, blockedCost],
			[2, 1, 1],
			[1, 2, blockedCost],
			[0, 1, blockedCost],
			[2, 0, diagonalCost],
			[2, 2, diagonalCost],
		]);

		neighbors = getNeighbours(1, 1, [
			[o, o, x], // y = 0
			[o, o, o], // y = 1
			[o, o, x], // y = 2
		]);

		expect(neighbors).toEqual([
			[1, 0, blockedCost],
			[2, 1, blockedCost],
			[1, 2, blockedCost],
			[0, 1, 1],
			[0, 2, diagonalCost],
			[0, 0, diagonalCost],
		]);
	});
});

describe('findNextPathSegmentTo', () => {
	test('returns the end position if the end position is outside the grid', () => {
		const path = findNextPathSegmentTo(0, 0, -1, -1, [
			[o, o, o],
			[o, o, o],
			[o, o, o],
		]);

		expect(path).toEqual([[-1, -1]]);
	});

	test('returns the steps to the end position for a simple horizontal traversal', () => {
		const path = findNextPathSegmentTo(0, 0, 2, 0, [
			[o, o, o],
			[o, o, o],
			[o, o, o],
		]);

		expect(path).toEqual([
			[1, 0],
			[2, 0],
		]);
	});

	test('returns the steps to the end position for a simple vertical traversal', () => {
		const path = findNextPathSegmentTo(1, 0, 1, 2, [
			[o, o, o],
			[o, o, o],
			[o, o, o],
		]);

		expect(path).toEqual([
			[1, 1],
			[1, 2],
		]);
	});

	test('returns the steps to the end position for a diagonal traversal', () => {
		const path = findNextPathSegmentTo(0, 0, 2, 2, [
			[o, o, o],
			[o, o, o],
			[o, o, o],
		]);

		expect(path).toEqual([
			[1, 1],
			[2, 2],
		]);
	});

	test('returns the steps to the end position for a map with obstacle in the middle', () => {
		const path = findNextPathSegmentTo(0, 0, 2, 0, [
			[o, x, o],
			[o, x, o],
			[o, o, o],
		]);

		expect(path).toEqual([
			[0, 1],
			[0, 2],
			[1, 2],
			[2, 2],
			[2, 1],
			[2, 0],
		]);
	});

	test('returns the steps to the end position for a bigger map with obstacle in the middle', () => {
		const path = findNextPathSegmentTo(0, 0, 2, 0, [
			[o, x, o, o, o],
			[o, x, x, o, o],
			[o, x, x, x, o],
			[o, x, x, x, o],
			[o, o, o, o, o],
		]);

		expect(path).toEqual([
			[0, 1],
			[0, 2],
			[0, 3],
			[0, 4],
			[1, 4],
			[2, 4],
			[3, 4],
			[4, 4],
			[4, 3],
			[4, 2],
			[4, 1],
			[3, 0],
			[2, 0],
		]);
	});
});
