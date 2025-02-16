import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const IceSpike: AbilityData = {
	projectiles: 1,
	projectileData: {
		velocity: 400,
		xOffset: 16,
		yOffset: 16,
		particleData: {
			particleImage: 'ice',
			alpha: { start: 1, end: 0.4 },
			scale: { start: 1, end: 0.2 },
			speed: 20,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 200, max: 400 },
		},
		effect: TrailingParticleProjectileEffect,
		collisionSound: 'sound-icespike-hit',
		sfxVolume: 0.2,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		explodeOnDestruction: true,
	},
	sound: 'sound-icespike',
	sfxVolume: 0.3,
	coolDownMs: 400,
	damageMultiplier: 0.8,
	iceStacks: 1,
	abilityName: 'Ice Spike',
	flavorText: `A pointy icespike. Although it is generally used to impale the caster's adversaries, it has many alternative uses. Such as cooling drinks... or cooling anything, really.`,
	icon: ['icon-abilities', 1],
};
