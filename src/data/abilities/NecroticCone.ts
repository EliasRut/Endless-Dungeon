import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const NecroticCone: AbilityData = {
	projectiles: 12,
	projectileData: {
		spread: [-0.14, 0.14],
		velocity: 400,
		drag: 700,
		xOffset: 0,
		yOffset: 0,
		particleData: {
			particleImage: 'skull',
			alpha: { start: 1, end: 0 },
			scale: { start: 1, end: 0.2 },
			speed: 20,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 200, max: 400 },
		},
		effect: TrailingParticleProjectileEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
		timeToLive: 500,
		effectScale: 1.2,
		targeting: false,
		destroyOnWallContact: false,
		destroyOnEnemyContact: false,
		explodeOnDestruction: false,
		passThroughEnemies: true,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.1,
	coolDownMs: 1500,
	damageMultiplier: 0.2,
	abilityName: `Necrotic Cone`,
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 0],
};
