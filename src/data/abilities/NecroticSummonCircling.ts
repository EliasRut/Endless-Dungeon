import NecroticCirclingEffect from '../../game/phaser/drawables/effects/NecroticCirclingEffect';
import { AbilityData } from '../../types/AbilityData';

export const NecroticSummonCircling: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 36,
		yOffset: 36,
		velocity: 0,
		effect: NecroticCirclingEffect,
		collisionSound: 'sound-fireball-hit',
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
	flavorText: `Raise an icy elemental.`,
	icon: ['icon-abilities', 0],
};
