import Item from './Item';
import { INVENTORY_BOXES_X, INVENTORY_BOXES_Y } from '../helpers/constants';
import EquippableItem from './EquippableItem';
export default class Inventory {
	public itemOffsetX = 0;
	public itemOffsetY = 0;
	public bag: integer[][];
	public head?: EquippableItem;
	public necklace?: EquippableItem;
	public mainhand?: EquippableItem;
	public offhand?: EquippableItem;
	public chest?: EquippableItem;
	public leftRing?: EquippableItem;
	public rightRing?: EquippableItem;
	public belt?: EquippableItem;
	public gloves?: EquippableItem;
	public boots?: EquippableItem;
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