import 'phaser';
import DungeonDoor from '../drawables/ui/DungeonDoor';

export default class DungeonDoorScene extends Phaser.Scene {
  dungeonDoor: DungeonDoor;

  constructor() {
		super({ key: 'DungeonDoorScene' });
	}

  create() {
    this.dungeonDoor = new DungeonDoor(this);
  }
}