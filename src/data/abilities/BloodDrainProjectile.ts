import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const BloodDrainProjectile: AbilityData = {
	projectiles: 1,
	projectileData: {
		velocity: 500,
		xOffset: 0,
		yOffset: 0,
		projectileImage: 'empty-tile',
		particleData: {
			particleImage: 'fire',
			alpha: { start: 0.4, end: 0 },
			scale: { start: 1, end: 0.2 },
			speed: 20,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 200, max: 400 },
		},
		effect: TrailingParticleProjectileEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
		destroyOnEnemyContact: true,
		destroyOnWallContact: false,
		explodeOnDestruction: false,
		passThroughEnemies: true,
		targeting: true,
		inverseAllowedTargets: true,
		seekingSpeed: 300,
		lightingStrength: 8,
		lightingRadius: 6,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.1,
	coolDownMs: 500,
	healingMultiplier: 1,
	abilityName: 'Fireball',
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 0],
	castingTime: 250,
	useExactTargetVector: true,
	increaseComboCast: false,
};
