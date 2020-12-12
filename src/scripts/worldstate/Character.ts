import {
	ANIMATION_IDLE,
	ANIMATION_WALK,
	Facings,
	facingToSpriteNameMap,
	Faction
} from '../helpers/constants';
import { getVelocitiesForFacing } from '../helpers/orientation';

export default class Character {
	private animationBase: string;
	public maxHealth: number;
	public health: number;
	public damage: number;
	public movementSpeed: number;
	public slowFactor: number = 1;
	public attackTime: number;

	public currentFacing: Facings = Facings.SOUTH;
	public isWalking = false;

	public x = 0;
	public y = 0;
	public vision = 0;

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

	public getSpeed() {
		return this.movementSpeed * this.slowFactor;
	}

	public updateMovingState (hasMoved: boolean, facing: Facings, forceUpdate?: boolean) {
		if (!hasMoved && !forceUpdate) {
			const lastCharDirection = facingToSpriteNameMap[this.currentFacing];
			// this.currentFacing = facing;
			this.isWalking = hasMoved;
			return `${this.animationBase}-${ANIMATION_IDLE}-${lastCharDirection}`;
		}
		if (facing === this.currentFacing && this.isWalking && !forceUpdate) {
			return false;
		}
		const newDirection = facingToSpriteNameMap[facing];
		this.currentFacing = facing;
		this.isWalking = hasMoved;
		const animationType = this.isWalking ? ANIMATION_WALK : ANIMATION_IDLE;
		return `${this.animationBase}-${animationType}-${newDirection}`;
	}

	getFacingVelocities() {
		return getVelocitiesForFacing(this.currentFacing);
	}
}