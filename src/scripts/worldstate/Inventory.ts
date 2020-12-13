import Item from './Item';
import { INVENTORY_BOXES_X, INVENTORY_BOXES_Y } from '../helpers/constants';
export default class Inventory {
	public itemOffsetX = 0;
	public itemOffsetY = 0;
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
	public unequippedItemList: {
		x: number,
		y: number,
		item: Item
	}[];

	constructor() {
		this.bag = [];
		for (let x = 0; x < INVENTORY_BOXES_X; x++) {
			this.bag[x] = [];
			for (let y = 0; y < INVENTORY_BOXES_Y; y++) {
				this.bag[x][y] = 0;
			}
		}
		this.unequippedItemList = [];
	}
}