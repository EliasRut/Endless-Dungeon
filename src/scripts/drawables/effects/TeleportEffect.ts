import { AbilityType, ProjectileData } from '../../abilities/abilityData';
import {
	AbilityKey,
	Facings,
	FadingLabelSize,
	PossibleTargets,
	SCALE,
	SUMMONING_TYPE,
	UiDepths,
} from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import {
	getOneLetterFacingName,
	getRotationInRadiansForFacing,
	getVelocitiesForFacing,
	isCollidingTile,
} from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import { updateAbility } from '../../worldstate/PlayerCharacter';
import AbilityEffect from './AbilityEffect';
import { NORMAL_ANIMATION_FRAME_RATE } from '../../helpers/constants';

const RED_DIFF = 0x010000;
const GREEN_DIFF = 0x000100;
const TELEPORT_VELOCITY = 600;

export default class TeleportEffect extends AbilityEffect {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData
	) {
		super(scene, x, y, 'empty-tile', facing, projectileData);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);

		const playerCharacter = globalState.playerCharacter;
		const rotationFactors = getVelocitiesForFacing(playerCharacter.currentFacing);

		const playerToken = (this.scene as MainScene).mainCharacter;
		const velocity = playerToken.body.velocity;
		playerToken.setVelocity(
			TELEPORT_VELOCITY * SCALE * rotationFactors.x,
			TELEPORT_VELOCITY * SCALE * rotationFactors.y
		);
		playerToken.body.checkCollision.none = true;
		playerCharacter.dashing = true;
		playerToken.alpha = 0.2;

		const particles = scene.add.particles('rock');
		particles.setDepth(UiDepths.UI_FOREGROUND_LAYER);

		const trailEmitter = particles.createEmitter({
			alpha: { start: 1, end: 1 },
			scale: { start: 0.4 * this.effectScale * SCALE, end: 0 },
			speed: 0,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 200, max: 400 }, // used to be: { min: 200, max: 400 },
			blendMode: Phaser.BlendModes.ADD,
			// tint: {min: 0x000000, max: 0xffffff},
			tint: {
				onEmit: (particle) => {
					return (
						RED_DIFF * Math.floor(Math.random() * 256) +
						GREEN_DIFF * Math.floor(Math.random() * 56) +
						Math.floor(Math.random() * 256)
					); // + 128;
				},
			},
			frequency: 0,
			maxParticles: 200,
		});

		trailEmitter.startFollow(playerToken);

		setTimeout(() => {
			playerToken.setVelocity(velocity.x, velocity.y);
			playerCharacter.dashing = false;
			playerToken.body.checkCollision.none = false;
			playerToken.alpha = 1;
			trailEmitter.stopFollow();
		}, 200);
	}
}
