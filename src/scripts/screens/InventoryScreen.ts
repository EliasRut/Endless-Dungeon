import { UiDepths } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';
import globalState from '../worldstate/index';
import ItemToken from '../drawables/tokens/ItemToken';

const MAX_INTERACTION_DISTANCE = 30;
const MAX_EQUIPPABLE_ITEM_LOCATION = 80;

export default class InventoryScreen extends OverlayScreen {
	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, 290, 120, 320, 220);
		const inventoryField = new Phaser.GameObjects.Image(scene, 414, 198, 'inventory-borders');
		inventoryField.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		inventoryField.setScrollFactor(0);
		this.add(inventoryField, true);
		// tslint:enable

		scene.add.existing(this);
		this.setVisible(false);

		//Load existing itemTokens into inventory if available (e.g. new scene)
		for (let item of globalState.inventory.itemList) {
			let [x, y] = globalState.inventory.locationToCoordinates(item.itemLocation);
			const itemToken = new ItemToken(this.scene, x, y, item);
			this.add(itemToken, false);
			itemToken.setVisible(false);
			itemToken.setDepth(UiDepths.UI_FOREGROUND_LAYER);
			itemToken.setScrollFactor(0);
			itemToken.setInteractive();
			itemToken.on('pointerdown', () => {
				if (item.itemLocation > 0 && item.itemLocation <= MAX_EQUIPPABLE_ITEM_LOCATION) {
					globalState.inventory.equip(item);
				} else if (item.itemLocation > MAX_EQUIPPABLE_ITEM_LOCATION) {
					globalState.inventory.unequip(item);
				}
			});
		}
	}
}
