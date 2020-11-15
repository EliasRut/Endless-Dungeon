import { Room } from "../../../typings/custom";
import { getUrlParam } from "../helpers/browserState";
import { spriteDirectionList } from "../helpers/constants";
import globalState from "../worldstate";

/*
  The preload scene is the one we use to load assets. Once it's finished, it brings up the main
  scene.
*/
export default class RoomPreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RoomLoaderScene' })
  }
  usedRooms: string[] = [];

  dungeonLevels = {
    'town': ['town'],
    'dungeon': [
      'firstTest',
      'secondTest',
      'thirdTest',
      'startRoom'
    ]
  };

    //   'town', {
    //   id: 'town',
    //   rooms: [{roomName: 'town', x: 8, y: 8}],
    //   tilesets: ['town'],
    //   layout: 
    //   npcs: NpcPositioning[];
    //   connections: MapConnection[];
    // }

  preload() {
    // Rooms
    const requestedRoomId = getUrlParam('roomName');
    if (requestedRoomId) {
      this.usedRooms.push(requestedRoomId);
    } else {
      this.usedRooms.push(...this.dungeonLevels[globalState.currentLevel]);
    }

    this.usedRooms.forEach((roomId) => {
      this.load.json(`room-${roomId}`, `assets/rooms/${roomId}.json`);
    })

    const mapToEditId = getUrlParam('editMap');
    if (mapToEditId) {
      // We need to load all tilesets if we are going to use the map editor
      globalState.availableTilesets.push('dungeon', 'dungeon-blue', 'town');
    }
  }

  create() {
    this.usedRooms.forEach((usedRoom) => {
      const room = this.cache.json.get(`room-${usedRoom}`) as Room;
      globalState.availableRooms.push(room);
    });

    this.scene.start('PreloadScene');
  }
}