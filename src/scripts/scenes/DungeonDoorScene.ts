import 'phaser';
import DungeonDoor from '../drawables/ui/DungeonDoor';
import globalState from '../worldstate/index';

export default class DungeonDoorScene extends Phaser.Scene {
	dungeonDoor: DungeonDoor;

	constructor() {
		super({ key: 'DungeonDoorScene' });
	}

	create() {
		this.dungeonDoor = new DungeonDoor(this);
	}

	enterDungeon() {
		globalState.currentLevel = 'dungeonLevel1';
		this.scene.start('RoomPreloaderScene');
	}
}