// This class handles the items.
import ItemToken from '../drawables/tokens/ItemToken';
import PlayerCharacter from '../worldstate/PlayerCharacter';

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

	public itemToken: ItemToken;
	public iconFrame = 0;
	public itemLocation = 0; // 0 is ground, 1-80 are inventory slots, 80+ are equipped
	public type = '';

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
	}
	
	public equip(player: PlayerCharacter) {
		// tslint:disable-next-line: no-console
		console.log(`Equipping item ${JSON.stringify(this)}.`);
		player.items.push(this);
		player.updateStats();
	}

	public unequip(player: PlayerCharacter){
		// tslint:disable-next-line: no-console
		console.log(`Unequipping item ${JSON.stringify(this)}.`);
		const itemIndex = player.items.findIndex((item) => item === this);
		if (itemIndex > -1) {
			player.items.splice(itemIndex, 1);
			player.updateStats();
		}
	}
}