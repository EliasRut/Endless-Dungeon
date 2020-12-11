import { MapConnection, NpcPositioning } from '../../../typings/custom';
import RoomPositioning from './RoomPositioning';

// This class handles a singular dungeon level.
export default class DungeonLevel {
	id: string;
	startPositionX: number;
	startPositionY: number;
	rooms: RoomPositioning[];
	tilesets: string[];
	layout: number[][];
	npcs: NpcPositioning[];
	connections: MapConnection[];
}