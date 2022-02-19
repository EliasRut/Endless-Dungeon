import AbilityEffect from '../drawables/effects/AbilityEffect';
import FireBallEffect from '../drawables/effects/FireBallEffect';
import IceSpikeEffect from '../drawables/effects/IceSpikeEffect';
import DustNovaEffect from '../drawables/effects/DustNovaEffect';
import RoundHouseKickEffect from '../drawables/effects/RoundHouseKickEffect';
import HealingLightEffect from '../drawables/effects/HealingLightEffect';
import ArcaneBoltEffect from '../drawables/effects/ArcaneBoltEffect';
import ConeEffect from '../drawables/effects/ConeEffect';
import NecroticBoltEffect from '../drawables/effects/NecroticBoltEffect';
import BatEffect from '../drawables/effects/BatEffect';

export type SpreadData = [number, number, ((factor: number) => number)?];

export interface ProjectileData {
	spread?: SpreadData;
	velocity: number;
	drag?: number;
	effectScale?: number;
	spriteScale?: number;
	xOffset: number;
	yOffset: number;
	effect: typeof AbilityEffect;
	collisionSound?: string;
	sfxVolume?: number;
	delay?: number;
	targeting?: boolean;
	knockback?: number;
	timeToLive?: number;
	destroyOnEnemyContact: boolean;
	destroyOnWallContact: boolean;
	explodeOnDestruction?: boolean;
	passThroughEnemies?: boolean;
	shape?: 'source' | 'storm' | 'cone' | 'nova';
}

interface AbilityData {
	projectiles?: number;
	projectileData?: ProjectileData;
	sound?: string;
	sfxVolume?: number;
	cooldownMs?: number;
	abilityName: string;
	flavorText: string;
	icon?: [string, number];
	damageMultiplier: number;
	stun?: number;
	necroticStacks?: number;
	iceStacks?: number;
	castOnEnemyDestroyed?: AbilityType;
	spriteName?: string;
}

export const enum AbilityType {
	NOTHING = 'nothing',
	FIREBALL = 'fireball',
	ARCANE_BOLT = 'arcaneBolt',
	HAIL_OF_DEATH = 'hailOfDeath',
	HAIL_OF_BOLTS = 'hailOfBolts',
	HAIL_OF_FLAMES = 'hailOfFlames',
	HAIL_OF_ICE = 'hailOfIce',
	ICESPIKE = 'icespike',
	DUSTNOVA = 'dustnova',
	ROUND_HOUSE_KICK = 'roundhousekick',
	HEALING_LIGHT = 'healinglight',
	ARCANE_BLADE = 'arcaneBlade',
	FIRE_CONE = 'fireCone',
	FIRE_NOVA = 'fireNova',
	ARCANE_CONE = 'arcaneCone',
	ARCANE_NOVA = 'arcaneNova',
	ICE_CONE = 'iceCone',
	ICE_NOVA = 'iceNova',
	NECROTIC_BOLT = 'necroticBolt',
	NECROTIC_CONE = 'necroticCone',
	NECROTIC_NOVA = 'necroticNova',
	EXPLODING_CORPSE = 'explodingCorpse',
	BAT = 'bat',
}

