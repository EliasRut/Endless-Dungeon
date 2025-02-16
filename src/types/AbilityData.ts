import { ConditionalAbilityData, EnumDictionary } from '../../typings/custom';
import AbilityEffect from '../game/phaser/drawables/effects/AbilityEffect';
import { AbilityType } from './AbilityType';
import { ProjectileData } from './ProjectileData';

export interface AbilityData {
	abilityName: string;
	projectiles?: number;
	projectileData?: ProjectileData;
	sound?: string;
	sfxVolume?: number;
	coolDownMs?: number;
	damageMultiplier?: number;
	flavorText: string;
	icon?: [string, number];
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
	stopDashBeforeEnemyCollision?: boolean;
	castEffect?: typeof AbilityEffect;
}

export type ConditionalAbilityDataMap = EnumDictionary<AbilityType, ConditionalAbilityData[]>;

export type AbilityDataMap = EnumDictionary<AbilityType, AbilityData>;
