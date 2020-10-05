import { Room } from "../../../typings/custom";
import { getUrlParam } from "../helpers/browserState";
import { spriteDirectionList } from "../helpers/constants";
import globalState from "../worldstate";

/*
  The preload scene is the one we use to load assets. Once it's finished, it brings up the main
  scene.
*/
export default class RoomLoaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RoomLoaderScene' })
  }
  usedRooms: string[] = [];

  preload() {
    // Rooms
    const requestedRoomId = getUrlParam('roomName');
    if (requestedRoomId) {
      this.usedRooms.push(requestedRoomId);
    } else {
      this.usedRooms.push('firstTest');
      this.usedRooms.push('secondTest');
      this.usedRooms.push('thirdTest');
      this.usedRooms.push('startRoom');
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