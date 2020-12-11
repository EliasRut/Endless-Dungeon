import { Facings } from './constants';

const ROTATION_THRESHOLD = 3;

export const getFacing = (x: number, y: number) => {
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