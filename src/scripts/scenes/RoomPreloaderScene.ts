import { Room } from '../../../typings/custom';
import { getUrlParam } from '../helpers/browserState';
import RoomGenerator from '../helpers/generateRoom';
import globalState from '../worldstate';

/*
	The preload scene is the one we use to load assets. Once it's finished, it brings up the main
	scene.
*/
export default class RoomPreloaderScene extends Phaser.Scene {
	constructor() {
		super({ key: 'RoomPreloaderScene' });
	}
	usedRooms: string[] = [];

	init() {
		const text = new Phaser.GameObjects.Text(this,
			this.cameras.main.centerX,
			this.cameras.main.centerY, 'Loading ...', { color: 'white', fontSize: '26px' });
		this.add.existing(text);
	}

	preload() {
		// Rooms
		const requestedRoomId = getUrlParam('roomName');
		if (requestedRoomId) {
			this.usedRooms.push(requestedRoomId);
			globalState.roomAssignment = {[`${requestedRoomId}`]: {
				dynamicLighting: false,
				rooms: [requestedRoomId]
			}};
			globalState.currentLevel = requestedRoomId;
		} else {
			this.usedRooms.push(...globalState.roomAssignment[globalState.currentLevel].rooms);
		}

		const mapToEditId = getUrlParam('editMap');
		if (mapToEditId) {
			Object.values(globalState.roomAssignment).forEach((assignment) => {
				assignment.rooms.forEach((room) => {
					if (!this.usedRooms.includes(room)) {
						this.usedRooms.push(room);
					}
				});
			});
			// We need to load all tilesets if we are going to use the map editor
			globalState.availableTilesets.push(
				'dungeon',
				'dungeon-blue',
				'town',
				'dungeon-overlay',
				'dungeon-decoration',
				'town-overlay'
				);
		}

		this.usedRooms.forEach((roomId) => {
			this.load.json(`room-${roomId}`, `assets/rooms/${roomId}.json`);
		});

		if (requestedRoomId !== undefined) {
			const roomGen = new RoomGenerator();
			let cnt: number = 0;
			while(cnt < 4) {
				cnt++;
			const genericRoom = roomGen.generateRoom('dungeon');
			// globalState.availableRooms[genericRoom.name] = genericRoom;
			globalState.roomAssignment[requestedRoomId].rooms.push(genericRoom.name);
			this.usedRooms.push(genericRoom.name);
			this.cache.json.add(`room-${genericRoom.name}`,genericRoom);
			}
		}
	}

	create() {
		this.usedRooms.forEach((usedRoom) => {
			const room = this.cache.json.get(`room-${usedRoom}`) as Room;
			globalState.availableRooms[room.name] = room;
		});

		this.scene.start('PreloadScene');
	}
}