import { Faction } from '../../helpers/constants';
import globalState from '../../worldstate';
import CharacterToken from './CharacterToken';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 11;
const BODY_Y_OFFSET = 10;

export default class PlayerCharacterToken extends CharacterToken {
	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, 'empty-tile', 'player', 'player');
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		this.stateObject = globalState.playerCharacter;
		this.faction = Faction.PLAYER;
	}
}
