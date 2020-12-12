import ItemToken from '../drawables/tokens/ItemToken';
import globalState from '../worldstate/index';
import Item from './Item';

const INVENTORY_START_X = 436;
const INVENTORY_START_Y = 112;

const MAIN_HAND_X = 290;
const MAIN_HAND_Y = 163;
const OFF_HAND_X = 402;
const OFF_HAND_Y = 163;
const CHEST_X = 346.5;
const CHEST_Y = 163;
const HEAD_X = 346.5;
const HEAD_Y = 119;
const GLOVES_X = 290;
const GLOVES_Y = 207;
const BOOTS_X = 402;
const BOOTS_Y = 207;
const NECK_X = 374.15;
const NECK_Y = 127.5;
const RRING_X = 374.15;
const RRING_Y = 199.75;
const LRING_X = 317.9;
const LRING_Y = 199.75;
const BELT_X = 346.5;
const BELT_Y = 199.75;

// ,
//    "pants": {
//       "abilities": [
//          "health",
//          "resistance",
//          "movespeed"
//       ],
//       "icon": [
//          12,
//          14
//       ]
//    }
const BOX_SIZE = 16;

export default class Inventory {
	public itemOffsetX = 0;
	public itemOffsetY = 0;
	public xBoxes = 8; // starts left
	public yBoxes = 10; // starts top
	public bag: integer[][];
	public head?: Item;
	public necklace?: Item;
	public mainhand?: Item;
	public offhand?: Item;
	public chest?: Item;
	public leftRing?: Item;
	public rightRing?: Item;
	public belt?: Item;
	public gloves?: Item;
	public boots?: Item;
	public itemList: Item[];

	constructor() {
		this.bag = [];
		for (let x = 0; x < this.xBoxes; x++) {
			this.bag[x] = [];
			for (let y = 0; y < this.yBoxes; y++) {
				this.bag[x][y] = 0;
			}
		}
		this.itemList = [];
	}

	public sortIntoInventory(item: ItemToken) {
		for (let x = 0; x < this.xBoxes; x++) {
			for (let y = 0; y < this.yBoxes; y++) {
				if (this.bag[x][y] === 0) {
					if (!this.itemList.includes(item.stateObject)) this.itemList.push(item.stateObject);
					item.stateObject.itemLocation = x + (y * this.xBoxes) + 1;
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

	private freeBagLocation(item: Item) {
		const slotToFree = item.itemLocation - 1;
		this.bag[slotToFree % this.xBoxes][Math.floor(slotToFree / this.xBoxes)] = 0;
	}

	public unequip(item: Item) {
		item.unequip(globalState.playerCharacter);
		this.sortIntoInventory(item.itemToken);
		switch (item.type) {
			case 'weapon':
				if (this.mainhand !== undefined) this.mainhand = undefined;
				break;
			case 'chest':
				if (this.chest !== undefined) this.chest = undefined;
				break;
			case 'head':
				if (this.head !== undefined) this.head = undefined;
				break;
			case 'gloves':
				if (this.gloves !== undefined) this.gloves = undefined;
				break;
			case 'boots':
				if (this.boots !== undefined) this.boots = undefined;
				break;
			case 'necklace':
				if (this.necklace !== undefined) this.necklace = undefined;
				break;
			case 'belt':
				if (this.belt !== undefined) this.belt = undefined;
				break;
			case 'ring':
				if (this.rightRing === item) this.rightRing = undefined;
				if (this.leftRing === item) this.leftRing = undefined;
				break;
		}
	}

	//might as well save coordinates on item, this solution is incomplete anyways
	public locationToCoordinates(location: number) {
		const slot = location - 1;
		const x = slot % this.xBoxes;
		const y = Math.floor(slot / this.xBoxes);
		let X = this.itemOffsetX + INVENTORY_START_X + (BOX_SIZE * x);
		let Y = this.itemOffsetY + INVENTORY_START_Y + (BOX_SIZE * y);
		if (location > 80) {
			X = this.itemOffsetX + MAIN_HAND_X;
			Y = this.itemOffsetY + MAIN_HAND_Y;
		}
		return [X, Y];
	}

	public equip(item: Item) {		
		this.freeBagLocation(item);
		switch (item.type) {
			case 'weapon':
				if (this.mainhand !== undefined) this.unequip(this.mainhand);								
				item.itemToken.x = this.itemOffsetX + MAIN_HAND_X;
				item.itemToken.y = this.itemOffsetY + MAIN_HAND_Y;
				item.itemLocation = 81;
				this.mainhand = item;
				break;
			case 'chest':
				if (this.chest !== undefined) this.unequip(this.chest);				
				item.itemToken.x = this.itemOffsetX + CHEST_X;
				item.itemToken.y = this.itemOffsetY + CHEST_Y;
				item.itemLocation = 82;
				this.chest = item;
				break;
			case 'head':
				if (this.head !== undefined) this.unequip(this.head);				
				item.itemToken.x = this.itemOffsetX + HEAD_X;
				item.itemToken.y = this.itemOffsetY + HEAD_Y;
				item.itemLocation = 85;
				this.head = item;
				break;
			case 'gloves':
				if (this.gloves !== undefined) this.unequip(this.gloves);				
				item.itemToken.x = this.itemOffsetX + GLOVES_X;
				item.itemToken.y = this.itemOffsetY + GLOVES_Y;
				item.itemLocation = 82;
				this.gloves = item;
				break;
			case 'boots':
				if (this.boots !== undefined) this.unequip(this.boots);				
				item.itemToken.x = this.itemOffsetX + BOOTS_X;
				item.itemToken.y = this.itemOffsetY + BOOTS_Y;
				item.itemLocation = 82;
				this.boots = item;
				break;
			case 'necklace':
				if (this.necklace !== undefined) this.unequip(this.necklace);				
				item.itemToken.x = this.itemOffsetX + NECK_X;
				item.itemToken.y = this.itemOffsetY + NECK_Y;
				item.itemLocation = 82;
				this.necklace = item;
				break;
			case 'belt':
				if (this.belt !== undefined) this.unequip(this.belt);				
				item.itemToken.x = this.itemOffsetX + BELT_X;
				item.itemToken.y = this.itemOffsetY + BELT_Y;
				item.itemLocation = 82;
				this.belt = item;
				break;
			case 'ring':
				if (this.rightRing === undefined) {
					item.itemToken.x = this.itemOffsetX + RRING_X;
					item.itemToken.y = this.itemOffsetY + RRING_Y;
					item.itemLocation = 83;
					this.rightRing = item;
				}
				if (this.rightRing !== undefined && this.leftRing !== undefined) {
					this.unequip(this.rightRing);
					item.itemToken.x = this.itemOffsetX + RRING_X;
					item.itemToken.y = this.itemOffsetY + RRING_Y;
					item.itemLocation = 83;
					this.rightRing = item;
				}
				if (this.leftRing === undefined) {
					item.itemToken.x = this.itemOffsetX + LRING_X;
					item.itemToken.y = this.itemOffsetY + LRING_Y;
					item.itemLocation = 84;
					this.leftRing = item;
				}
				break;
		}
		item.equip(globalState.playerCharacter);
	}
}