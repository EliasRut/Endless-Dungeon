import { Room, Client } from "@colyseus/core";
import { WorldState } from "./schema/WorldState";
import { DungeonState } from "./schema/DungeonState";
import { CharacterState } from "./schema/CharacterState";

// id, x, y, velocityX, velocityY, facing
type UpdateCharacterPosition = [string, number, number, number, number, number];
type RegisterEntity = [string, number, number, number, number, number, number];

export class DungeonRoom extends Room<DungeonState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new DungeonState());

    this.onMessage<UpdateCharacterPosition[]>("move", (_client, positions) =>
      positions.forEach((position) => {
        const character = this.state.entities.get(position[0]);
        if (!character) {
          return;
        }
        character.x = position[1];
        character.y = position[2];
        character.velocityX = position[3];
        character.velocityY = position[4];
        character.facing = position[5];
      })
    );

    this.onMessage<RegisterEntity[]>("registerEntities", (_client, entities) =>
      entities.forEach((entity) => {
        if (this.state.entities.get(entity[0])) {
          return;
        }
        const character = new CharacterState();
        character.x = entity[1];
        character.y = entity[2];
        character.velocityX = entity[3];
        character.velocityY = entity[4];
        character.facing = entity[5];
        character.health = entity[6];
        this.state.entities.set(entity[0], character);
      })
    );
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
