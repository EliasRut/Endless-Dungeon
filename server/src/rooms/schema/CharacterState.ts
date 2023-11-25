import { Schema, Context, type, MapSchema } from "@colyseus/schema";

export class CharacterState extends Schema {
  @type("string") id: string;
  @type("string") type: string;

  // Positioning
  @type("uint32") x: number;
  @type("uint32") y: number;
  @type("uint8") facing: number;

  // Movement
  @type("int16") velocityX: number;
  @type("int16") velocityY: number;

  // Stats
  @type("uint16") level: number;
  @type("uint32") health: number;
}
