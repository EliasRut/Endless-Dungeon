import TrailingParticleProjectileEffect from '../../game/phaser/drawables/effects/TrailingParticleProjectileEffect';
import { AbilityData } from '../../types/AbilityData';

export const HailOfFlames: AbilityData = {
	projectiles: 13,
	projectileData: {
		spread: [-0.07, 0.07, (num: number) => Math.sin(num * Math.PI * 0.95)],
		delay: 50,
		velocity: 150,
		effectScale: 0.8,
		xOffset: 0,
		yOffset: 0,
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
		targeting: true,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		explodeOnDestruction: true,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.1,
	coolDownMs: 3000,
	damageMultiplier: 0.6,
	abilityName: 'Hail of Flames',
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 0],
};
