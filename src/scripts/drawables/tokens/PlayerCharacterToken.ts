import globalState from '../../worldstate';
import CharacterToken from './CharacterToken';

const BODY_RADIUS = 10;
const BODY_X_OFFSET = 10;
const BODY_Y_OFFSET = 12;

export default class PlayerCharacterToken extends CharacterToken {
	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, 'empty-tile');
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		this.stateObject = globalState.playerCharacter;
	}
}
