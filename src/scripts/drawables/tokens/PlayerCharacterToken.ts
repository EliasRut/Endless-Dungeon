import { Faction } from '../../helpers/constants';
import globalState from '../../worldstate';
import CharacterToken from './CharacterToken';
import MainScene from '../../scenes/MainScene';
import { facingToSpriteNameMap } from '../../helpers/constants'

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

export default class PlayerCharacterToken extends CharacterToken {
	constructor(scene: MainScene, x: number, y: number) {
		super(scene, x, y, 'empty-tile', 'player', 'player');
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		this.stateObject = globalState.playerCharacter;
		this.faction = Faction.PLAYER;
	}
	// public receiveHit(damage: number){
	// 	super.receiveHit(damage);
	// 	if(super.receiveStun(250)) {
	// 		this.play({key: `player-damage-${facingToSpriteNameMap[this.stateObject.currentFacing]}`});
	// 	}
	// }
	// Duration should be multiples of 500!
	public receiveStun(duration: number){
		if(super.receiveStun(duration)) {
			this.play({key: `player-stun-${facingToSpriteNameMap[this.stateObject.currentFacing]}`,
		// 1 run = 500ms
		repeat: Math.floor(2 * duration / 1000)});
		return true;
		}
		return false;
	}
}
