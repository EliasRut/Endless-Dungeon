import { Room } from '../../../typings/custom';
import Character from './Character';
import Door from './Door';
import Dungeon from './Dungeon';
import DungeonLevel from './DungeonLevel';
import Inventory from './Inventory';
import Item from './Item';
import PlayerCharacter from './PlayerCharacter';
import { QuestState } from './QuestState';
import RoomAssignment from './RoomAssignment';
import { RoomCoordinates } from './RoomCoordinates';
import ScriptState from './ScriptState';
import Script from './ScriptState';

/*
	This file contains the full, current game state. It is intended to handle all information that
	is not directly visually represented. Please don't create additional states, since we might want
	to eventually move the state keeping to a second thread (webworker).
*/

// This is the world state typing.
export class WorldState {
	public loadGame: boolean = true;
	public gameTime: number;
	public playerCharacter: PlayerCharacter;
	public transitionStack: {[id: string]: RoomCoordinates} = {};
	public npcs: {[id: string]: Character} = {};
	public doors: {[id: string]: Door} = {};
	public scripts: ScriptState = {};
	public quests: {[id: string]: QuestState} = {};
	public dungeon: Dungeon;
	public availableRooms: {[name: string]: Room} = {};
	public availableTilesets: string[] = [];
	public currentLevel: string = 'town_new';
	public roomAssignment: {[name: string]: RoomAssignment} = {
		'intro_dormRoom': {
			dynamicLighting: false,
			rooms: ['intro_dormRoom'],
			width: 8,
			height: 8,
			title: 'Dorm room'
		},
		'intro_ceremony': {
			dynamicLighting: false,
			rooms: ['intro_ceremony'],
			width: 8,
			height: 8,
			title: 'Ceremony room'
		},
		'intro_dormRoom2': {
			dynamicLighting: false,
			rooms: ['intro_dormRoom2'],
			width: 8,
			height: 8,
			title: 'Dorm room'
		},
		'intro_road': {
			dynamicLighting: false,
			rooms: ['intro_road'],
			width: 8,
			height: 8,
			title: 'Road to Bellwick'
		},
		'town': {
			dynamicLighting: false,
			rooms: ['town'],
			width: 20,
			height: 20,
			title: 'Bellwick'
		},
		'town_new': {
			dynamicLighting: false,
			rooms: ['town_new'],
			width: 20,
			height: 20,
			title: 'Bellwick'
		},
		'tavern_new': {
			dynamicLighting: false,
			rooms: ['tavern_new'],
			width: 8,
			height: 8,
			title: 'Bellwick Tavern'
		},
		'library': {
			dynamicLighting: false,
			rooms: ['library'],
			width: 8,
			height: 8,
			title: 'Vanyas bookshop'
		},
	};
	public inventory: Inventory;
	public itemList: Item[];

	constructor() {
		this.playerCharacter = new PlayerCharacter();
		this.dungeon = new Dungeon();
		this.inventory = new Inventory();
		this.itemList = [];
	}

	storeState() {
		localStorage.setItem('playerCharacter', JSON.stringify(this.playerCharacter));
		localStorage.setItem('gameTime', `${this.gameTime}`);
		localStorage.setItem('npcs', JSON.stringify(this.npcs));
		localStorage.setItem('doors', JSON.stringify(this.doors));
		localStorage.setItem('scripts', JSON.stringify(this.scripts));
		localStorage.setItem('quests', JSON.stringify(this.quests));
		localStorage.setItem('dungeon', JSON.stringify(this.dungeon));
		localStorage.setItem('transitionStack', JSON.stringify(this.transitionStack));
		localStorage.setItem('availableRooms', JSON.stringify(this.availableRooms));
		localStorage.setItem('availableTilesets', JSON.stringify(this.availableTilesets));
		localStorage.setItem('currentLevel', JSON.stringify(this.currentLevel));
		localStorage.setItem('roomAssignment', JSON.stringify(this.roomAssignment));
		localStorage.setItem('inventory', JSON.stringify(this.inventory));
		localStorage.setItem('saveGameName', 'test-save');
	}

	loadState() {
		this.loadGame = false;
		// localStorage.clear();
		const saveGameName = localStorage.getItem('saveGameName');
		if (!saveGameName) {
			return;
		}
		this.gameTime = parseInt(localStorage.getItem('gameTime') || '0', 10);
		this.playerCharacter = JSON.parse(localStorage.getItem('playerCharacter') || '{}');
		this.npcs = JSON.parse(localStorage.getItem('npcs') || '{}');
		this.doors = JSON.parse(localStorage.getItem('doors') || '{}');
		this.scripts = JSON.parse(localStorage.getItem('scripts') || '{}');
		this.quests = JSON.parse(localStorage.getItem('quests') || '{}');
		this.dungeon = JSON.parse(localStorage.getItem('dungeon') || '{}');
		this.transitionStack = JSON.parse(localStorage.getItem('transitionStack') || '{}');
		this.availableRooms = JSON.parse(localStorage.getItem('availableRooms') || '{}');
		this.availableTilesets = JSON.parse(localStorage.getItem('availableTilesets') || '{}');
		this.currentLevel = JSON.parse(localStorage.getItem('currentLevel') || '{}');
		this.roomAssignment = JSON.parse(localStorage.getItem('roomAssignment') || '{}');
		this.inventory = JSON.parse(localStorage.getItem('inventory') || '{}');
		// Reset cast times.
		this.playerCharacter.abilityCastTime = [
			-Infinity,
			-Infinity,
			-Infinity,
			-Infinity
		];
	}

	clearState() {
		localStorage.clear();
	}
}

// This initializes an instance of the world state. We want this to be a Singleton.
const globalState = new WorldState();

// We are default-exporting the singleton, so that everything should use the same object.
export default globalState;