import AbilityEffect from '../drawables/effects/AbilityEffect';
import FireBallEffect from '../drawables/effects/FireBallEffect';
import IceSpikeEffect from '../drawables/effects/IceSpikeEffect';
import DustNovaEffect from '../drawables/effects/DustNovaEffect';
import RoundHouseKickEffect from '../drawables/effects/RoundHouseKickEffect';
import HealingLightEffect from '../drawables/effects/HealingLightEffect';
import ArcaneBoltEffect from '../drawables/effects/ArcaneBoltEffect';

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
	targeting?: boolean;
	knockback?: number;
}

interface AbilityData {
	projectiles?: number;
	projectileData?: ProjectileData;
	sound?: string;
	sfxVolume?: number;
	cooldownMs?: number;
	flavorText?: string;
	icon?: [string, number];
	damageMultiplier: number;
}

export const enum AbilityType {
	NOTHING = 'nothing',
	FIREBALL = 'fireball',
	ARCANE_BOLT = 'arcaneBolt',
	HAIL_OF_BOLTS = 'hailOfBolts',
	HAIL_OF_FLAMES = 'hailOfFlames',
	HAIL_OF_ICE = 'hailOfIce',
	ICESPIKE = 'icespike',
	DUSTNOVA = 'dustnova',
	ROUND_HOUSE_KICK = 'roundhousekick',
	HEALING_LIGHT = 'healinglight',
	ARCANE_BLADE = 'arcaneBlade',
}

export const Abilities: {[type: string]: AbilityData} = {
	[AbilityType.NOTHING]: {
		projectiles: 0,
		cooldownMs: 0,
		damageMultiplier: 0,
		flavorText: ``,
		icon: ['icon-abilities', 2]
	},
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
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0]
	},
	[AbilityType.ARCANE_BOLT]: {
		projectiles: 1,
		projectileData: {
			velocity: 600,
			xOffset: 8,
			yOffset: 8,
			effect: ArcaneBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			knockback: 200
		},
		sound: 'sound-fireball',
		sfxVolume: 0.10,
		cooldownMs: 400,
		damageMultiplier: 0.8,
		flavorText: `Shooting magic missiles!`,
		icon: ['icon-abilities', 1]
	},
	[AbilityType.HAIL_OF_BOLTS]: {
		projectiles: 5,
		projectileData: {
			spread: [-0.06, 0.07],
			velocity: 600,
			xOffset: 32,
			yOffset: 32,
			effect: ArcaneBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			targeting: true,
			knockback: 200
		},
		sound: 'sound-fireball',
		sfxVolume: 0.10,
		cooldownMs: 1500,
		damageMultiplier: 0.8,
		flavorText: `Shooting magic missiles!`,
		icon: ['icon-abilities', 1]
	},
	[AbilityType.HAIL_OF_FLAMES]: {
		projectiles: 5,
		projectileData: {
			spread: [-0.15, 0.2],
			velocity: 300,
			xOffset: 32,
			yOffset: 32,
			effect: FireBallEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			targeting: true
		},
		sound: 'sound-fireball',
		sfxVolume: 0.10,
		cooldownMs: 1500,
		damageMultiplier: 0.8,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0]
	},
	[AbilityType.HAIL_OF_ICE]: {
		projectiles: 5,
		projectileData: {
			spread: [-0.15, 0.2],
			velocity: 400,
			xOffset: 16,
			yOffset: 16,
			effect: IceSpikeEffect,
			collisionSound: 'sound-icespike-hit',
			sfxVolume: 0.2,
			targeting: true
		},
		sound: 'sound-icespike',
		sfxVolume: 0.3,
		cooldownMs: 1500,
		damageMultiplier: 0.8,
		flavorText: `A pointy icespike. Although it is generally used to impale the caster's adversaries, it has many alternative uses. Such as cooling drinks... or cooling anything, really.`,
		icon: ['icon-abilities', 1]
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
		cooldownMs: 400,
		damageMultiplier: 0.8,
		flavorText: `A pointy icespike. Although it is generally used to impale the caster's adversaries, it has many alternative uses. Such as cooling drinks... or cooling anything, really.`,
		icon: ['icon-abilities', 1]
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
		icon: ['icon-abilities', 2],
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
		icon: ['icon-abilities', 2],
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
		icon: ['icon-abilities', 2],
	},
	[AbilityType.ARCANE_BLADE]: {
		projectiles: 50,
		projectileData: {
			spread: [-0.15, 0.15],
			velocity: 200,
			xOffset: 32,
			yOffset: 32,
			effect: ArcaneBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.10,
		cooldownMs: 400,
		damageMultiplier: 1,
		flavorText: `A blade of arcane power.`,
		icon: ['icon-abilities', 1]
	},
};