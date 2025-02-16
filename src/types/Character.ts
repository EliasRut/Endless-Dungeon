import { Facings, Faction } from '../scripts/helpers/constants';

export default class Character {
	public animationBase: string;
	public maxHealth: number;
	public health: number;
	public damage: number;
	public level: number = 1;
	public luck: number = 1;
	public movementSpeed: number;
	public slowFactor: number = 1;
	public attackTime: number = 0;
	public stunDuration: number = 0;
	public stunnedAt: number = 0;
	public stunned: boolean = false;
	public dashing: boolean = false;

	public currentFacing: Facings = Facings.SOUTH;
	public isWalking = false;

	public x = 0;
	public y = 0;
	public vision = 0;

	public faction: Faction = Faction.NPCS;
	public id: string;

	constructor(
		id: string,
		animationBase: string,
		health: number,
		damage: number,
		movementSpeed: number
	) {
		this.id = id;
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
};

export const DefaultCharacterData: Character = {
	animationBase: '',
	maxHealth: 100,
	health: 100,
	damage: 1,
	level: 1,
	luck: 1,
	movementSpeed: 30,
	slowFactor: 1,
	attackTime: 0,
	stunDuration: 0,
	stunnedAt: 0,
	stunned: false,
	dashing: false,
	currentFacing: Facings.SOUTH,
	isWalking: false,
	x: 0,
	y: 0,
	vision: 0,
	faction: Faction.PLAYER,
	id: '',
};
