import { Faction } from '../helpers/constants';
import Character from './Character';

export default class Follower extends Character {
	public abilityCastTime = [-Infinity, -Infinity, -Infinity, -Infinity];

	constructor(
		id: string,
		animationBase: string,
		health: number = 100,
		damage: number = 10,
		movementSpeed: number = 100
	) {
		super(id, animationBase, health, damage, movementSpeed);

		this.faction = Faction.FOLLOWER;
	}
}
