import FireCirclingEffect from '../../game/phaser/drawables/effects/FireCirclingEffect';
import { AbilityData } from '../../types/AbilityData';

export const FireSummonCircling: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 36,
		yOffset: 36,
		velocity: 0,
		effect: FireCirclingEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
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
