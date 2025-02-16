import Character from '../../../../types/Character';
import {
	AiStepResult,
	CharacterTokenUpdateEffect,
} from '../../../../types/CharacterTokenUpdateEffect';
import { EnemyTokenData } from '../../../../types/EnemyTokenData';
import { MeleeAttackType } from '../../enemies/enemyData';
import {
	DEBUG_ENEMY_AI,
	facingToSpriteNameMap,
	FadingLabelSize,
	NORMAL_ANIMATION_FRAME_RATE,
	SCALE,
} from '../../helpers/constants';
import { getDistanceToWorldStatePosition } from '../../helpers/getDistanceToWorldStatePosition';
import { getFacing4Dir, getXYfromTotalSpeed } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import { handleTokenMovement } from './handleTokenMovement';

export function executeMeleeAttack(
	tokenData: EnemyTokenData,
	stateObject: Character,
	x: number,
	y: number,
	time: number
): AiStepResult {
	const result: AiStepResult = {
		self: {},
	};
	switch (tokenData.enemyData?.meleeAttackData!.attackType) {
		case MeleeAttackType.HIT: {
			if (tokenData.attackedAt + stateObject.attackTime < time) {
				if (DEBUG_ENEMY_AI) {
					result.self!.addFadingLabel = {
						text: 'Attacking',
						size: FadingLabelSize.NORMAL,
						color: '#ff0000',
						x: x,
						y: y,
						timeMs: 1000,
					};
				}
				const tx = tokenData.targetStateObject!.x * SCALE;
				const ty = tokenData.targetStateObject!.y * SCALE;
				const xSpeed = tx - x;
				const ySpeed = ty - y;
				const newFacing = getFacing4Dir(xSpeed, ySpeed);

				const attackAnimationName = `${tokenData.tokenName}-${
					tokenData.enemyData.meleeAttackData!.animationName
				}-${facingToSpriteNameMap[newFacing]}`;
				result.self!.playAnimation = {
					key: attackAnimationName,
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
				};

				result.self!.setVelocity = [0, 0];
				stateObject.isWalking = false;
				tokenData.attackedAt = time;
				tokenData.isWaitingToDealDamage = true;
			}
			break;
		}
		case MeleeAttackType.CHARGE: {
			if (!tokenData.isWaitingToAttack) {
				tokenData.attackedAt = time;
				tokenData.isWaitingToAttack = true;
				result.self!.setVelocity = [0, 0];
				// this.scene.addFadingLabel(
				// 	'Charge!',
				// 	FadingLabelSize.NORMAL,
				// 	'#ff0000',
				// 	x,
				// 	y,
				// 	1000
				// );
			}
			const chargeTime = tokenData.enemyData.meleeAttackData?.chargeTime || 1;
			if (tokenData.attackedAt + chargeTime > time && !tokenData.isCharging) {
				if (DEBUG_ENEMY_AI) {
					result.self!.addFadingLabel = {
						text: 'Preparing Charge',
						size: FadingLabelSize.NORMAL,
						color: '#ff0000',
						x: x,
						y: y,
						timeMs: 1000,
					};
				}
				const tx = tokenData.targetStateObject!.x * SCALE;
				const ty = tokenData.targetStateObject!.y * SCALE;
				const xSpeed = tx - x;
				const ySpeed = ty - y;
				const newFacing = getFacing4Dir(xSpeed, ySpeed);
				// 9 frames, so 9 frame rate for 1s.
				if (tokenData.attackedAt === time || stateObject.currentFacing !== newFacing) {
					const attackAnimationName = `${tokenData.tokenName}-${
						tokenData.enemyData.meleeAttackData!.animationName
					}-${facingToSpriteNameMap[newFacing]}`;
					result.self!.playAnimation = {
						key: attackAnimationName,
						frameRate: NORMAL_ANIMATION_FRAME_RATE,
						progress: (time - tokenData.attackedAt) / chargeTime,
					};
					stateObject.currentFacing = newFacing;
				}
				tokenData.isCharging = true;
				tokenData.isWaitingToAttack = false;
			} else if (tokenData.attackedAt + chargeTime <= time && !tokenData.isWaitingToDealDamage) {
				if (DEBUG_ENEMY_AI) {
					result.self!.addFadingLabel = {
						text: 'Charging',
						size: FadingLabelSize.NORMAL,
						color: '#ff0000',
						x: x,
						y: y,
						timeMs: 1000,
					};
				}
				const chargeSpeed =
					tokenData.enemyData.meleeAttackData?.chargeSpeed || tokenData.enemyData.movementSpeed;
				const tx = tokenData.targetStateObject!.x * SCALE;
				const ty = tokenData.targetStateObject!.y * SCALE;
				const speeds = getXYfromTotalSpeed(y - ty, x - tx);
				const xSpeed = speeds[0] * chargeSpeed * stateObject.slowFactor * SCALE;
				const ySpeed = speeds[1] * chargeSpeed * stateObject.slowFactor * SCALE;
				const newFacing = getFacing4Dir(xSpeed, ySpeed);
				const attackAnimationName = `${tokenData.tokenName}-${
					tokenData.enemyData.meleeAttackData!.animationName
				}-${facingToSpriteNameMap[newFacing]}`;
				result.self!.playAnimation = {
					key: attackAnimationName,
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
					startFrame: 8,
				};
				tokenData.chargeX = xSpeed;
				tokenData.chargeY = ySpeed;
				result.self!.setVelocity = [xSpeed, ySpeed];
				tokenData.isWaitingToDealDamage = true;
			}
			break;
		}
	}
	if (Object.keys(result.self!).length === 0) {
		delete result.self;
	}
	return result;
}

