import { Room } from '../../typings/custom';
import Character from './Character';
import Follower from './Follower';
import Door from './Door';
import Dungeon from './Dungeon';
import Inventory from './Inventory';
import Item from './Item';
import PlayerCharacter from './PlayerCharacter';
import { QuestState } from './QuestState';
import RoomAssignment from './RoomAssignment';
import { RoomCoordinates } from './RoomCoordinates';
import ScriptState from './ScriptState';
import { EmptyInventory } from './Inventory';
import { ConditionalAbilityDataMap } from './AbilityData';

/*
	This file contains the full, current game state. It is intended to handle all information that
	is not directly visually represented. Please don't create additional states, since we might want
	to eventually move the state keeping to a second thread (webworker).
*/

// This is the world state typing.
export class WorldState {
	public contentPackages: string[] = ['6Bf0lAbliACPrimJtzFr'];
	public loadGame: boolean = true;
	public gameTime: number;
	public playerCharacter: PlayerCharacter;
	public transitionStack: { [id: string]: RoomCoordinates } = {};
	public npcs: { [id: string]: Character } = {};
	public enemies: { [id: string]: Character } = {};
	public followers: { [id: string]: Follower } = {};
	public activeFollower: string = '';
	public doors: { [id: string]: Door } = {};
	public scripts: ScriptState = {};
	public quests: { [id: string]: QuestState } = {};
	public dungeon: Dungeon;
	public availableRooms: { [name: string]: Room } = {};
	public availableTilesets: string[] = [];
	public currentLevel: string = 'town_new';
	public roomAssignment: { [name: string]: RoomAssignment } = {};
	public inventory: Inventory;
	public itemList: Item[];
	public abilityData: ConditionalAbilityDataMap = {} as ConditionalAbilityDataMap;

	public static readonly CONTENTPACKAGE: string = 'contentPackages';
	public static readonly PLAYERCHARACTER: string = 'playerCharacter';
	public static readonly GAMETIME: string = 'gameTime';
	public static readonly NPCS: string = 'npcs';
	public static readonly ENEMIES: string = 'enemies';
	public static readonly FOLLOWERS: string = 'followers';
	public static readonly ACTIVEFOLLOWER: string = 'activeFollower';
	public static readonly DOORS: string = 'doors';
	public static readonly SCRIPTS: string = 'scripts';
	public static readonly QUESTS: string = 'quests';
	public static readonly DUNGEON: string = 'dungeon';
	public static readonly TRANSITIONSTACK: string = 'transitionStack';
	public static readonly AVAILABLEROOMS: string = 'availableRooms';
	public static readonly AVAILABLETILESETS: string = 'availableTilesets';
	public static readonly CURRENTLEVEL: string = 'currentLevel';
	public static readonly ROOMASSIGNMENT: string = 'roomAssignment';
	public static readonly INVENTORY: string = 'inventory';
	public static readonly SAVEGAMENAME: string = 'saveGameName';

	constructor() {
		this.playerCharacter = new PlayerCharacter();
		this.dungeon = new Dungeon();
		this.inventory = { ...EmptyInventory };
		this.itemList = [];
		this.gameTime = 0;
	}

