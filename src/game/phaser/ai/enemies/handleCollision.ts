import Character from '../../../../types/Character';
import { AiStepResult } from '../../../../types/CharacterTokenUpdateEffect';
import { EnemyTokenData } from '../../../../types/EnemyTokenData';
import { facingToSpriteNameMap, NORMAL_ANIMATION_FRAME_RATE } from '../../helpers/constants';
import { getFacing4Dir } from '../../helpers/movement';

export const handleCollision = (
	tokenData: EnemyTokenData,
	stateObject: Character,
	x: number,
	y: number,
	isCollisionWithEnemy: boolean
) => {
	const tokenUpdateEffects: AiStepResult = {};
	if (tokenData.isCharging && tokenData.isWaitingToDealDamage) {
		let stunDuration = tokenData.enemyData?.meleeAttackData?.wallCollisionStunDuration || 0;
		if (isCollisionWithEnemy) {
			stunDuration = tokenData.enemyData?.meleeAttackData?.enemyCollisionStunDuration || 0;
			if (tokenData.isWaitingToDealDamage && tokenData.targetStateObject) {
				tokenUpdateEffects.target = {
					receiveStunMs: stunDuration,
					takeDamage: stateObject.damage,
					receiveHit: true,
				};
				tokenData.isWaitingToDealDamage = false;
			}
		}
		tokenUpdateEffects.self = {
			receiveStunMs: stunDuration,
		};
		const tx = tokenData.targetStateObject?.x || 0;
		const ty = tokenData.targetStateObject?.y || 0;
		const xSpeed = tx - x;
		const ySpeed = ty - y;
		const newFacing = getFacing4Dir(xSpeed, ySpeed);
		const stunAnimation = `${tokenData.tokenName}-stun-${facingToSpriteNameMap[newFacing]}`;
		const recoverAnimation = `${tokenData.tokenName}-shake-${facingToSpriteNameMap[newFacing]}`;
		tokenUpdateEffects.self.setVelocity = [0, 0];
		// 4 repeats per second, at currently 16 fps.
		tokenUpdateEffects.self.playAnimation = {
			key: stunAnimation,
			frameRate: NORMAL_ANIMATION_FRAME_RATE,
			repeat: Math.floor((4 * (stunDuration - 500)) / 1000),
			chain: { key: recoverAnimation, repeat: 3 },
		};
		tokenData.isCharging = false;
		tokenData.attackedAt = -Infinity;
		tokenData.isWaitingToDealDamage = false;
		tokenData.isWaitingToAttack = false;
	}
	return tokenUpdateEffects;
};
