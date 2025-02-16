import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const Condemn: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 0,
		yOffset: 0,
		velocity: 300,
		particleData: {
			particleImage: 'snow',
			alpha: { start: 1, end: 0 },
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
		targeting: true,
	},
	sound: 'sound-icespike',
	sfxVolume: 0.3,
	coolDownMs: 8000,
	damageMultiplier: 0.5,
	stun: 4000,
	abilityName: 'Condemn',
	flavorText: `An angry shout against your enemy.`,
	icon: ['icon-abilities', 1],
};
