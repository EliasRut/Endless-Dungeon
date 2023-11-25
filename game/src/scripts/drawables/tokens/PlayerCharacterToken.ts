import { Faction } from '../../helpers/constants';
import globalState from '../../worldstate';
import CharacterToken from './CharacterToken';
import MainScene from '../../scenes/MainScene';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

export default class PlayerCharacterToken extends CharacterToken {
	constructor(scene: MainScene, x: number, y: number, id: string) {
		super(scene, x, y, 'empty-tile', 'player', id);
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		this.stateObject = globalState.playerCharacter;
		this.faction = Faction.PLAYER;
	}
}
