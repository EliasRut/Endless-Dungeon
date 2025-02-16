import { DatabaseRoom } from '../../../typings/custom';
import { getUrlParam } from '../helpers/browserState';
import { activeMode, ColorsOfMagic, MODE } from '../helpers/constants';
import RoomGenerator from '../helpers/generateRoom';
import worldstate from '../worldState';
import { deserializeRoom } from '../helpers/serialization';
import {
	collection,
	doc,
	DocumentData,
	DocumentSnapshot,
	getDoc,
	getFirestore,
} from 'firebase/firestore';
import { app } from '../../shared/initializeApp';

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
		const text = new Phaser.GameObjects.Text(
			this,
			this.cameras.main.centerX,
			this.cameras.main.centerY,
			'Loading ...',
			{
				fontFamily: 'endlessDungeon',
				color: 'white',
				fontSize: '26px',
			}
		);
		this.add.existing(text);
	}

	preload() {
		// Rooms
		const requestedRoomId = getUrlParam('roomName');

		if (requestedRoomId) {
			this.usedRooms.push(requestedRoomId);
			worldstate.roomAssignment = {
				[`${requestedRoomId}`]: {
					dynamicLighting: false,
					rooms: [requestedRoomId],
					width: 8,
					height: 8,
					style: ColorsOfMagic.DEATH,
					numberOfRooms: 0,
					title: 'Room of Requirements',
				},
			};
			worldstate.currentLevel = requestedRoomId;
		} else {
			// console.log(globalState.currentLevel);
			// console.log(globalState.roomAssignment[globalState.currentLevel])
			const levelRoomAssignment = worldstate.roomAssignment[worldstate.currentLevel];
			this.usedRooms.push(
				...(levelRoomAssignment ? levelRoomAssignment.rooms : [worldstate.currentLevel])
			);
		}

		if (activeMode === MODE.MAP_EDITOR) {
			// We need to load all tilesets if we are going to use the map editor
			worldstate.availableTilesets.push(
				'dungeon',
				'dungeon-blue',
				'dungeon-overlay',
				'dungeon-decoration',
				'town-B',
				'town-D',
				'town-O',
				'til-tavern-B',
				'til-tavern-D',
				'tavern-O',
				'bookshop-D',
				'COM-death-B',
				'COM-death-D',
				'COM-death-O',
				'COM-wild-B',
				'COM-wild-D',
				'COM-wild-O'
			);
		}

		if (requestedRoomId !== undefined) {
			const roomGen = new RoomGenerator();
			let cnt: number = 0;
			while (cnt < 3) {
				cnt++;
				const genericRoom = roomGen.generateRoom('dungeon', ColorsOfMagic.DEATH);
				// globalState.availableRooms[genericRoom.name] = genericRoom;
				worldstate.roomAssignment[requestedRoomId].rooms.push(genericRoom.name);
				this.usedRooms.push(genericRoom.name);
				this.cache.json.add(`room-${genericRoom.name}`, genericRoom);
			}
		}
	}

	create() {
		const db = getFirestore(app);
		const roomsCollection = collection(db, 'rooms');

		const roomPromises = this.usedRooms
			.filter((roomId) => !roomId.startsWith('awsomeRoom'))
			.map((roomId) => {
				return getDoc(doc(roomsCollection, roomId)).then((data) => [roomId, data]);
			}) as Promise<[string, DocumentSnapshot<DocumentData>]>[];

		Promise.all(roomPromises)
			.then((roomDocs) => {
				roomDocs.forEach(([roomId, roomDoc]) => {
					const roomDbData = roomDoc.data() as DatabaseRoom;
					if (!roomDbData) {
						throw new Error(`Room ${roomId} not found in the database.`);
					}
					const room = deserializeRoom(roomDbData);
					this.cache.json.add(`room-${roomDoc.id}`, roomDoc.data());
					worldstate.availableRooms[room.name] = room;
				});
			})
			.then(() => {
				this.scene.start('NpcGenerationScene');
			});
	}
}
