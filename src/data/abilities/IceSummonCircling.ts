import IceCirclingEffect from '../../game/phaser/drawables/effects/IceCirclingEffect';
import { AbilityData } from '../../types/AbilityData';

export const IceSummonCircling: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 36,
		yOffset: 36,
		velocity: 0,
		effect: IceCirclingEffect,
		collisionSound: 'sound-icespike-hit',
		sfxVolume: 0.2,
		destroyOnEnemyContact: false,
		destroyOnWallContact: false,
		passThroughEnemies: true,
		targeting: true,
	},
	sound: 'sound-icespike',
	sfxVolume: 0.3,
	coolDownMs: 1500,
	damageMultiplier: 0.0,
	abilityName: 'Summon Fire Elemental',
	flavorText: `Raise an icy elemental.`,
	icon: ['icon-abilities', 0],
};
