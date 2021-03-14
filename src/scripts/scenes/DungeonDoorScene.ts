import 'phaser';
import DungeonDoor from '../drawables/ui/DungeonDoor';
import globalState from '../worldstate/index';
import { RuneAssignment } from '../helpers/constants';
import { generateDungeonRun } from '../helpers/generateDungeonRun';

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

	enterDungeon(runeAssignment: RuneAssignment) {
		const dungeonRun = generateDungeonRun(runeAssignment);

		dungeonRun.levels.forEach((levelData, level) => {
			const rooms = ['connection_up'];
				if (level < dungeonRun.levels.length - 1) {
					rooms.push('connection_down');
				}
			globalState.roomAssignment['dungeonLevel' + (level + 1)] = {
				dynamicLighting: true,
				rooms: rooms.concat(levelData.rooms)
			};
		});

		globalState.currentLevel = 'dungeonLevel1';
		this.scene.start('RoomPreloaderScene');
	}
}