import { AbilityType } from '../abilities/abilityData';
import { AbilityKey, Faction } from '../helpers/constants';
import Character from './Character';
import MainScene from '../scenes/MainScene';

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter extends Character {
	public x = 0;
	public y = 0;

	public abilityCastTime = [-Infinity, -Infinity, -Infinity, -Infinity];

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
		[AbilityKey.FIVE]: AbilityType.NOTHING,
	};
}
export const updateAbility = (
	scene: MainScene,
	player: PlayerCharacter,
	abilityKey: AbilityKey,
	ability: AbilityType
) => {
	if (abilityKey === AbilityKey.FIVE) return;
	player.abilityKeyMapping[abilityKey] = ability;
	scene.avatar.updateAbility(abilityKey, ability);
};
