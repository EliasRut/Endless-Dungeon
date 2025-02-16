import {
	LightingSource,
	ItemsPositioning,
	MapConnection,
	NpcPositioning,
} from '../../typings/custom';
import Door from './Door';
import RoomPositioning from './RoomPositioning';

// This class handles a singular dungeon level.
export default interface DungeonLevel {
	id: string;
	startPositionX: number;
	startPositionY: number;
	rooms: RoomPositioning[];
	tilesets: string[];
	layout: number[][];
	decorationLayout: number[][];
	overlayLayout: number[][];
	topLayout: number[][];
	npcs: NpcPositioning[];
	connections: MapConnection[];
	doors: Door[];
	lightingSources: LightingSource[];
	items: ItemsPositioning[];
	enemyLevel: number;
	name: string;
	dynamicLighting: boolean;
}
