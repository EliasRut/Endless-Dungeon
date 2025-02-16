import worldstate from '../worldState';
import Character from '../../../types/Character';
import { Facings, Faction, SCALE } from './constants';

export const getAbsoluteDistancesToWorldStatePosition: (
	ownX: number,
	ownY: number,
	targetWorldStateX: number,
	targetWorldStateY: number
) => [number, number] = (ownX, ownY, targetWorldStateX, targetWorldStateY) => {
	const x = Math.abs(ownX - targetWorldStateX * SCALE);
	const y = Math.abs(ownY - targetWorldStateY * SCALE);
	return [x, y];
};

export const getDistanceToWorldStatePosition: (
	ownX: number,
	ownY: number,
	targetWorldStateX: number,
	targetWorldStateY: number
) => number = (ownX, ownY, targetWorldStateX, targetWorldStateY) => {
	const x = ownX - targetWorldStateX * SCALE;
	const y = ownY - targetWorldStateY * SCALE;
	return Math.hypot(x, y);
};

export const getClosestTarget: (
	ownFaction: Faction,
	ownX: number,
	ownY: number,
	inFacing?: Facings
) => Character | undefined = (ownFaction, ownX, ownY, inFacing) => {
	let possibleTargets: Character[];
	if (ownFaction === Faction.ALLIES || ownFaction === Faction.PLAYER) {
		possibleTargets = [...Object.values(worldstate.enemies)].filter(
			(character) => character.health > 0 && character.faction === Faction.ENEMIES
		);
	} else {
		possibleTargets = [
			worldstate.playerCharacter,
			...(worldstate.activeFollower ? [worldstate.followers[worldstate.activeFollower]] : []),
		].filter((character) => character.health > 0);
	}
	if (inFacing !== undefined) {
		possibleTargets = possibleTargets.filter((character) => {
			switch (inFacing) {
				case Facings.SOUTH:
					return character.y * SCALE > ownY;
				case Facings.SOUTH_EAST:
					return character.y * SCALE > ownY || character.x * SCALE > ownX;
				case Facings.EAST:
					return character.x * SCALE > ownX;
				case Facings.NORTH_EAST:
					return character.y * SCALE < ownY || character.x * SCALE > ownX;
				case Facings.NORTH:
					return character.y * SCALE < ownY;
				case Facings.NORTH_WEST:
					return character.y * SCALE < ownY || character.x * SCALE < ownX;
				case Facings.WEST:
					return character.x * SCALE < ownX;
				case Facings.SOUTH_WEST:
					return character.y * SCALE > ownY || character.x * SCALE < ownX;
			}
		});
	}

	const sortedTargets = possibleTargets.sort((left, right) => {
		const distanceLeft = getDistanceToWorldStatePosition(ownX, ownY, left.x, left.y);
		const distanceRight = getDistanceToWorldStatePosition(ownX, ownY, right.x, right.y);
		return distanceLeft - distanceRight;
	});
	return sortedTargets[0];
};
