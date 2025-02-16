import IceSummoningEffect from '../../game/phaser/drawables/effects/IceSummoningEffect';
import { AbilityData } from '../../types/AbilityData';

export const IceSummonElemental: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 0,
		yOffset: 0,
		velocity: 0,
		effect: IceSummoningEffect,
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
