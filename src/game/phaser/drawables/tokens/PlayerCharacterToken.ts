import { Faction } from '../../helpers/constants';
import worldstate from '../../worldState';
import CharacterToken from './CharacterToken';
import MainScene from '../../scenes/MainScene';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

export default class PlayerCharacterToken extends CharacterToken {
	constructor(scene: MainScene, x: number, y: number) {
		super(scene, x, y, 'empty-tile', 'player', 'player');
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body!.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		this.stateObject = worldstate.playerCharacter;
		this.tokenData.faction = Faction.PLAYER;
	}
}
