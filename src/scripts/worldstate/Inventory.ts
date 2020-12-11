import ItemToken from '../drawables/tokens/ItemToken';
import globalState from '../worldstate/index';

const INVENTORY_START_X = 436;
const INVENTORY_START_Y = 112;

const MAIN_HAND_X = 290;
const MAIN_HAND_Y = 163;

const BOX_SIZE = 16;

const EQUIPPED_INVENTORY_SLOT = 81;

export default class Inventory {
	public itemOffsetX = 0;
	public itemOffsetY = 0;
	public xBoxes = 8; // starts left
	public yBoxes = 10; // starts top
	public bag: integer[][];
	public head?: ItemToken;
	public necklace?: ItemToken;
	public mainhand?: ItemToken;
	public offhand?: ItemToken;
	public chest?: ItemToken;
	public leftRing?: ItemToken;
	public rightRing?: ItemToken;
	public belt?: ItemToken;
	public gloves?: ItemToken;
	public boots?: ItemToken;

	constructor() {
		this.bag = [];
		for (let x = 0; x < this.xBoxes; x++) {
			this.bag[x] = [];
			for (let y = 0; y < this.yBoxes; y++) {
				this.bag[x][y] = 0;
			}
		}
	}

	public sortIntoInventory(item: ItemToken){
		for (let x = 0; x < this.xBoxes; x++) {
			for (let y = 0; y < this.yBoxes; y++) {
				if(this.bag[x][y] === 0){
					item.itemLocation = x+(y*this.xBoxes) + 1;
					this.bag[x][y] = 1;
					// place into actual inventory, box size 16
					item.x = this.itemOffsetX + INVENTORY_START_X + (BOX_SIZE * x);
					item.y = this.itemOffsetY + INVENTORY_START_Y + (BOX_SIZE * y);
					return true;
				}
			}
		}
		return false;
	}

	public equip(item: ItemToken){
		if(this.mainhand !== undefined){
			this.unequip(this.mainhand);
		}
		item.stateObject.equip(globalState.playerCharacter);
		item.x = this.itemOffsetX + MAIN_HAND_X;
		item.y = this.itemOffsetY + MAIN_HAND_Y;
		const freeBag = item.itemLocation -1;
		this.bag[freeBag % this.xBoxes][Math.floor(freeBag/this.xBoxes)] = 0;
		item.itemLocation = EQUIPPED_INVENTORY_SLOT;
		this.mainhand = item;
	}

	public unequip(item: ItemToken){
		item.stateObject.unequip(globalState.playerCharacter);
		this.sortIntoInventory(item);
		this.mainhand = undefined;
	}
}