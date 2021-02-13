import weapons from '../../items/weapons.json';
import armors from '../../items/armors.json';
import accessories from '../../items/accessories.json';
import Item from '../worldstate/Item';
import EquippableItem from '../worldstate/EquippableItem';

const MAX_HEALTH = 100;
const BASE_DAMAGE = 1;
const MAX_ADDITIONAL_DAMAGE = 1;
const MAX_MOVEMENT_SPEED = 100;
const BASE_MAIN_STAT = 1;
const MAX_ADDITIONAL_MAIN_STAT = 1;

export const generateRandomItem = () => {
	const rnd = Math.random();
	let itemType: string;
	let iconFrame: number;
	if (rnd < 0.25) {
		itemType = weapons.itemgroup;
		iconFrame = weapons.icon[Math.floor(Math.random() * weapons.icon.length)];
	} else if (0.25 <= rnd && rnd < 0.75) {
		const rndIndex = Math.floor(Math.random() * Object.keys(armors).length);
		itemType = Object.keys(armors)[rndIndex];
		const armorData = armors[itemType as keyof typeof armors];
		iconFrame = armorData.icon[Math.floor(Math.random() * armorData.icon.length)];
	} else {
		const rndIndex = Math.floor(Math.random() * Object.keys(accessories).length);
		itemType = Object.keys(accessories)[rndIndex];
		const accessoryData = accessories[itemType as keyof typeof accessories];
		iconFrame = accessoryData.icon[Math.floor(Math.random() * accessoryData.icon.length)];
	}
	return new EquippableItem(
		Math.random() * MAX_HEALTH,
		Math.random() * MAX_ADDITIONAL_DAMAGE + BASE_DAMAGE,
		Math.random() * MAX_MOVEMENT_SPEED,
		Math.random() * MAX_ADDITIONAL_MAIN_STAT + BASE_MAIN_STAT,
		iconFrame,
		itemType
	);
};