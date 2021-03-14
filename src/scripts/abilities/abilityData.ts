import AbilityEffect from '../drawables/effects/AbilityEffect';
import FireBallEffect from '../drawables/effects/FireBallEffect';
import IceSpikeEffect from '../drawables/effects/IceSpikeEffect';
import DustNovaEffect from '../drawables/effects/DustNovaEffect';
import RoundHouseKickEffect from '../drawables/effects/RoundHouseKickEffect';
import HealingLightEffect from '../drawables/effects/HealingLightEffect';

interface ProjectileData {
	spread?: [number, number];
	velocity: number;
	drag?: number;
	xOffset: number;
	yOffset: number;
	effect: typeof AbilityEffect;
	collisionSound?: string;
	sfxVolume?: number;
	delay?: number;
}

interface AbilityData {
	projectiles?: number;
	projectileData?: ProjectileData;
	sound?: string;
	sfxVolume?: number;
	cooldownMs?: number;
	flavorText?: string;
	damageMultiplier: number;
}

export const enum AbilityType {
	FIREBALL = 'fireball',
	ICESPIKE = 'icespike',
	DUSTNOVA = 'dustnova',
	ROUND_HOUSE_KICK = 'roundhousekick',
	HEALING_LIGHT = 'healinglight',
}

export const Abilities: {[type: string]: AbilityData} = {
	[AbilityType.FIREBALL]: {
		projectiles: 1,
		projectileData: {
			velocity: 300,
			xOffset: 32,
			yOffset: 32,
			effect: FireBallEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.10,
		cooldownMs: 400,
		damageMultiplier: 1,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`
	},
	[AbilityType.ICESPIKE]: {
		projectiles: 1,
		projectileData: {
			velocity: 400,
			xOffset: 16,
			yOffset: 16,
			effect: IceSpikeEffect,
			collisionSound: 'sound-icespike-hit',
			sfxVolume: 0.2
		},
		sound: 'sound-icespike',
		sfxVolume: 0.3,
		cooldownMs: 1200,
		damageMultiplier: 0.75,
	},
	[AbilityType.DUSTNOVA]: {
		projectiles: 32,
		projectileData: {
			spread: [-1, 1],
			velocity: 150,
			// drag: 200,
			xOffset: 20,
			yOffset: 20,
			effect: DustNovaEffect,
			// collisionSound: 'sound-wind',
			// sfxVolume: 0.4
		},
		sound: 'sound-wind',
		sfxVolume: 1.4,
		cooldownMs: 1200,
		damageMultiplier: 0.05,
	},
	[AbilityType.ROUND_HOUSE_KICK]: {
		projectiles: 16,
		projectileData: {
			// tslint:disable-next-line: no-magic-numbers
			spread: [-0.4, 0.4],
			velocity: 50,
			xOffset: 25,
			yOffset: 25,
			effect: RoundHouseKickEffect,
			delay: 12,
			// collisionSound: 'sound-wind',
			// sfxVolume: 0.4
		},
		sound: 'sound-wind',
		sfxVolume: 1.4,
		cooldownMs: 1200,
		damageMultiplier: 0.1,
	},
	[AbilityType.HEALING_LIGHT]: {
		projectiles: 1,
		projectileData: {
			velocity: 0,
			xOffset: 0,
			yOffset: 0,
			effect: HealingLightEffect,
			// collisionSound: 'sound-wind',
			// sfxVolume: 0.4
		},
		sound: 'sound-wind',
		sfxVolume: 1.4,
		cooldownMs: 1200,
		damageMultiplier: 1,
	}
};