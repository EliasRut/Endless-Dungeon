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
		this.sound.stopAll();
		this.sound.play('score-mage-tower', {volume: 0.04});
	}

	enterDungeon() {
		globalState.currentLevel = 'dungeonLevel1';
		this.scene.start('RoomPreloaderScene');
	}
}