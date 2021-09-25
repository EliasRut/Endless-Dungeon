import 'phaser';
import DungeonDoor from '../drawables/ui/DungeonDoor';
import globalState from '../worldstate/index';
import { RuneAssignment } from '../helpers/constants';
import { generateDungeonRun } from '../helpers/generateDungeonRun';
import KeyboardHelper from '../helpers/KeyboardHelper';

export default class DungeonDoorScene extends Phaser.Scene {
	dungeonDoor: DungeonDoor;
	keyboardHelper: KeyboardHelper;
	keyLastPressed: number = 0;
	keyCD: number = 150;

	constructor() {
		super({ key: 'DungeonDoorScene' });		
	}

	create() {
		this.keyboardHelper = new KeyboardHelper(this);
		this.dungeonDoor = new DungeonDoor(this);
		this.sound.stopAll();
		this.sound.play('score-mage-tower', {volume: 0.04});		
	}

	enterDungeon(runeAssignment: RuneAssignment) {
		console.log("entering dungeon");
		const dungeonRun = generateDungeonRun(runeAssignment);

		dungeonRun.levels.forEach((levelData, level) => {
			const rooms = ['COM-death-connection-up'];
				if (level < dungeonRun.levels.length - 1) {
					rooms.push('COM-death-connection-down');
				}
			globalState.roomAssignment['dungeonLevel' + (level + 1)] = {
				dynamicLighting: true,
				rooms: rooms.concat(levelData.rooms),
				width: levelData.width,
				height: levelData.height,
				numberOfRooms: levelData.numberOfRooms,
				title: levelData.title,
				style: levelData.style,
				enemyBudget: levelData.enemyBudget
			};
		});

		globalState.currentLevel = 'dungeonLevel1';
		this.scene.start('RoomPreloaderScene');
	}
	update(globalTime: number, _delta: number) {
		this.keyboardHelper.updateGamepad();		
		if (this.keyboardHelper.isEnterPressed()) {	
			if (globalTime - this.keyLastPressed > this.keyCD) this.keyLastPressed = globalTime;
			else return;		
			this.dungeonDoor.openDoor();
		}
	}
}