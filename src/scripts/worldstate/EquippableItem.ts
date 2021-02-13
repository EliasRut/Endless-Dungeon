import Item, { NUM_ICON_FRAMES } from './Item';

const MAX_HEALTH = 100;
const BASE_DAMAGE = 1;
const MAX_ADDITIONAL_DAMAGE = 1;
const MAX_MOVEMENT_SPEED = 100;
const BASE_MAIN_STAT = 1;
const MAX_ADDITIONAL_MAIN_STAT = 1;

export interface ItemStats {
	maxHealth?: number;
	damage?: number;
	movementSpeed?: number;
	mainStat?: number;
}

export default class EquippableItem extends Item implements ItemStats {
	public maxHealth = 100;
	public damage = 1;
	public movementSpeed = 100;
	public mainStat = 1;

	constructor(
			maxHealth: number = Math.random() * MAX_HEALTH,
			damage: number = Math.random() * MAX_ADDITIONAL_DAMAGE + BASE_DAMAGE,
			movementSpeed: number = Math.random() * MAX_MOVEMENT_SPEED,
			mainStat: number = Math.random() * MAX_ADDITIONAL_MAIN_STAT + BASE_MAIN_STAT,
			iconFrame: number = Math.floor(Math.random() * NUM_ICON_FRAMES),
			flavorText: string = 'A normal item',
			name: string = 'Item',
			type: string = 'potion',
			itemLocation: number = 0,
			id?: string
		) {
		super(flavorText, name, iconFrame, type, itemLocation, id);
		this.maxHealth = maxHealth;
		this.damage = damage;
		this.movementSpeed = movementSpeed;
		this.mainStat = mainStat;
	}
}
