import NecroticBoltEffect from '../../game/phaser/drawables/effects/NecroticBoltEffect';
import { AbilityData } from '../../types/AbilityData';

export const HailOfDeath: AbilityData = {
	projectiles: 13,
	projectileData: {
		spread: [-0.07, 0.07, (num: number) => Math.sin(num * Math.PI * 0.95)],
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
	coolDownMs: 3000,
	damageMultiplier: 0.33,
	abilityName: `Hail of Death`,
	flavorText: `A big ol' fireball. A classic in every Mage's arsenal, it is typically used to incinerate your enemies. More advanced mages can control it enough to boil water, or cook food!`,
	icon: ['icon-abilities', 0],
};
