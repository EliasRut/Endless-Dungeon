import IceSpikeEffect from '../../game/phaser/drawables/effects/IceSpikeEffect';
import { AbilityData } from '../../types/AbilityData';

export const IceCone: AbilityData = {
	projectiles: 12,
	projectileData: {
		spread: [-0.14, 0.14],
		velocity: 400,
		drag: 700,
		xOffset: 0,
		yOffset: 0,
		effect: IceSpikeEffect,
		collisionSound: 'sound-icespike-hit',
		sfxVolume: 0.2,
		timeToLive: 500,
		spriteScale: 0.5,
		targeting: false,
		destroyOnWallContact: false,
		destroyOnEnemyContact: false,
		explodeOnDestruction: false,
		passThroughEnemies: true,
		knockback: 100,
		shape: 'cone',
	},
	sound: 'sound-icespike',
	sfxVolume: 0.1,
	coolDownMs: 1500,
	damageMultiplier: 0.7,
	iceStacks: 1,
	abilityName: `Ice Cone`,
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 1],
};
