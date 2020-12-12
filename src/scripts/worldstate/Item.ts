// This class handles the items.
import { v4 as uuidv4 } from 'uuid';

const MAX_HEALTH = 100;
const BASE_DAMAGE = 1;
const MAX_ADDITIONAL_DAMAGE = 1;
const MAX_MOVEMENT_SPEED = 100;
const BASE_MAIN_STAT = 1;
const MAX_ADDITIONAL_MAIN_STAT = 1;
const NUM_ICON_FRAMES = 64;

export interface ItemStats {
	maxHealth?: number;
	damage?: number;
	movementSpeed?: number;
	mainStat?: number;
}

export default class Item implements ItemStats {
	public maxHealth = 100;
	public damage = 1;
	public movementSpeed = 100;
	public mainStat = 1;

	public iconFrame = 0;
	public itemLocation = 0; // 0 is ground, 1-80 are inventory slots, 80+ are equipped
	public type = '';
	public id: string;

	constructor(
			maxHealth: number = Math.random() * MAX_HEALTH,
			damage: number = Math.random() * MAX_ADDITIONAL_DAMAGE + BASE_DAMAGE,
			movementSpeed: number = Math.random() * MAX_MOVEMENT_SPEED,
			mainStat: number = Math.random() * MAX_ADDITIONAL_MAIN_STAT + BASE_MAIN_STAT,
			iconFrame: number = Math.floor(Math.random() * NUM_ICON_FRAMES),
			type: string = 'potion',
			itemLocation: number = 0
		) {
		this.maxHealth = maxHealth;
		this.damage = damage;
		this.movementSpeed = movementSpeed;
		this.mainStat = mainStat;
		this.iconFrame = iconFrame;
		this.itemLocation = itemLocation;
		this.type = type;
		this.id = uuidv4();
	}
}