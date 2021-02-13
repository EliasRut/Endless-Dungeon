import { NpcScript } from '../../../../typings/custom';
import { Faction } from '../../helpers/constants';
import Door from '../../worldstate/Door';

export default class CharacterToken extends Phaser.Physics.Arcade.Sprite {
	stateObject: Door;
	id: string;
	type: string;
	script?: NpcScript;
	faction: Faction;

	constructor(
			scene: Phaser.Scene,
			x: number,
			y: number,
			tileName: string,
			id: string
		) {
		super(scene, x, y, tileName);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.id = id;
	}

	open() {

	}

	close() {
		
	}
}
