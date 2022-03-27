import { UiDepths, UI_SCALE } from '../../helpers/constants';
import globalState from '../../worldstate/index';

const X_POSITION = 12;
const Y_POSITION = 146;

const isTileVisible = (tile: Phaser.Tilemaps.Tile) => {
	// tslint:disable-next-line: no-magic-numbers
	return tile && tile.tint > 0x010101 && tile.index % 1000 > -1;
};

export default class Minimap extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_POSITION * UI_SCALE, Y_POSITION * UI_SCALE, '', {
			color: 'white',
			fontSize: `${6 * UI_SCALE}pt`,
			fontFamily: 'endlessDungeon',
		});
		this.setScrollFactor(0);
		scene.add.existing(this);
		this.setOrigin(0);
		this.setText(globalState.roomAssignment[globalState.currentLevel]?.title || '');
		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
	}
}
