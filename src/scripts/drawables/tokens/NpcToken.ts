import { Faction } from '../../helpers/constants';
import globalState from '../../worldstate';
import Character from '../../worldstate/Character';
import CharacterToken from './CharacterToken';

const BODY_RADIUS = 10;
const BODY_X_OFFSET = 10;
const BODY_Y_OFFSET = 12;

const NPC_DAMAGE = 10;
const NPC_HEALTH = 10;
const NPC_SPEED = 80;

export default class NpcToken extends CharacterToken {

	constructor(scene: Phaser.Scene, x: number, y: number, type: string, id: string) {
		super(scene, x, y, 'empty-tile', type, id);
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		globalState.npcs[id] = new Character(
			type,
			NPC_DAMAGE,
			NPC_HEALTH,
			NPC_SPEED);

		this.play(`${type}-idle-s`);
		this.faction = Faction.NPCS;
	}
}
