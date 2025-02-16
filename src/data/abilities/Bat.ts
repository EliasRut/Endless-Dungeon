import BatEffect from '../../game/phaser/drawables/effects/BatEffect';
import { AbilityData } from '../../types/AbilityData';

export const Bat: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 16,
		yOffset: 16,
		velocity: 100,
		effect: BatEffect,
		collisionSound: 'sound-icespike-hit',
		sfxVolume: 0.2,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		targeting: true,
	},
	sound: 'sound-icespike',
	sfxVolume: 0.3,
	coolDownMs: 400,
	damageMultiplier: 0.5,
	abilityName: 'Angry Bat',
	flavorText: `An angry bat.`,
	icon: ['icon-abilities', 1],
	spriteName: 'bat',
};
