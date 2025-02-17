import NecroticBoltEffect from '../../game/phaser/drawables/effects/NecroticBoltEffect';
import { AbilityData } from '../../types/AbilityData';

export const NecroticBolt: AbilityData = {
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
	coolDownMs: 250,
	damageMultiplier: 1,
	necroticStacks: 1,
	abilityName: `Necrotic Bolt`,
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 0],
};
