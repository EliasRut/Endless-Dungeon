import { NpcScript } from '../../../../typings/custom';
import { Faction } from '../../helpers/constants';
import Character from '../../worldstate/Character';

export default class CharacterToken extends Phaser.Physics.Arcade.Sprite {
	stateObject: Character;
	id: string;
	type: string;
	script?: NpcScript;
	isBeingMoved?: boolean;
	faction: Faction;

	constructor(
			scene: Phaser.Scene,
			x: number,
			y: number,
			tileName: string,
			type: string,
			id: string
		) {
		super(scene, x, y, tileName);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.type = type;
		this.id = id;
	}
}
