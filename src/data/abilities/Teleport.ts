import TeleportEffect from '../../game/phaser/drawables/effects/TeleportEffect';
import { AbilityData } from '../../types/AbilityData';

export const Teleport: AbilityData = {
	projectiles: 1,
	projectileData: {
		xOffset: 0,
		yOffset: 0,
		velocity: 0,
		effect: TeleportEffect,
		collisionSound: 'sound-fireball-explosion',
		sfxVolume: 0.2,
		destroyOnEnemyContact: false,
		destroyOnWallContact: false,
		targeting: false,
	},
	sound: 'sound-fireball',
	sfxVolume: 0.3,
	coolDownMs: 1500,
	damageMultiplier: 0.0,
	abilityName: 'Summon Fire Elemental',
	flavorText: `Raise an fiery elemental.`,
	icon: ['icon-abilities', 0],
	castingTime: 50,
};
