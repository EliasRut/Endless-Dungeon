import Item from '../../worldstate/Item';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import { UiDepths } from '../../helpers/constants';

const MAX_INTERACTION_DISTANCE = 30;
const MAX_EQUIPPABLE_ITEM_LOCATION = 80;

export default class ItemToken extends Phaser.Physics.Arcade.Sprite {
	stateObject: Item;

	constructor(scene: Phaser.Scene, x: number, y: number, item: Item) {	
		super(scene, x, y, 'test-items-spritesheet', item.iconFrame);
		this.stateObject = item;
		item.itemToken = this;
		scene.add.existing(this);
	}

	public update(scene: MainScene) {
		if (!globalState.inventory.itemList.includes(this.stateObject)) {
			const px = scene.mainCharacter.x;
			const py = scene.mainCharacter.y;
			const distance = Math.hypot(this.x - px, this.y - py);
			// if you run over item, put into inventory
			if (distance < MAX_INTERACTION_DISTANCE) {
				if (globalState.inventory.sortIntoInventory(this)) {
					scene.overlayScreens.inventory.add(this, false);
					this.setVisible(false);
					this.setDepth(UiDepths.UI_FOREGROUND_LAYER);
					this.setScrollFactor(0);
					this.setInteractive();
					this.on('pointerdown', () => {
						if(this.stateObject.itemLocation > 0 && this.stateObject.itemLocation <= MAX_EQUIPPABLE_ITEM_LOCATION){
							globalState.inventory.equip(this.stateObject);
						} else if(this.stateObject.itemLocation > MAX_EQUIPPABLE_ITEM_LOCATION){
							globalState.inventory.unequip(this.stateObject);
						}
					});
				}
			}
		}
	}

	destroy() {
		super.destroy(true);
	}
}