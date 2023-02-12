import 'phaser';
import DungeonDoor from '../drawables/ui/DungeonDoor';
import globalState from '../worldstate/index';
import { RuneAssignment } from '../helpers/constants';
import { generateDungeonRun } from '../helpers/generateDungeonRun';
import KeyboardHelper from '../helpers/KeyboardHelper';
import { SingleScriptState } from '../worldstate/ScriptState';
import { loadContentBlocksFromDatabase } from '../helpers/ContentDataLibrary';

export default class DungeonDoorScene extends Phaser.Scene {
	dungeonDoor: DungeonDoor;
	keyboardHelper: KeyboardHelper;
	keyLastPressed: number = 0;
	keyCD: number = 350;
	contentDataLibraryUpdatePromise: Promise<any>;

	constructor() {
		super({ key: 'DungeonDoorScene' });
	}

	create() {
		this.keyboardHelper = new KeyboardHelper(this);
		this.dungeonDoor = new DungeonDoor(this);
		this.sound.stopAll();
		// this.sound.play('score-mage-tower', { volume: 0.04 });
		this.contentDataLibraryUpdatePromise = loadContentBlocksFromDatabase();
		this.dungeonDoor.openDoor();
	}

	async enterDungeon(runeAssignment: RuneAssignment) {
		// tslint:disable-next-line: no-console
		console.log('entering dungeon');
		await this.contentDataLibraryUpdatePromise;
		const dungeonRun = generateDungeonRun(runeAssignment);
		globalState.enemies = {};
		globalState.dungeon.levels = {};
		globalState.doors = {};
		const newScriptState: { [id: string]: SingleScriptState } = {};
		Object.entries(globalState.scripts.states || {}).forEach(([scriptId, scriptState]) => {
			if (!scriptId.startsWith('dungeonLevel')) {
				newScriptState[scriptId] = scriptState;
			}
		});
		globalState.scripts.states = newScriptState;
		globalState.playerCharacter.x = 0;
		globalState.playerCharacter.y = 0;

		dungeonRun.levels.forEach((levelData, level) => {
			const rooms = [];
			if (!levelData.specialStartRoom) {
				rooms.push(`COM-${levelData.style.toLowerCase()}-connection-up`);
			}
			if (level < dungeonRun.levels.length - 1) {
				rooms.push(`COM-${levelData.style.toLowerCase()}-connection-down`);
			}
			globalState.roomAssignment['dungeonLevel' + (level + 1)] = {
				dynamicLighting: true,
				rooms: rooms.concat(levelData.rooms),
				width: levelData.width,
				height: levelData.height,
				numberOfRooms: levelData.numberOfRooms,
				title: levelData.title,
				style: levelData.style,
				enemyBudget: levelData.enemyBudget,
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
