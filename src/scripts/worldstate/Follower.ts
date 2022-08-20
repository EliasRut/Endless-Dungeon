import { AbilityType } from '../abilities/abilityData';
import { Faction } from '../helpers/constants';
import Character from './Character';

export default class Follower extends Character {
	public abilityCastTime = [-Infinity, -Infinity, -Infinity, -Infinity];
	public level: number;
	public ability: AbilityType;

	constructor(
		id: string,
		animationBase: string,
		health: number = 100,
		damage: number = 10,
		movementSpeed: number = 100,
		level: number = 1,
		ability: AbilityType
	) {
		super(id, animationBase, health, damage, movementSpeed);

		this.level = level;
		this.ability = ability;
		this.faction = Faction.ALLIES;
	}
}
