import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const Charm: AbilityData = {
	projectiles: 1,
	projectileData: {
		velocity: 300,
		xOffset: 0,
		yOffset: 0,
		projectileImage: 'empty-tile',
		particleData: {
			particleImage: 'snow',
			alpha: { start: 1, end: 0 },
			scale: { start: 1, end: 0.2 },
			speed: 20,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 200, max: 400 },
		},
		effect: TrailingParticleProjectileEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		explodeOnDestruction: true,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.1,
	coolDownMs: 250,
	damageMultiplier: 0.2,
	abilityName: 'Charm',
	flavorText: `The Enemy falls in love^^`,
	icon: ['icon-abilities', 0],
};
