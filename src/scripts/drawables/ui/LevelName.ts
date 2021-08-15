import globalState from '../../worldstate/index';

const X_POSITION = 10;
const Y_POSITION = 180;

const isTileVisible = (tile: Phaser.Tilemaps.Tile) => {
	// tslint:disable-next-line: no-magic-numbers
	return tile && tile.tint > 0x010101 && tile.index % 1000 > -1;
};

export default class Minimap extends Phaser.GameObjects.Text {
	constructor(scene: Phaser.Scene) {
		super(scene, X_POSITION, Y_POSITION, '', {
			color: 'white',
			fontSize: '10px'
		});
		this.setScrollFactor(0);
		scene.add.existing(this);
		this.setOrigin(0);
		this.setText(globalState.roomAssignment[globalState.currentLevel]?.title || '');
	}

}