export const Abilities: { [type: string]: AbilityData } = {
	[AbilityType.NOTHING]: {
		projectiles: 0,
		cooldownMs: 0,
		damageMultiplier: 0,
		abilityName: 'No ability',
		flavorText: ``,
		icon: ['icon-abilities', 2],
	},
	[AbilityType.FIREBALL]: {
		projectiles: 1,
		projectileData: {
			velocity: 300,
			xOffset: 0,
			yOffset: 0,
			effect: FireBallEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			destroyOnEnemyContact: true,
			destroyOnWallContact: true,
			explodeOnDestruction: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 250,
		damageMultiplier: 1,
		//stun: 3000,
		abilityName: 'Fireball',
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
		castOnEnemyDestroyed: AbilityType.EXPLODING_CORPSE,
	},
	[AbilityType.ARCANE_BOLT]: {
		projectiles: 1,
		projectileData: {
			velocity: 450,
			xOffset: 0,
			yOffset: 0,
			effect: ArcaneBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			knockback: 120,
			destroyOnEnemyContact: true,
			destroyOnWallContact: true,
			explodeOnDestruction: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 250,
		damageMultiplier: 0.8,
		abilityName: 'Arcane Bolt',
		flavorText: `Shooting magic missiles!`,
		icon: ['icon-abilities', 1],
	},
	[AbilityType.HAIL_OF_BOLTS]: {
		projectiles: 13,
		projectileData: {
			spread: [-0.07, 0.07, (num) => Math.sin(num * Math.PI * 0.95)],
			velocity: 350,
			delay: 50,
			xOffset: 0,
			yOffset: 0,
			effect: ArcaneBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			targeting: true,
			knockback: 200,
			destroyOnEnemyContact: true,
			destroyOnWallContact: true,
			explodeOnDestruction: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 3000,
		damageMultiplier: 0.25,
		abilityName: 'Hail of Bolts',
		flavorText: `Shooting magic missiles!`,
		icon: ['icon-abilities', 1],
	},
	[AbilityType.HAIL_OF_FLAMES]: {
		projectiles: 13,
		projectileData: {
			spread: [-0.07, 0.07, (num) => Math.sin(num * Math.PI * 0.95)],
			delay: 50,
			velocity: 150,
			effectScale: 0.8,
			xOffset: 0,
			yOffset: 0,
			effect: FireBallEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			targeting: true,
			destroyOnEnemyContact: true,
			destroyOnWallContact: true,
			explodeOnDestruction: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 3000,
		damageMultiplier: 0.33,
		abilityName: 'Hail of Flames',
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.HAIL_OF_ICE]: {
		projectiles: 13,
		projectileData: {
			spread: [-0.07, 0.07, (num) => Math.sin(num * Math.PI * 0.95)],
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
		cooldownMs: 3000,
		// damageMultiplier: 0.01,
		damageMultiplier: 0.25,
		iceStacks: 1,
		abilityName: 'Hail of Ice',
		flavorText: `A pointy icespike. Although it is generally used to impale the caster's adversaries, it has many alternative uses. Such as cooling drinks... or cooling anything, really.`,
		icon: ['icon-abilities', 1],
	},
	[AbilityType.ICESPIKE]: {
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
		cooldownMs: 400,
		// damageMultiplier: 0.01,
		damageMultiplier: 0.8,
		iceStacks: 1,
		abilityName: 'Ice Spike',
		flavorText: `A pointy icespike. Although it is generally used to impale the caster's adversaries, it has many alternative uses. Such as cooling drinks... or cooling anything, really.`,
		icon: ['icon-abilities', 1],
	},
	[AbilityType.ARCANE_BLADE]: {
		projectiles: 50,
		projectileData: {
			spread: [-0.2, 0.2],
			velocity: 200,
			xOffset: 32,
			yOffset: 32,
			effect: ArcaneBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			destroyOnWallContact: true,
			destroyOnEnemyContact: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 400,
		damageMultiplier: 0.2,
		abilityName: `Arcane Blade`,
		flavorText: `A blade of arcane power.`,
		icon: ['icon-abilities', 1],
	},
	[AbilityType.FIRE_CONE]: {
		projectiles: 12,
		projectileData: {
			spread: [-0.14, 0.14],
			velocity: 400,
			drag: 700,
			xOffset: 0,
			yOffset: 0,
			effect: FireBallEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			timeToLive: 500,
			effectScale: 1.2,
			targeting: false,
			destroyOnWallContact: false,
			destroyOnEnemyContact: false,
			explodeOnDestruction: false,
			passThroughEnemies: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 1500,
		damageMultiplier: 0.2,
		abilityName: `Fire Cone`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.ARCANE_CONE]: {
		projectiles: 12,
		projectileData: {
			spread: [-0.14, 0.14],
			velocity: 400,
			drag: 700,
			xOffset: 0,
			yOffset: 0,
			effect: ArcaneBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			timeToLive: 500,
			effectScale: 1.2,
			targeting: false,
			destroyOnWallContact: false,
			destroyOnEnemyContact: false,
			explodeOnDestruction: false,
			passThroughEnemies: true,
			knockback: 100,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 1500,
		damageMultiplier: 0.15,
		abilityName: `Arcane Cone`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.ICE_CONE]: {
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
		cooldownMs: 1500,
		// damageMultiplier: 0.01,
		damageMultiplier: 0.15,
		iceStacks: 1,
		abilityName: `Ice Cone`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 1],
	},
	[AbilityType.NECROTIC_CONE]: {
		projectiles: 12,
		projectileData: {
			spread: [-0.14, 0.14],
			velocity: 400,
			drag: 700,
			xOffset: 0,
			yOffset: 0,
			effect: NecroticBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			timeToLive: 500,
			effectScale: 1.2,
			targeting: false,
			destroyOnWallContact: false,
			destroyOnEnemyContact: false,
			explodeOnDestruction: false,
			passThroughEnemies: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 1500,
		damageMultiplier: 0.2,
		abilityName: `Necrotic Cone`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.ICE_NOVA]: {
		projectiles: 36,
		projectileData: {
			spread: [-1, 1],
			velocity: 300,
			drag: 700,
			xOffset: 0,
			yOffset: 0,
			effect: IceSpikeEffect,
			collisionSound: 'sound-icespike-hit',
			sfxVolume: 0.2,
			timeToLive: 500,
			spriteScale: 0.7,
			effectScale: 0.7,
			targeting: false,
			destroyOnWallContact: false,
			destroyOnEnemyContact: false,
			explodeOnDestruction: false,
			passThroughEnemies: true,
			shape: 'nova',
		},
		sound: 'sound-icespike',
		sfxVolume: 0.1,
		cooldownMs: 1500,
		// damageMultiplier: 0.01,
		damageMultiplier: 0.15,
		iceStacks: 1,
		abilityName: `Ice Nova`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 1],
	},
	[AbilityType.FIRE_NOVA]: {
		projectiles: 36,
		projectileData: {
			spread: [-1, 1],
			velocity: 300,
			drag: 700,
			xOffset: 0,
			yOffset: 0,
			effect: FireBallEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			timeToLive: 500,
			effectScale: 1.2,
			targeting: false,
			destroyOnWallContact: false,
			destroyOnEnemyContact: false,
			explodeOnDestruction: false,
			passThroughEnemies: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 1500,
		damageMultiplier: 0.25,
		abilityName: `Fire Nova`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.EXPLODING_CORPSE]: {
		projectiles: 16,
		projectileData: {
			spread: [-1, 1],
			velocity: 220,
			drag: 800,
			xOffset: 0,
			yOffset: 0,
			effect: FireBallEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			timeToLive: 300,
			effectScale: 1.2,
			targeting: false,
			destroyOnWallContact: false,
			destroyOnEnemyContact: false,
			explodeOnDestruction: false,
			passThroughEnemies: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 1500,
		damageMultiplier: 0.15,
		abilityName: `Fire Nova`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.ARCANE_NOVA]: {
		projectiles: 36,
		projectileData: {
			spread: [-1, 1],
			velocity: 300,
			drag: 700,
			xOffset: 0,
			yOffset: 0,
			effect: ArcaneBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			timeToLive: 500,
			effectScale: 1.2,
			targeting: false,
			destroyOnWallContact: false,
			destroyOnEnemyContact: false,
			explodeOnDestruction: false,
			passThroughEnemies: true,
			knockback: 100,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 1500,
		damageMultiplier: 0.15,
		abilityName: `Arcane Nova`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.NECROTIC_BOLT]: {
		projectiles: 1,
		projectileData: {
			velocity: 300,
			xOffset: 0,
			yOffset: 0,
			effect: NecroticBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			destroyOnEnemyContact: true,
			destroyOnWallContact: true,
			explodeOnDestruction: true,
		},
		sound: 'sound-icespike',
		sfxVolume: 0.1,
		cooldownMs: 250,
		damageMultiplier: 1,
		// damageMultiplier: 0.01,
		necroticStacks: 1,
		abilityName: `Necrotic Bolt`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.NECROTIC_NOVA]: {
		projectiles: 36,
		projectileData: {
			spread: [-1, 1],
			velocity: 300,
			drag: 700,
			xOffset: 0,
			yOffset: 0,
			effect: NecroticBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			timeToLive: 500,
			effectScale: 1.2,
			targeting: false,
			destroyOnWallContact: false,
			destroyOnEnemyContact: false,
			explodeOnDestruction: false,
			passThroughEnemies: true,
		},
		sound: 'sound-icespike',
		sfxVolume: 0.1,
		cooldownMs: 1500,
		necroticStacks: 1,
		damageMultiplier: 0.25,
		abilityName: `Necrotic Nova`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.HAIL_OF_DEATH]: {
		projectiles: 13,
		projectileData: {
			spread: [-0.07, 0.07, (num) => Math.sin(num * Math.PI * 0.95)],
			delay: 50,
			velocity: 350,
			effectScale: 0.8,
			xOffset: 0,
			yOffset: 0,
			effect: NecroticBoltEffect,
			collisionSound: 'sound-fireball-explosion',
			sfxVolume: 0.2,
			targeting: true,
			destroyOnEnemyContact: true,
			destroyOnWallContact: true,
			explodeOnDestruction: true,
		},
		sound: 'sound-fireball',
		sfxVolume: 0.1,
		cooldownMs: 3000,
		damageMultiplier: 0.33,
		abilityName: `Hail of Death`,
		flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
		icon: ['icon-abilities', 0],
	},
	[AbilityType.BAT]: {
		projectiles: 1,
		projectileData: {
			// velocity: 0,
			xOffset: 16,
			yOffset: 16,
			velocity: 100,
			// xOffset: 16,
			// yOffset: 16,
			effect: BatEffect,
			// effect: FireBallEffect,
			collisionSound: 'sound-icespike-hit',
			sfxVolume: 0.2,
			destroyOnEnemyContact: true,
			destroyOnWallContact: true,
			targeting: true,
		},
		sound: 'sound-icespike',
		sfxVolume: 0.3,
		cooldownMs: 400,
		damageMultiplier: 0.0,
		abilityName: 'Angry Bat',
		flavorText: `An angry bat.`,
		icon: ['icon-abilities', 1],
		spriteName: 'bat',
	},
};
