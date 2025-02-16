import { ConditionalAbilityData, EnumDictionary } from '../../typings/custom';
import { AbilityType } from './AbilityType';
import { ProjectileData } from './ProjectileData';

export interface AbilityData {
	// castEffect?: typeof AbilityEffect;
	stopDashBeforeEnemyCollision?: boolean;
	projectiles?: number;
	projectileData?: ProjectileData;
	sound?: string;
	sfxVolume?: number;
	cooldownMs?: number;
	abilityName: string;
	flavorText: string;
	icon?: [string, number];
	damageMultiplier?: number;
	healingMultiplier?: number;
	stun?: number;
	necroticStacks?: number;
	iceStacks?: number;
	castOnEnemyDestroyed?: AbilityType;
	castOnEnemyHit?: AbilityType;
	spriteName?: string;
	castingTime?: number;
	useExactTargetVector?: boolean;
	increaseComboCast?: boolean;
	resetComboCast?: boolean;
	dashSpeed?: number;
	dashDuration?: number;
	dashInvulnerability?: boolean;
	delayProjectiles?: number;
	reverseDash?: boolean;
}

export type ConditionalAbilityDataMap = EnumDictionary<AbilityType, ConditionalAbilityData[]>;

export type AbilityDataMap = EnumDictionary<AbilityType, AbilityData>;
