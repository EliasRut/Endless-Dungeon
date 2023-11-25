import { AbilityType } from '../abilities/abilityData';
import { AbilityKey, Faction, SCALE } from '../helpers/constants';
import Character from './Character';
import MainScene from '../scenes/MainScene';

const DEFAULT_HEALTH = 100;
const DEFAULT_DAMAGE = 1;
const DEFAULT_MOVEMENTSPEED = 200;

// This class handles the players character and all mechanical events associated with it.
export default class PlayerCharacter extends Character {
	public x = 0;
	public y = 0;
	public width = 8;
	public height = 8;
	public comboCast = 0;
	public lastComboCast = 0;
	public lastComboCastTime = Infinity;
	public reverseDashDirectionTime = -Infinity;

	// Stats are increased by this amount, given by enchantments
	public enchantmentModifiers = {
		damage: 0,
		luck: 0,
		maxHealth: 0,
		movementSpeed: 0,
	};

	public abilityCastTime = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];

	public activeSummons: { id: string; summoningType: string }[] = [];

	constructor() {
		// tslint:disable-next-line: no-magic-numbers
		super('player', 'player', DEFAULT_HEALTH, DEFAULT_DAMAGE, DEFAULT_MOVEMENTSPEED);
		this.faction = Faction.PLAYER;
	}

	public abilityKeyMapping = {
		[AbilityKey.ONE]: AbilityType.FIRE_BOLT,
		[AbilityKey.TWO]: AbilityType.NOTHING,
		[AbilityKey.THREE]: AbilityType.NOTHING,
		[AbilityKey.FOUR]: AbilityType.NOTHING,
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
	scene.playerCharacterAvatar.updateAbility(abilityKey, ability);
};
