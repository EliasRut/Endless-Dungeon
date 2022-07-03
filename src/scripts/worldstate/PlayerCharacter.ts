import { AbilityType } from '../abilities/abilityData';
import { AbilityKey, Faction, SCALE } from '../helpers/constants';
import Character from './Character';
import MainScene from '../scenes/MainScene';
import CircelingEffect from '../drawables/effects/CircelingEffect';

// Stats are increased by this amount, given by enchantments
export const enchantmentModifiers = {
	damage: 0,
	luck: 0,
	maxHealth: 0,
	movementSpeed: 0,
};

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter extends Character {
	public x = 0;
	public y = 0;
	public width = 8;
	public height = 8;

	public abilityCastTime = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];

	public activeSummons: Array<{ id: string; summoningType: string }> = [];

	constructor() {
		// tslint:disable-next-line: no-magic-numbers
		super('player');
		this.faction = Faction.PLAYER;
	}

	public abilityKeyMapping = {
		[AbilityKey.ONE]: AbilityType.FIREBALL,
		[AbilityKey.TWO]: AbilityType.ICESPIKE,
		[AbilityKey.THREE]: AbilityType.DUSTNOVA,
		[AbilityKey.FOUR]: AbilityType.ROUND_HOUSE_KICK,
		[AbilityKey.FIVE]: AbilityType.NOTHING,
		[AbilityKey.SPACE]: AbilityType.TELEPORT,
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
