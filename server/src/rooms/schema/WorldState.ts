import { Schema, Context, type, MapSchema } from "@colyseus/schema";

export class WorldState extends Schema {
  @type("string") worldName: string = "My World";

  @type({ map: "uint8" }) resources = new MapSchema<number>();
  @type({ map: "int8" }) relationships = new MapSchema<number>();
}
