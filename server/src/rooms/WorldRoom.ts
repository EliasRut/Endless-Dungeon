import { Room, Client } from "@colyseus/core";
import { WorldState } from "./schema/WorldState";

type ResourcePayload = [string, number];

export class WorldRoom extends Room<WorldState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new WorldState());

    this.onMessage<ResourcePayload[]>("addResources", (_client, resources) =>
      resources.forEach((resource) =>
        this.state.resources.set(
          resource[0],
          (this.state.resources.get(resource[0]) || 0) + resource[1]
        )
      )
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
