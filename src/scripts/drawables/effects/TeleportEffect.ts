import { AbilityType, ProjectileData } from '../../abilities/abilityData';
import {
	AbilityKey,
	Facings,
	FadingLabelSize,
	PossibleTargets,
	SCALE,
	SUMMONING_TYPE,
} from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import { getOneLetterFacingName, getRotationInRadiansForFacing, getVelocitiesForFacing, isCollidingTile } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import { updateAbility } from '../../worldstate/PlayerCharacter';
import AbilityEffect from './AbilityEffect';
import { NORMAL_ANIMATION_FRAME_RATE } from '../../helpers/constants';

export default class TeleportEffect extends AbilityEffect {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData,
	) {
		super(scene, x, y, 'empty-tile', facing, projectileData);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
        
		const playerCharacter = globalState.playerCharacter;
        const rotationFactors = getVelocitiesForFacing(playerCharacter.currentFacing);
        const px = globalState.playerCharacter.x * SCALE;
        const py = globalState.playerCharacter.y * SCALE;

        const playerToken = (this.scene as MainScene).mainCharacter;
        console.log('should teleport');
        (this.scene as MainScene).addFadingLabel("teleporting", FadingLabelSize.NORMAL, '#0000ff', px, py);
        const velocity = playerToken.body.velocity;
        playerToken.setVelocity(2500 * rotationFactors.x, 2500 * rotationFactors.y);
        playerCharacter.dashing = true;
        setTimeout(()=>{
            playerToken.setVelocity(velocity.x, velocity.y);
            playerCharacter.dashing = false;
        }, 50)
	}
}
