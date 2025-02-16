import Character from '../../../../types/Character';
import { CharacterTokenUpdateEffect } from '../../../../types/CharacterTokenUpdateEffect';
import { EnemyTokenData } from '../../../../types/EnemyTokenData';
import { DEBUG_PATHFINDING, NORMAL_ANIMATION_FRAME_RATE, SCALE } from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';

export function walkToWaypoint(
	tokenData: EnemyTokenData,
	stateObject: Character,
	bodyX: number,
	bodyY: number,
	scene?: MainScene
) {
	const selfStepResults: CharacterTokenUpdateEffect = {};

	let tx = tokenData.targetStateObject?.x || 0;
	let ty = tokenData.targetStateObject?.y || 0;
	[tx, ty] = tokenData.nextWaypoint
		? [tokenData.nextWaypoint[0][0] * TILE_WIDTH, tokenData.nextWaypoint[0][1] * TILE_HEIGHT]
		: [tx, ty];
	if (DEBUG_PATHFINDING && scene) {
		tokenData.nextWaypoint?.forEach((waypoint) => {
			const tile = scene.tileLayer!.getTileAt(waypoint[0], waypoint[1]);
			if (tile) {
				tile.tint = 0xff0000;
			}
		});
	}
	const totalDistance = Math.abs(tx * SCALE - bodyX) + Math.abs(ty * SCALE - bodyY) || 1;
	const xSpeed =
		((tx * SCALE - bodyX) / totalDistance) * stateObject.movementSpeed * stateObject.slowFactor;
	const ySpeed =
		((ty * SCALE - bodyY) / totalDistance) * stateObject.movementSpeed * stateObject.slowFactor;
	selfStepResults.setVelocity = [xSpeed, ySpeed];
	const newFacing = getFacing4Dir(xSpeed, ySpeed);
	const animation = updateMovingState(stateObject, true, newFacing);
	if (animation) {
		selfStepResults.playAnimation = {
			key: animation,
			frameRate: NORMAL_ANIMATION_FRAME_RATE,
			repeat: -1,
		};
	}
	return { self: selfStepResults };
}
