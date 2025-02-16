import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const ArcaneBlade: AbilityData = {
	projectiles: 50,
	projectileData: {
		spread: [-0.2, 0.2],
		velocity: 200,
		xOffset: 32,
		yOffset: 32,
		particleData: {
			particleImage: 'rock',
			alpha: { start: 1, end: 0 },
			scale: { start: 1, end: 0.1 },
			speed: 20,
			rotate: { min: -180, max: 180 },
			lifespan: 300,
			tint: {
				blueDiff: 7,
				blueMin: 170,
				greenDiff: 70,
				greenMin: 170,
				redDiff: 70,
				redMin: 0,
			},
		},
		effect: TrailingParticleProjectileEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
		timeToLive: 500,
		spriteScale: 0.5,
		effectScale: 0.5,
		destroyOnWallContact: true,
		destroyOnEnemyContact: true,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.1,
	coolDownMs: 400,
	damageMultiplier: 0.2,
	abilityName: `Arcane Blade`,
	flavorText: `A blade of arcane power.`,
	icon: ['icon-abilities', 1],
};
