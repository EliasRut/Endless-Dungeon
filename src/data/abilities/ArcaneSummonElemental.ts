import ArcaneSummoningEffect from '../../game/phaser/drawables/effects/ArcaneSummoningEffect';
import { AbilityData } from '../../types/AbilityData';

export const ArcaneSummonElemental: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 0,
		yOffset: 0,
		velocity: 0,
		effect: ArcaneSummoningEffect,
		collisionSound: 'sound-fireball-hit',
		sfxVolume: 0.2,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		passThroughEnemies: true,
		targeting: true,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.3,
	coolDownMs: 1500,
	damageMultiplier: 0.0,
	abilityName: 'Summon Fire Elemental',
	flavorText: `Raise an icy elemental.`,
	icon: ['icon-abilities', 0],
};
