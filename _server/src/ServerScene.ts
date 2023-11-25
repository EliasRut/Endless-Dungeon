import "phaser";

export default class ServerScene extends Phaser.Scene {
  constructor() {
    super({ key: "ServerScene" });
  }
  update(globalTime: number, _delta: number) {
    console.log("update tick");
  }
}
