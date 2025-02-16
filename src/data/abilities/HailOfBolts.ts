import ArcaneBoltEffect from '../../game/phaser/drawables/effects/ArcaneBoltEffect';
import { AbilityData } from '../../types/AbilityData';

export const HailOfBolts: AbilityData = {
	projectiles: 13,
	projectileData: {
		spread: [-0.07, 0.07, (num: number) => Math.sin(num * Math.PI * 0.95)],
		velocity: 350,
		delay: 50,
		xOffset: 0,
		yOffset: 0,
		effect: ArcaneBoltEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
		targeting: true,
		knockback: 200,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		explodeOnDestruction: true,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.1,
	coolDownMs: 3000,
	damageMultiplier: 0.25,
	abilityName: 'Hail of Bolts',
	flavorText: `Shooting magic missiles!`,
	icon: ['icon-abilities', 1],
};
