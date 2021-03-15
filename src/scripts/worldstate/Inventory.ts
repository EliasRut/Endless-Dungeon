import Item from './Item';
import { BAG_BOXES_X, BAG_BOXES_Y } from '../helpers/constants';
import EquippableItem from './EquippableItem';
export default class Inventory {
	public itemOffsetX = 0;
	public itemOffsetY = 0;
	public bag: integer[][];
	public necklace?: EquippableItem;
	public mainhand?: EquippableItem;
	public offhand?: EquippableItem;
	public chestpiece?: EquippableItem;
	public leftRing?: EquippableItem;
	public rightRing?: EquippableItem;
	public unequippedItemList: {
		x: number,
		y: number,
		item: Item
	}[];

	constructor() {
		this.bag = [];
		for (let x = 0; x < BAG_BOXES_X; x++) {
			this.bag[x] = [];
			for (let y = 0; y < BAG_BOXES_Y; y++) {
				this.bag[x][y] = 0;
			}
		}
		this.unequippedItemList = [];
	}
}