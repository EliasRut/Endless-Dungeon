// This class handles the items.
import { v4 as uuidv4 } from 'uuid';

export const NUM_ICON_FRAMES = 64;

export default class Item {

	public flavorText = 'A normal item.';
	public name = 'Item';
	public iconFrame = 0;
	public type = '';
	public id: string;
	public amount: number = 1;

	constructor(
		flavorText: string = 'A normal item.',
		name: string = 'Item',
		iconFrame: number = Math.floor(Math.random() * NUM_ICON_FRAMES),
		type: string = 'potion',
		id?: string
	) {
		this.iconFrame = iconFrame;
		this.type = type;
		this.flavorText = flavorText;
		this.name = name;
		this.id = id || uuidv4();
	}
}
