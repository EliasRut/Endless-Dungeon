import { Facings } from '../game/phaser/helpers/constants';

export interface SimplePointOfOrigin {
	currentFacing: Facings;
	x: number;
	y: number;
	exactTargetXFactor?: number;
	exactTargetYFactor?: number;
	width?: number;
	height?: number;
}

export interface PointOfOrigin extends SimplePointOfOrigin {
	getUpdatedData?: () => SimplePointOfOrigin;
}
