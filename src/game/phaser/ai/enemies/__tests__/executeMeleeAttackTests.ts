import Character from '../../../../../types/Character';
import { EnemyTokenData } from '../../../../../types/EnemyTokenData';
import { MeleeAttackType } from '../../../enemies/enemyData';
import { executeMeleeAttack } from '../executeMeleeAttack';

describe('executeMeleeAttack', () => {
	test('does nothing if no meleeAttackData is set', () => {
		expect(executeMeleeAttack({} as unknown as EnemyTokenData, {} as Character, 0, 0, 0)).toEqual(
			{}
		);
	});

	test('works for attackType Hit', () => {
		const tokenData = {
			tokenName: 'testToken',
			enemyData: {
				meleeAttackData: { attackType: MeleeAttackType.HIT, animationName: 'swing' },
			},
			attackedAt: 0,
			targetStateObject: { x: 0, y: 0 },
		} as unknown as EnemyTokenData;
		const character = {
			attackTime: 1000,
		} as Character;

		expect(executeMeleeAttack(tokenData, character, 0, 0, 10000)).toEqual({
			self: {
				playAnimation: {
					frameRate: 60,
					key: 'testToken-swing-s',
				},
				setVelocity: [0, 0],
			},
		});
		expect(tokenData.attackedAt).toBe(10000);
		expect(tokenData.isWaitingToDealDamage).toBe(true);
		expect(character.isWalking).toBe(false);
	});

	test('works for attackType Charge with not currently charging', () => {
		const tokenData = {
			tokenName: 'testToken',
			enemyData: {
				meleeAttackData: { attackType: MeleeAttackType.CHARGE, animationName: 'charge' },
			},
			attackedAt: 0,
			targetStateObject: { x: 0, y: 0 },
		} as unknown as EnemyTokenData;
		expect(
			executeMeleeAttack(
				tokenData,
				{
					attackTime: 1000,
				} as Character,
				0,
				0,
				10000
			)
		).toEqual({
			self: {
				playAnimation: {
					frameRate: 60,
					key: 'testToken-charge-s',
					progress: 0,
				},
				setVelocity: [0, 0],
			},
		});
		expect(tokenData.attackedAt).toBe(10000);
		expect(tokenData.isCharging).toBe(true);
		expect(tokenData.isWaitingToAttack).toBe(false);
	});

	test('works for attackType Charge with not currently charging', () => {
		const tokenData = {
			tokenName: 'testToken',
			enemyData: {
				meleeAttackData: {
					attackType: MeleeAttackType.CHARGE,
					animationName: 'charge',
					chargeSpeed: 200,
				},
			},
			attackedAt: 0,
			targetStateObject: { x: 100, y: 0 },
			isCharging: true,
			isWaitingToAttack: true,
			isWaitingToDealDamage: false,
		} as unknown as EnemyTokenData;
		expect(
			executeMeleeAttack(
				tokenData,
				{
					attackTime: 1000,
					slowFactor: 1,
				} as Character,
				0,
				0,
				10000
			)
		).toEqual({
			self: {
				setVelocity: [600, -0],
				playAnimation: {
					frameRate: 60,
					key: 'testToken-charge-e',
					startFrame: 8,
				},
			},
		});
		expect(tokenData.chargeX).toBe(600);
		expect(tokenData.chargeY).toBe(-0);
		expect(tokenData.isWaitingToDealDamage).toBe(true);
	});
});