	storeState() {
		localStorage.setItem(WorldState.CONTENTPACKAGE, JSON.stringify(this.contentPackages));
		localStorage.setItem(WorldState.PLAYERCHARACTER, JSON.stringify(this.playerCharacter));
		localStorage.setItem(WorldState.GAMETIME, `${this.gameTime}`);
		localStorage.setItem(WorldState.NPCS, JSON.stringify(this.npcs));
		localStorage.setItem(WorldState.ENEMIES, JSON.stringify(this.enemies));
		localStorage.setItem(WorldState.FOLLOWERS, JSON.stringify(this.followers));
		localStorage.setItem(WorldState.ACTIVEFOLLOWER, this.activeFollower);
		localStorage.setItem(WorldState.DOORS, JSON.stringify(this.doors));
		localStorage.setItem(WorldState.SCRIPTS, JSON.stringify(this.scripts));
		localStorage.setItem(WorldState.QUESTS, JSON.stringify(this.quests));
		localStorage.setItem(WorldState.DUNGEON, JSON.stringify(this.dungeon));
		localStorage.setItem(WorldState.TRANSITIONSTACK, JSON.stringify(this.transitionStack));
		localStorage.setItem(WorldState.AVAILABLEROOMS, JSON.stringify(this.availableRooms));
		localStorage.setItem(WorldState.AVAILABLETILESETS, JSON.stringify(this.availableTilesets));
		localStorage.setItem(WorldState.CURRENTLEVEL, JSON.stringify(this.currentLevel));
		localStorage.setItem(WorldState.ROOMASSIGNMENT, JSON.stringify(this.roomAssignment));
		localStorage.setItem(WorldState.INVENTORY, JSON.stringify(this.inventory));
		localStorage.setItem(WorldState.SAVEGAMENAME, '"test-save"');
	}

	loadState() {
		this.loadGame = false;
		// localStorage.clear();
		const saveGameName = localStorage.getItem('saveGameName');
		if (!saveGameName) {
			// tslint:disable-next-line: no-console
			console.log('no savegamename set');
			const inventory = localStorage.getItem(WorldState.INVENTORY);
			if (inventory) {
				console.log('Inventory found!');
				this.inventory = JSON.parse(inventory);
			}
			return;
		}
		this.contentPackages = JSON.parse(
			localStorage.getItem(WorldState.CONTENTPACKAGE) || '["6Bf0lAbliACPrimJtzFr"]'
		);
		this.gameTime = parseInt(localStorage.getItem(WorldState.GAMETIME) || '0', 10);
		this.playerCharacter = JSON.parse(localStorage.getItem(WorldState.PLAYERCHARACTER) || '{}');
		this.npcs = JSON.parse(localStorage.getItem(WorldState.NPCS) || '{}');
		this.enemies = JSON.parse(localStorage.getItem(WorldState.ENEMIES) || '{}');
		this.followers = JSON.parse(localStorage.getItem(WorldState.FOLLOWERS) || '{}');
		this.activeFollower = localStorage.getItem(WorldState.ACTIVEFOLLOWER) || '';
		this.doors = JSON.parse(localStorage.getItem(WorldState.DOORS) || '{}');
		this.scripts = JSON.parse(localStorage.getItem(WorldState.SCRIPTS) || '{}');
		this.quests = JSON.parse(localStorage.getItem(WorldState.QUESTS) || '{}');
		this.dungeon = JSON.parse(localStorage.getItem(WorldState.DUNGEON) || '{}');
		this.transitionStack = JSON.parse(localStorage.getItem(WorldState.TRANSITIONSTACK) || '{}');
		this.availableRooms = JSON.parse(localStorage.getItem(WorldState.AVAILABLEROOMS) || '{}');
		this.availableTilesets = JSON.parse(localStorage.getItem(WorldState.AVAILABLETILESETS) || '{}');
		// tslint:disable-next-line: no-console
		console.log('setting current level to' + localStorage.getItem(WorldState.CURRENTLEVEL));
		this.currentLevel = JSON.parse(localStorage.getItem(WorldState.CURRENTLEVEL) || '{}');
		this.roomAssignment = JSON.parse(localStorage.getItem(WorldState.ROOMASSIGNMENT) || '{}');
		this.inventory = JSON.parse(localStorage.getItem(WorldState.INVENTORY) || '{}');
		// Reset cast times.
		this.playerCharacter.abilityCastTime = [
			-Infinity,
			-Infinity,
			-Infinity,
			-Infinity,
			-Infinity,
			-Infinity,
		];
	}

	clearState(deleteInventory: boolean) {
		localStorage.clear();
		if (!deleteInventory) {
			// Keep inventory and player character, only reset the rest
			localStorage.setItem(WorldState.INVENTORY, JSON.stringify(this.inventory));
		}
	}
}
