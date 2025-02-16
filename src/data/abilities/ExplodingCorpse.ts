import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const ExplodingCorpse: AbilityData = {
	projectiles: 16,
	projectileData: {
		spread: [-1, 1],
		velocity: 200,
		drag: 800,
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
		timeToLive: 300,
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
	damageMultiplier: 0.15,
	abilityName: `Fire Nova`,
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 0],
};
