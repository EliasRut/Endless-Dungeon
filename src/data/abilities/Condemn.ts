import CondemnEffect from '../../game/phaser/drawables/effects/CondemnEffect';
import { AbilityData } from '../../types/AbilityData';

export const Condemn: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 0,
		yOffset: 0,
		velocity: 300,
		effect: CondemnEffect,
		collisionSound: 'sound-icespike-hit',
		sfxVolume: 0.2,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		targeting: true,
	},
	sound: 'sound-icespike',
	sfxVolume: 0.3,
	coolDownMs: 8000,
	damageMultiplier: 0.5,
	stun: 4000,
	abilityName: 'Condemn',
	flavorText: `An angry shout against your enemy.`,
	icon: ['icon-abilities', 1],
};
