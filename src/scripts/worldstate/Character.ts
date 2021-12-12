import {
	Facings,
	Faction
} from '../helpers/constants';
import EquippableItem from './EquippableItem';

export default class Character {
	public animationBase: string;
	public maxHealth: number;
	public health: number;
	public damage: number;
	public movementSpeed: number;
	public slowFactor: number = 1;
	public attackTime: number;
	public stunDuration: number = 0;
	public stunnedAt: number = 0;
	public stunned: boolean = false

	public currentFacing: Facings = Facings.SOUTH;
	public isWalking = false;

	public x = 0;
	public y = 0;
	public vision = 0;

	public items: EquippableItem[] = [];

	public faction: Faction;

	constructor(
			animationBase: string,
			health: number = 100,
			damage: number = 10,
			movementSpeed: number = 100
		) {
		this.animationBase = animationBase;
		this.maxHealth = health;
		this.health = health;
		this.damage = damage;
		this.movementSpeed = movementSpeed;
	}
}

export const updateStatus = (globalTime: number, character: Character) => {
	if (character.stunned) {
		if (globalTime > character.stunnedAt + character.stunDuration) {
			character.stunned = false;
		}
	}
}