import { AbilityType } from '../abilities/abilityData';
import { AbilityKey, Faction } from '../helpers/constants';
import Character from './Character';
import Item, { ItemStats } from './Item';

const BASE_HEALTH = 100;
const BASE_MOVEMENT_SPEED = 200;

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter extends Character {
	// public itemHealth = 0;
	// public weaponDamage = 1;
	// public itemMovementSpeed = 0;
	public mainStat = 1;
	public slowFactor = 1;

	public x = 0;
	public y = 0;

	public abilityCastTime = [
		-Infinity,
		-Infinity,
		-Infinity,
		-Infinity
	];

	public items: Item[] = [];

	constructor() {
		// tslint:disable-next-line: no-magic-numbers
		super('player', 100, 1, 200);
		this.faction = Faction.PLAYER;
	}

	public abilityKeyMapping = {
		[AbilityKey.ONE]: AbilityType.FIREBALL,
		[AbilityKey.TWO]: AbilityType.ICESPIKE,
		[AbilityKey.THREE]: AbilityType.DUSTNOVA,
		[AbilityKey.FOUR]: AbilityType.ROUND_HOUSE_KICK,
	};

	public updateStats(){
		const healthBeforeUpdate = this.health;
		const maxHealthBeforeUpdate = this.maxHealth;

		const itemStats = this.items.reduce((stats, item) => {
			Object.keys(item).forEach((key) => {
				const typedKey = key as keyof ItemStats;
				stats[typedKey] = (stats[typedKey] || 0) + item[typedKey];
			});
			return stats;
		}, {} as ItemStats);

		this.maxHealth = BASE_HEALTH + (itemStats.maxHealth || 0);
		this.health = healthBeforeUpdate + (this.maxHealth - maxHealthBeforeUpdate);
		this.movementSpeed = BASE_MOVEMENT_SPEED + (itemStats.movementSpeed || 0);
		this.mainStat = 1 + (itemStats.mainStat || 0);
		this.damage = (1 + (itemStats.damage || 0)) * this.mainStat;
	}
}