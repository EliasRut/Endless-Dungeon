import Character from '../../../../../types/Character';
import { EnemyTokenData } from '../../../../../types/EnemyTokenData';
import { handleCollision } from '../handleCollision';

describe('handleCollision', () => {
	test('does nothing if token is not currently charging', () => {
		expect(
			handleCollision(
				{ isWaitingToDealDamage: true, isCharging: false } as unknown as EnemyTokenData,
				{} as Character,
				0,
				0,
				false
			)
		).toEqual({});
	});

	test('does nothing if token is not waiting to deal damage', () => {
		expect(
			handleCollision(
				{ isWaitingToDealDamage: false, isCharging: true } as unknown as EnemyTokenData,
				{} as Character,
				0,
				0,
				false
			)
		).toEqual({});
	});

	test('applies stun to self on collision with something but an enemy', () => {
		expect(
			handleCollision(
				{
					isWaitingToDealDamage: true,
					isCharging: true,
					tokenName: 'test',
					enemyData: { meleeAttackData: { wallCollisionStunDuration: 1000 } },
				} as unknown as EnemyTokenData,
				{} as Character,
				0,
				0,
				false
			)
		).toEqual({
			self: {
				playAnimation: {
					chain: {
						key: 'test-shake-s',
						repeat: 3,
					},
					frameRate: 60,
					key: 'test-stun-s',
					repeat: 2,
				},
				receiveStunMs: 1000,
				setVelocity: [0, 0],
			},
		});
	});

	test('applies stun to self and enemy on a collision with an enemy', () => {
		expect(
			handleCollision(
				{
					isWaitingToDealDamage: true,
					isCharging: true,
					tokenName: 'test',
					enemyData: { meleeAttackData: { enemyCollisionStunDuration: 500 } },
					targetStateObject: {},
				} as unknown as EnemyTokenData,
				{} as Character,
				0,
				0,
				true
			)
		).toEqual({
			self: {
				playAnimation: {
					chain: {
						key: 'test-shake-s',
						repeat: 3,
					},
					frameRate: 60,
					key: 'test-stun-s',
					repeat: 0,
				},
				receiveStunMs: 500,
				setVelocity: [0, 0],
			},
			target: {
				receiveHit: true,
				receiveStunMs: 500,
				takeDamage: undefined,
			},
		});
	});
});
