import { Schema, Context, type, MapSchema } from "@colyseus/schema";
import { CharacterState } from "./CharacterState";

export class DungeonState extends Schema {
  @type({ map: CharacterState }) entities = new MapSchema<CharacterState>();
}
