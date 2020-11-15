import { NpcPositioning } from "../../../typings/custom";
import MapConnection from "./MapConnection";
import RoomPositioning from "./RoomPositioning";

// This class handles a singular dungeon level.
export default class DungeonLevel {
  id: string;
  rooms: RoomPositioning[];
  tilesets: string[];
  layout: number[][];
  npcs: NpcPositioning[];
  connections: MapConnection[];
};