import Character from '../../../../types/Character';
import { AiStepResult } from '../../../../types/CharacterTokenUpdateEffect';
import { EnemyTokenData } from '../../../../types/EnemyTokenData';
import { checkLoS } from '../../helpers/checkLoS';
import { combineAiStepResults } from '../../helpers/combineAiStepResults';
import {
	DEBUG_ENEMY_AI,
	Faction,
	FadingLabelSize,
	KNOCKBACK_TIME,
	NORMAL_ANIMATION_FRAME_RATE,
	SCALE,
} from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import { getDistanceToWorldStatePosition } from '../../helpers/getDistanceToWorldStatePosition';
import { updateMovingState } from '../../helpers/movement';
import { findNextPathSegmentTo } from '../../helpers/pathfindingHelper';
import { getClosestTarget } from '../../helpers/targetingHelpers';
import MainScene from '../../scenes/MainScene';
import worldState from '../../worldState';
import { executeMeleeAttack, handleMeleeAttack } from './executeMeleeAttack';
import { handleRangedAttack } from './executeRangedAttack';
import { handleTokenMovement } from './handleTokenMovement';

export const handleEnemyAi = (
	tokenData: EnemyTokenData,
	stateObject: Character,
	x: number,
	y: number,
	bodyX: number,
	bodyY: number,
	time: number,
	scene?: MainScene
): AiStepResult => {
	let result: AiStepResult = {
		self: {},
	};

	// Check if enemy is dead, stunned or if the scene is paused
	if (tokenData.dead) return {};
	if (stateObject.stunned) return {};
	if (scene?.isPaused) {
		const animation = updateMovingState(stateObject, false, stateObject.currentFacing);
		if (animation) {
			result.self!.playAnimation = { key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE };
		}
		return result;
	}

	if (tokenData.charmedTime + 6000 < worldState.gameTime) {
		// If enemy is charmed, let it get back to normal aggro pattern
		tokenData.faction = Faction.ENEMIES;
		stateObject.faction = Faction.ENEMIES;
	}

	// Check for knockback effects
	if (tokenData.lastMovedTimestamp + KNOCKBACK_TIME > time) {
		return result;
	}
	if (tokenData.isCharging) {
		stateObject.x = bodyX / SCALE;
		stateObject.y = bodyY / SCALE;

		return combineAiStepResults([result, executeMeleeAttack(tokenData, stateObject, x, y, time)]);
	}

	if (!checkLoS(bodyX, bodyY, scene)) {
		// If we no longer see the target, and the aggro linger time has passed, reset the target
		if (tokenData.lastUpdate + tokenData.aggroLinger < time) {
			tokenData.aggro = false;
			tokenData.targetStateObject = undefined;
		}

		// if the token does not have aggro, and is not within line of sight to the player, do nothing
		if (!tokenData.aggro) {
			return result;
		}

		// The token is not in the line of sight, but still has lingering aggro, so move towards the
		// target.
		return combineAiStepResults([
			result,
			handleTokenMovement(tokenData, stateObject, bodyX, bodyY, scene),
		]);
	} else {
		// Find closest target from all possible targets available
		const closestTarget = getClosestTarget(tokenData.faction!, x, y);

		// If target is in vision, set aggro and update target
		const distanceToClosestTarget = closestTarget
			? getDistanceToWorldStatePosition(x, y, closestTarget.x, closestTarget.y)
			: Infinity;
		if (distanceToClosestTarget < stateObject.vision * SCALE) {
			tokenData.aggro = true;
			tokenData.lastUpdate = time;
			const currentTileX = Math.round(stateObject.x / TILE_WIDTH);
			const currentTileY = Math.round(stateObject.y / TILE_HEIGHT);
			if (
				scene &&
				(tokenData.lastTileX !== currentTileX ||
					tokenData.lastTileY !== currentTileY ||
					tokenData.targetStateObject?.x !== closestTarget!.x ||
					tokenData.targetStateObject?.y !== closestTarget!.y)
			) {
				tokenData.lastTileX = currentTileX;
				tokenData.lastTileY = currentTileY;
				tokenData.nextWaypoint = findNextPathSegmentTo(
					currentTileX,
					currentTileY,
					Math.round(closestTarget!.x / TILE_WIDTH),
					Math.round(closestTarget!.y / TILE_HEIGHT),
					scene?.navigationalMap
				);
				if (DEBUG_ENEMY_AI) {
					result.self!.addFadingLabel = {
						text: 'Pathfinding',
						size: FadingLabelSize.NORMAL,
						color: '#ff0000',
						x,
						y,
						timeMs: 1000,
					};
				}
			}
			tokenData.targetStateObject = closestTarget;

			// If token has melee type, make melee attack
			if (tokenData.enemyData?.isMeleeEnemy === true) {
				result = combineAiStepResults([
					result,
					handleMeleeAttack(tokenData, stateObject, x, y, bodyX, bodyY, time, scene),
				]);
			}

			// If token has ranged type, make ranged attack
			if (tokenData.enemyData?.isRangedEnemy === true) {
				result = combineAiStepResults([
					result,
					handleRangedAttack(tokenData, stateObject, x, y, bodyX, bodyY, time, scene),
				]);
			}
		}
	}
	stateObject.x = bodyX / SCALE;
	stateObject.y = bodyY / SCALE;

	return result;
};
