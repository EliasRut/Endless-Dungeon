import { Room } from '../../../typings/custom';
import Character from './Character';
import Dungeon from './Dungeon';
import DungeonLevel from './DungeonLevel';
import Inventory from './Inventory';
import PlayerCharacter from './PlayerCharacter';
import RoomAssignment from './RoomAssignment';

/*
	This file contains the full, current game state. It is intended to handle all information that
	is not directly visually represented. Please don't create additional states, since we might want
	to eventually move the state keeping to a second thread (webworker).
*/

// This is the world state typing.
export class WorldState {
	public playerCharacter: PlayerCharacter;
	public npcs: {[id: string]: Character} = {};
	public dungeon: Dungeon;
	public availableRooms: {[name: string]: Room} = {};
	public availableTilesets: string[] = [];
	public currentLevel: string = 'town';
	public roomAssignment: {[name: string]: RoomAssignment} = {
		'intro_dormRoom': {
			dynamicLighting: false,
			rooms: ['intro_dormRoom']
		},
		'intro_ceremony': {
			dynamicLighting: false,
			rooms: ['intro_ceremony']
		},
		'town': {
			dynamicLighting: false,
			rooms: ['town']
		},
		'dungeon': {
			dynamicLighting: true,
			rooms: [
				'firstTest',
				'secondTest',
				'thirdTest',
				'startRoom'
			]
		}
	};
	public inventory: Inventory;

	constructor() {
		this.playerCharacter = new PlayerCharacter();
		this.dungeon = new Dungeon();
		this.inventory = new Inventory();
	}

	storeState() {
		// tslint:disable-next-line: no-console
		console.log('Storing state.');
	}

	loadState() {
		// tslint:disable-next-line: no-console
		console.log('Loading state.');
	}
}

// This initializes an instance of the world state. We want this to be a Singleton.
const globalState = new WorldState();

// We are default-exporting the singleton, so that everything should use the same object.
export default globalState;