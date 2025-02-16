import Character from '../../../../types/Character';
import { CharacterTokenUpdateEffect } from '../../../../types/CharacterTokenUpdateEffect';
import { EnemyTokenData } from '../../../../types/EnemyTokenData';
import { NORMAL_ANIMATION_FRAME_RATE, SCALE } from '../../helpers/constants';
import { updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import { walkToWaypoint } from './walkToWaypoint';

export function handleTokenMovement(
	tokenData: EnemyTokenData,
	stateObject: Character,
	bodyX: number,
	bodyY: number,
	scene?: MainScene
) {
	let selfStepResults: CharacterTokenUpdateEffect = {};

	// If target is out of attack range, move towards it and stop when the token is in the proximity.
	// Enemy follows target only if close enough
	if (tokenData.targetStateObject!.health > 0 && tokenData.aggro) {
		const aiStepResult = walkToWaypoint(tokenData, stateObject, bodyX, bodyY, scene);
		selfStepResults = { ...selfStepResults, ...(aiStepResult.self || {}) };
	} else {
		// If token does not have aggro, or is already in attack range, stop walking
		selfStepResults.setVelocity = [0, 0];
		const animation = updateMovingState(stateObject, false, stateObject.currentFacing);
		if (animation) {
			selfStepResults.playAnimation = { key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE };
		}
	}

	stateObject.x = bodyX / SCALE;
	stateObject.y = bodyY / SCALE;
	return { self: selfStepResults };
}
