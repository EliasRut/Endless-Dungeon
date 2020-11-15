import { Room } from "../../../typings/custom";
import { getUrlParam } from "../helpers/browserState";
import globalState from "../worldstate";

/*
  The preload scene is the one we use to load assets. Once it's finished, it brings up the main
  scene.
*/
export default class RoomPreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RoomPreloaderScene' })
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
      globalState.roomAssignment = {[`${requestedRoomId}`]: [requestedRoomId]};
      globalState.currentLevel = requestedRoomId;
    } else {
      this.usedRooms.push(...globalState.roomAssignment[globalState.currentLevel]);
    }

    const mapToEditId = getUrlParam('editMap');
    if (mapToEditId) {
      Object.values(globalState.roomAssignment).forEach((roomList) => {
        roomList.forEach((room) => {
          if (!this.usedRooms.includes(room)) {
            this.usedRooms.push(room);
          }
        });
      });
      // We need to load all tilesets if we are going to use the map editor
      globalState.availableTilesets.push('dungeon', 'dungeon-blue', 'town');
    }

    this.usedRooms.forEach((roomId) => {
      this.load.json(`room-${roomId}`, `assets/rooms/${roomId}.json`);
    })
  }

  create() {
    this.usedRooms.forEach((usedRoom) => {
      const room = this.cache.json.get(`room-${usedRoom}`) as Room;
      globalState.availableRooms.push(room);
    });

    this.scene.start('PreloadScene');
  }
}