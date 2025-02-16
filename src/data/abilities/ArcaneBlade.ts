import ArcaneBoltEffect from '../../game/phaser/drawables/effects/ArcaneBoltEffect';
import { AbilityData } from '../../types/AbilityData';

export const ArcaneBlade: AbilityData = {
	projectiles: 50,
	projectileData: {
		spread: [-0.2, 0.2],
		velocity: 200,
		xOffset: 32,
		yOffset: 32,
		effect: ArcaneBoltEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
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
