import FireSummoningEffect from '../../game/phaser/drawables/effects/FireSummoningEffect';
import { AbilityData } from '../../types/AbilityData';

export const FireSummonElemental: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 0,
		yOffset: 0,
		velocity: 0,
		effect: FireSummoningEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
		destroyOnEnemyContact: false,
		destroyOnWallContact: false,
		targeting: true,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.3,
	coolDownMs: 1500,
	damageMultiplier: 0.0,
	abilityName: 'Summon Fire Elemental',
	flavorText: `Raise an fiery elemental.`,
	icon: ['icon-abilities', 0],
};
