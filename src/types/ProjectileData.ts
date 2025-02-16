import AbilityEffect from '../game/phaser/drawables/effects/AbilityEffect';
import {
	ColorEffectValue,
	MinMaxParticleEffectValue,
	SimpleParticleEffectValue,
	SpreadData,
} from './AbilityType';

export interface ProjectileParticleData {
	particleImage?: string;
	alpha?: SimpleParticleEffectValue;
	scale?: SimpleParticleEffectValue;
	speed?: SimpleParticleEffectValue;
	rotate?: SimpleParticleEffectValue;
	lifespan?: MinMaxParticleEffectValue;
	frequency?: number;
	maxParticles?: number;
	tint?: ColorEffectValue;
}

export interface ProjectileParticleExplosionData {
	particles?: number;
	speed?: SimpleParticleEffectValue;
	lifespan?: MinMaxParticleEffectValue;
}
export interface ProjectileData {
	projectileImage?: string;
	particleData?: ProjectileParticleData;
	explosionData?: ProjectileParticleExplosionData;
	spread?: SpreadData;
	velocity: number;
	drag?: number;
	effectScale?: number;
	spriteScale?: number;
	xOffset: number;
	yOffset: number;
	effect: typeof AbilityEffect;
	collisionSound?: string;
	sfxVolume?: number;
	delay?: number;
	targeting?: boolean;
	inverseAllowedTargets?: boolean;
	knockback?: number;
	timeToLive?: number;
	destroyOnEnemyContact: boolean;
	destroyOnWallContact: boolean;
	explodeOnDestruction?: boolean;
	passThroughEnemies?: boolean;
	acquisitionSpeed?: number;
	acquisitionDistance?: number;
	seekingSpeed?: number;
	seekingTimeOffset?: number;
	shape?: 'source' | 'storm' | 'cone' | 'nova';
	lightingStrength?: number;
	lightingRadius?: number;
}
