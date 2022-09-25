import { ColorsOfMagic } from '../helpers/constants';

export interface EnemyData {
	startingHealth: number;
	damage: number;
	movementSpeed: number;
	attackRange: number;
	itemDropChance: number;
	healthPotionDropChance: number;

	category: EnemyCategory;
	color: ColorsOfMagic;

	isMeleeEnemy: boolean;
	isRangedEnemy: boolean;

	spawnAnimationTime?: number;
	useSpawnAnimation?: boolean;
	spawnOnVisible?: boolean;

	// Melee Attack Data
	meleeAttackData?: MeleeAttackData;
}

export enum EnemyCategory {
	BOSS = 'boss',
	ELITE = 'elite',
	NORMAL = 'normal',
}

export enum MeleeAttackType {
	CHARGE = 'charge',
	HIT = 'hit',
}

export interface MeleeAttackData {
	attackDamageDelay: number;
	attackType: MeleeAttackType;
	animationName: string;

	chargeTime?: number;
	chargeSpeed?: number;

	wallCollisionStunDuration?: number;
	enemyCollisionStunDuration?: number;
}
