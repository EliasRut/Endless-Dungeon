export interface EnemyData {
	startingHealth: number;
	damage: number;
	movementSpeed: number;
	itemDropChance: number;
	healthPotionDropChance: number;

	isStunned: boolean;

	isMeleeEnemy: boolean;
	isRangedEnemy: boolean;

	// Melee Attack Data
	meleeAttackData: MeleeAttackData;
}

export enum SlainEnemy {
	BOSS = 'boss',
	ELITE = 'elite',
	NORMAL = 'normal',
}

export interface MeleeAttackData {
	attackDamageDelay: number;
}