export function dealMeleeDamage(
	tokenData: EnemyTokenData,
	stateObject: Character,
	x: number,
	y: number
): AiStepResult {
	const result: AiStepResult = {
		self: {},
		target: {},
	};

	tokenData.isWaitingToDealDamage = false;
	const distance = getDistanceToWorldStatePosition(
		x,
		y,
		tokenData.targetStateObject!.x,
		tokenData.targetStateObject!.y
	);
	// If target is in attack range, attack and deal damage
	if (distance < tokenData.enemyData!.meleeAttackData!.attackRange) {
		// const targetToken = this.scene.getTokenForStateObject(tokenData.targetStateObject!);
		result.target!.takeDamage = stateObject.damage;
		result.target!.receiveHit = true;
		if (DEBUG_ENEMY_AI) {
			result.self!.addFadingLabel = {
				text: 'Dealing Damage',
				size: FadingLabelSize.NORMAL,
				color: '#ff0000',
				x,
				y,
				timeMs: 1000,
			};
		}
	}
	return result;
}

export function handleMeleeAttack(
	tokenData: EnemyTokenData,
	stateObject: Character,
	x: number,
	y: number,
	bodyX: number,
	bodyY: number,
	time: number,
	scene?: MainScene
): AiStepResult {
	const distance = getDistanceToWorldStatePosition(
		x,
		y,
		tokenData.targetStateObject!.x,
		tokenData.targetStateObject!.y
	);

	// Deal damage for the currently running attack
	if (
		tokenData.isWaitingToDealDamage &&
		tokenData.enemyData?.meleeAttackData?.attackType === MeleeAttackType.HIT
	) {
		if (tokenData.attackedAt + tokenData.enemyData?.meleeAttackData!.attackDamageDelay < time) {
			return dealMeleeDamage(tokenData, stateObject, x, y);
		}
		return {};
	}

	// If we are still in the cooldown period of the current attack, do nothing
	if (tokenData.attackedAt + stateObject.attackTime >= time) {
		return {};
	}

	// When token is in the proximity of the target, and target is alive, attack
	if (
		distance <= tokenData.enemyData!.meleeAttackData!.attackRange &&
		tokenData.targetStateObject!.health > 0
	) {
		return executeMeleeAttack(tokenData, stateObject, x, y, time);
	} else {
		// Handle moving the token towards the enemy
		return handleTokenMovement(tokenData, stateObject, bodyX, bodyY, scene);
	}
}
