import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const Fireball: AbilityData = {
	projectiles: 1,
	projectileData: {
		velocity: 300,
		xOffset: 0,
		yOffset: 0,
		projectileImage: 'empty-tile',
		particleData: {
			particleImage: 'fire',
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
		targeting: true,
		seekingSpeed: 0,
		lightingStrength: 8,
		lightingRadius: 6,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.1,
	coolDownMs: 500,
	damageMultiplier: 1,
	abilityName: 'Fireball',
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 0],
	castingTime: 250,
	increaseComboCast: true,
};
