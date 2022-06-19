import { Faction } from '../helpers/constants';
import Character from './Character';

export default class Follower extends Character {
	public abilityCastTime = [-Infinity, -Infinity, -Infinity, -Infinity];

	constructor(
		animationBase: string,
		health: number = 100,
		damage: number = 10,
		movementSpeed: number = 100
	) {
		super(animationBase, health, damage, movementSpeed);

		this.faction = Faction.NPCS;
	}
}
