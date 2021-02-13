// This class handles the items.
import { v4 as uuidv4 } from 'uuid';

export const NUM_ICON_FRAMES = 64;

export default class Item {

	public iconFrame = 0;
	public itemLocation = 0; // 0 is ground, 1-80 are inventory slots, 80+ are equipped
	public type = '';
	public id: string;

	constructor(
			iconFrame: number = Math.floor(Math.random() * NUM_ICON_FRAMES),
			type: string = 'potion',
			itemLocation: number = 0,
			id?: string
		) {
		this.iconFrame = iconFrame;
		this.itemLocation = itemLocation;
		this.type = type;
		this.id = id || uuidv4();
	}
}
