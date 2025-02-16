import NecroticBoltEffect from '../../game/phaser/drawables/effects/NecroticBoltEffect';
import { AbilityData } from '../../types/AbilityData';

export const NecroticNova: AbilityData = {
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
	coolDownMs: 1500,
	necroticStacks: 1,
	damageMultiplier: 0.25,
	abilityName: `Necrotic Nova`,
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 0],
};
