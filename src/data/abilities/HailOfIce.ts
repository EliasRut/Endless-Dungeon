import IceSpikeEffect from '../../game/phaser/drawables/effects/IceSpikeEffect';
import { AbilityData } from '../../types/AbilityData';

export const HailOfIce: AbilityData = {
	projectiles: 13,
	projectileData: {
		spread: [-0.07, 0.07, (num: number) => Math.sin(num * Math.PI * 0.95)],
		delay: 50,
		velocity: 350,
		spriteScale: 0.5,
		effectScale: 0.5,
		xOffset: 0,
		yOffset: 0,
		effect: IceSpikeEffect,
		collisionSound: 'sound-icespike-hit',
		sfxVolume: 0.2,
		targeting: true,
		destroyOnEnemyContact: true,
		destroyOnWallContact: true,
		explodeOnDestruction: true,
	},
	sound: 'sound-icespike',
	sfxVolume: 0.3,
	coolDownMs: 3000,
	damageMultiplier: 0.5,
	iceStacks: 1,
	abilityName: 'Hail of Ice',
	flavorText: `A pointy ice spike. Although it is generally used to impale the caster's adversaries, it has many alternative uses. Such as cooling drinks... or cooling anything, really.`,
	icon: ['icon-abilities', 1],
};
