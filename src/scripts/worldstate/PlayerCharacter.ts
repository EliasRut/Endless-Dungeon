import { AbilityType } from '../abilities/abilityData';
import { AbilityKey, Faction } from '../helpers/constants';
import Character from './Character';

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter extends Character {
	public x = 0;
	public y = 0;

	public abilityCastTime = [
		-Infinity,
		-Infinity,
		-Infinity,
		-Infinity
	];

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

	public updatePrimary(primaryAbility:string) {
		this.abilityKeyMapping[0] = primaryAbility as AbilityType;
	}
}