import { Room } from "../../../typings/custom";
import Dungeon from "./Dungeon";
import PlayerCharacter from "./PlayerCharacter";

/*
  This file contains the full, current game state. It is intended to handle all information that
  is not directly visually represented. Please don't create additional states, since we might want
  to eventually move the state keeping to a second thread (webworker).
*/

// This is the world state typing.
export class WorldState {
  public playerCharacter: PlayerCharacter;
  public dungeon: Dungeon;
  public availableRooms: Room[] = [];

  constructor() {
    this.playerCharacter = new PlayerCharacter();
    this.dungeon = new Dungeon();
  }
}

// This initializes an instance of the world state. We want this to be a Singleton.
const globalState = new WorldState();

// We are default-exporting the singleton, so that everything should use the same object.
export default globalState;