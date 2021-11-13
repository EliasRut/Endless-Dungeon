import Character from '../worldstate/Character';
import { ANIMATION_IDLE, ANIMATION_WALK, Facings, facingToSpriteNameMap } from './constants';

const ROTATION_THRESHOLD = 3;

export const getFacing8Dir = (x: number, y: number) => {
	if (x < 0 && Math.abs(y/x) < ROTATION_THRESHOLD) {
		if (y < 0 && Math.abs(x/y) < ROTATION_THRESHOLD) {
			return Facings.NORTH_WEST;
		} else if (y > 0 && Math.abs(x/y) < ROTATION_THRESHOLD) {
			return Facings.SOUTH_WEST;
		}
		// y === 0
		return Facings.WEST;
	} else if (x > 0 && Math.abs(y/x) < ROTATION_THRESHOLD) {
		if (y < 0 && Math.abs(x/y) < ROTATION_THRESHOLD) {
			return Facings.NORTH_EAST;
		} else if (y > 0 && Math.abs(x/y) < ROTATION_THRESHOLD) {
			return Facings.SOUTH_EAST;
		}
		// y === 0
		return Facings.EAST;
	}

	if (y < 0) {
		return Facings.NORTH;
	} else if (y > 0) {
		return Facings.SOUTH;
	}

	// x === 0, y === 0
	return Facings.SOUTH;
};

export const getFacing4Dir = (x: number, y: number) => {
	if (x < 0 && Math.abs(y/x) < ROTATION_THRESHOLD) {
		if (y < 0 && Math.abs(x/y) < 1) {
			return Facings.NORTH;
		} else if (y > 0 && Math.abs(x/y) < 1) {
			return Facings.SOUTH;
		}
		return Facings.WEST;
	} else if (x > 0 && Math.abs(y/x) < ROTATION_THRESHOLD) {
		if (y < 0 && Math.abs(x/y) < 1) {
			return Facings.NORTH;
		} else if (y > 0 && Math.abs(x/y) < 1) {
			return Facings.SOUTH;
		}
		return Facings.EAST;
	}

	if (y < 0) {
		return Facings.NORTH;
	} else if (y > 0) {
		return Facings.SOUTH;
	}

	// x === 0, y === 0
	return Facings.SOUTH;
};

export const getVelocitiesForFacing = (facing: Facings) => {
	switch (facing) {
		case Facings.NORTH:			 return { x:  0,		y: -1};
		case Facings.EAST:			 return { x:  1,		y:  0};
		case Facings.SOUTH:			 return { x:  0,		y:  1};
		case Facings.WEST:			 return { x: -1,		y:  0};
		case Facings.NORTH_EAST: return { x:  0.7,	y: -0.7};
		case Facings.SOUTH_EAST: return { x:  0.7,	y:  0.7};
		case Facings.SOUTH_WEST: return { x: -0.7,	y:  0.7};
		case Facings.NORTH_WEST: return { x: -0.7,	y: -0.7};
	}
};

export const getRotationInRadiansForFacing = (facing: Facings) => {
	switch (facing) {
		case Facings.NORTH:				return 0;
		case Facings.EAST:				return Math.PI * 0.5;
		case Facings.SOUTH:				return Math.PI * -1;
		case Facings.WEST:				return Math.PI * -0.5;
		case Facings.NORTH_EAST:	return Math.PI * 0.25;
		case Facings.SOUTH_EAST:	return Math.PI * 0.75;
		case Facings.SOUTH_WEST:	return Math.PI * -0.75;
		case Facings.NORTH_WEST:	return Math.PI * -0.25;
	}
};

export const getCharacterSpeed = (char: Character) => {
	const ms = char.movementSpeed * char.slowFactor;
	char.slowFactor = 1;
	return ms;
};

export const updateMovingState = (
		char: Character,
		hasMoved: boolean,
		facing: Facings,
		forceUpdate?: boolean
	) => {
		if (!hasMoved && !forceUpdate) {
			const lastCharDirection = facingToSpriteNameMap[char.currentFacing];
			// char.currentFacing = facing;
			char.isWalking = hasMoved;
			return `${char.animationBase}-${ANIMATION_IDLE}-${lastCharDirection}`;
		}
		if (facing === char.currentFacing && char.isWalking && !forceUpdate) {
			return false;
		}
		const newDirection = facingToSpriteNameMap[facing];
		char.currentFacing = facing;
		char.isWalking = hasMoved;
		const animationType = char.isWalking ? ANIMATION_WALK : ANIMATION_IDLE;
		return `${char.animationBase}-${animationType}-${newDirection}`;
};

export const COLLIDING_TILE_RANGES = [
	// [-1, -1],
	// tslint:disable: no-magic-numbers
	[0, 31],
	[40, 71],
	[80, 111],
	[120, 151],
	[160, 191],
	[200, 231],
	[240, 271],
	[280, 311],
	[320, 351],
	[360, 391],
	[400, 431],
	// tslint:enable
];

export const isCollidingTile = (tileNumber: number) => {
	// tslint:disable-next-line: no-magic-numbers
	const normedNumber = tileNumber % 1000;
	const firstColliding =
		COLLIDING_TILE_RANGES.find(([lower, upper]) =>
			lower <= normedNumber && normedNumber <= upper );
	return !!firstColliding;
};

export const getXYfromTotalSpeed = (y: number, x: number) => {
	const tanPhi = y / x;
	const phi = Math.atan(tanPhi);
	const xSpeed = Math.cos(phi) * Math.sign(-1 * x);
	const ySpeed = Math.sin(phi) * Math.sign(-1 * x);
	return [xSpeed, ySpeed];
}