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

	// Melee Attack Data
	meleeAttackData?: MeleeAttackData;
}

export enum EnemyCategory {
	BOSS = 'boss',
	ELITE = 'elite',
	NORMAL = 'normal',
}

export interface MeleeAttackData {
	attackDamageDelay: number;
}
