import Character from '../../../../types/Character';
import { AiStepResult } from '../../../../types/CharacterTokenUpdateEffect';
import { EnemyTokenData } from '../../../../types/EnemyTokenData';
import {
	DEBUG_ENEMY_AI,
	facingToSpriteNameMap,
	FadingLabelSize,
	NORMAL_ANIMATION_FRAME_RATE,
	SCALE,
} from '../../helpers/constants';
import { getDistanceToWorldStatePosition } from '../../helpers/getDistanceToWorldStatePosition';
import { getFacing4Dir, getFacing8Dir } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import { handleTokenMovement } from './handleTokenMovement';

export function executeRangedAttack(
	tokenData: EnemyTokenData,
	stateObject: Character,
	x: number,
	y: number,
	time: number
): AiStepResult {
	const result: AiStepResult = {
		self: {},
	};

	if (!tokenData.isWaitingToAttack && !tokenData.isCasting) {
		tokenData.attackedAt = time;
		tokenData.isWaitingToAttack = true;
		result.self!.setVelocity = [0, 0];
	}

	const castTime = tokenData.enemyData?.rangedAttackData?.castTime || 1;
	if (tokenData.attackedAt + castTime > time && !tokenData.isCasting) {
		if (DEBUG_ENEMY_AI) {
			result.self!.addFadingLabel = {
				text: 'Preparing Ranged Attack',
				size: FadingLabelSize.NORMAL,
				color: '#ff0000',
				x: x,
				y: y,
				timeMs: 1000,
			};
		}
		const tx = tokenData.targetStateObject!.x * SCALE;
		const ty = tokenData.targetStateObject!.y * SCALE;
		const totalDistance = Math.abs(x - tx) + Math.abs(y - ty);
		const xSpeed = tx - x;
		const ySpeed = ty - y;
		const newFacing = getFacing4Dir(xSpeed, ySpeed);
		// 9 frames, so 9 frame rate for 1s.
		if (tokenData.attackedAt === time || stateObject.currentFacing !== newFacing) {
			const attackAnimationName = `${tokenData.tokenName}-${
				tokenData.enemyData!.rangedAttackData!.animationName
			}-${facingToSpriteNameMap[newFacing]}`;
			result.self!.playAnimation = {
				key: attackAnimationName,
				frameRate: NORMAL_ANIMATION_FRAME_RATE,
				progress: (time - tokenData.attackedAt) / castTime,
			};
			stateObject.currentFacing = newFacing;
		}
		tokenData.isCasting = true;
		tokenData.isWaitingToAttack = false;
		result.self!.setVelocity = [0, 0];
	} else if (tokenData.attackedAt + castTime <= time && tokenData.isCasting) {
		if (DEBUG_ENEMY_AI) {
			result.self!.addFadingLabel = {
				text: 'Casting',
				size: FadingLabelSize.NORMAL,
				color: '#ff0000',
				x: x,
				y: y,
				timeMs: 1000,
			};
		}

		const casterX = stateObject.x * SCALE;
		const casterY = stateObject.y * SCALE;
		const tx = tokenData.targetStateObject!.x * SCALE;
		const ty = tokenData.targetStateObject!.y * SCALE;
		const deltaX = tx - casterX;
		const deltaY = ty - casterY;
		const totalDistance = Math.abs(casterX - tx) + Math.abs(casterY - ty);
		result.self!.triggerAbility = {
			caster: stateObject,
			pointOfOrigin: {
				...stateObject,

				// Calculate exact facing in radians from xSpeed and ySpeed
				exactTargetXFactor: deltaX / totalDistance,
				exactTargetYFactor: deltaY / totalDistance,
			},
			type: tokenData.enemyData?.rangedAttackData!.abilityType!,
			abilityLevel: stateObject.level,
			globalTime: time,
			comboCast: 1,
		};

		tokenData.isCasting = false;
	}

	return result;
}

export function handleRangedAttack(
	tokenData: EnemyTokenData,
	stateObject: Character,
	x: number,
	y: number,
	bodyX: number,
	bodyY: number,
	time: number,
	scene?: MainScene
) {
	const distance = getDistanceToWorldStatePosition(
		x,
		y,
		tokenData.targetStateObject!.x,
		tokenData.targetStateObject!.y
	);

	// When token is in the proximity of the target, and target is alive, attack
	if (
		distance <= tokenData.enemyData!.rangedAttackData!.castRange &&
		tokenData.targetStateObject!.health > 0
	) {
		return executeRangedAttack(tokenData, stateObject, x, y, time);
	} else {
		tokenData.isWaitingToDealDamage = false;

		// Handle moving the token towards the enemy
		return handleTokenMovement(tokenData, stateObject, bodyX, bodyY, scene);
	}
}
