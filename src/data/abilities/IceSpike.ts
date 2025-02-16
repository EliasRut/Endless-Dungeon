import IceSpikeEffect from '../../game/phaser/drawables/effects/IceSpikeEffect';
import { AbilityData } from '../../types/AbilityData';

export const IceSpike: AbilityData = {
	projectiles: 1,
	projectileData: {
		velocity: 400,
		xOffset: 16,
		yOffset: 16,
		effect: IceSpikeEffect,
		collisionSound: 'sound-icespike-hit',
		sfxVolume: 0.2,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		explodeOnDestruction: true,
	},
	sound: 'sound-icespike',
	sfxVolume: 0.3,
	coolDownMs: 400,
	damageMultiplier: 0.8,
	iceStacks: 1,
	abilityName: 'Ice Spike',
	flavorText: `A pointy icespike. Although it is generally used to impale the caster's adversaries, it has many alternative uses. Such as cooling drinks... or cooling anything, really.`,
	icon: ['icon-abilities', 1],
};
