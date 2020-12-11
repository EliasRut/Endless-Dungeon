import Item from '../../worldstate/Item';
import ItemToken from './ItemToken';

const MAX_HEALTH = 100;
const BASE_DAMAGE = 1;
const MAX_ADDITIONAL_DAMAGE = 1;
const MAX_MOVEMENT_SPEED = 100;
const BASE_MAIN_STAT = 1;
const MAX_ADDITIONAL_MAIN_STAT = 1;
const NUM_ICON_FRAMES = 64;

export default class WeaponToken extends ItemToken {
	constructor(scene: Phaser.Scene, x: number, y: number, icon: number) {
		super(scene, x, y, icon);
		this.stateObject = new Item(
			Math.random() * MAX_HEALTH,
			Math.random() * MAX_ADDITIONAL_DAMAGE + BASE_DAMAGE,
			Math.random() * MAX_MOVEMENT_SPEED,
			Math.random() * MAX_ADDITIONAL_MAIN_STAT + BASE_MAIN_STAT,
			Math.floor(Math.random() * NUM_ICON_FRAMES)
		);
	}
	destroy() {
		super.destroy();
	}
}
