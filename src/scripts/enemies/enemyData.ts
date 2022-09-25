import { AbilityType } from '../abilities/abilityData';
import { ColorsOfMagic } from '../helpers/constants';

export interface EnemyData {
	level: number;
	startingHealth: number;
	damage: number;
	movementSpeed: number;
	itemDropChance: number;
	healthPotionDropChance: number;

	category: EnemyCategory;
	color: ColorsOfMagic;

	isMeleeEnemy: boolean;
	isRangedEnemy: boolean;

	// Melee Attack Data
	meleeAttackData?: MeleeAttackData;

	// Ranged Attack Data
	rangedAttackData?: RangedAttackData;
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
	attackRange: number;
	animationName: string;

	chargeTime?: number;
	chargeSpeed?: number;

	wallCollisionStunDuration?: number;
	enemyCollisionStunDuration?: number;
}

export interface RangedAttackData {
	castTime?: number;
	castRange: number;
	animationName: string;

	abilityType: AbilityType;
}
