import { Facings } from '../../helpers/constants';
import { getRotationInRadiansForFacing, getVelocitiesForFacing } from '../../helpers/movement';
import AbilityEffect from './AbilityEffect';

const SPRITE_SCALE = 0.5;
const BODY_RADIUS = 14;
const BODY_Y_OFFSET = 6;
const PARTICLE_START_X_OFFSET = -8;
const PARTICLE_START_Y_OFFSET = -8;
const EFFECT_DESTRUCTION_TIMEOUT_MS = 2000;

export default class IceSpikeEffect extends AbilityEffect {
	snowEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	spikeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	stuckEnemy?: Phaser.Physics.Arcade.Body;
	stuckEnemyOffset?: {x: number, y: number};
	constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings) {
		super(scene, x, y, 'ice', facing);
		this.setScale(SPRITE_SCALE);
		this.setRotation(getRotationInRadiansForFacing(facing));
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body.setCircle(BODY_RADIUS, 0, BODY_Y_OFFSET);
		this.body.setMass(1);

		const facingVectors = getVelocitiesForFacing(facing);

		const snowParticles = scene.add.particles('snow');
		snowParticles.setDepth(1);
		this.snowEmitter = snowParticles.createEmitter({
			alpha: { start: 1, end: 0.4 },
			// scale: { start: 0.3, end: 0.05 },
			scale: { start: 0.4, end: 0.1 },
			// tint: 0x3366ff,//{ start: 0xff945e, end: 0x660000 }, //0x663300
			speed: {min: 30, max: 100},
			// accelerationY: -300,
			angle: { min: -180, max: 180 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 700, max: 900 },
			frequency: 10,
			// blendMode: Phaser.BlendModes.ADD,
			maxParticles: 200,
			x: PARTICLE_START_X_OFFSET * facingVectors.x,
			y: PARTICLE_START_Y_OFFSET * facingVectors.y
		});
		this.snowEmitter.startFollow(this.body.gameObject);
		this.snowEmitter.start();

		const iceParticles = scene.add.particles('ice');
		iceParticles.setDepth(1);
		this.spikeEmitter = iceParticles.createEmitter({
			alpha: { start: 1, end: 0.4 },
			scale: { start: 0.4, end: 0 },
			speed: {min: 30, max: 100},
			angle: { min: -180, max: 180 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 400, max: 600 },
			frequency: 10,
			blendMode: Phaser.BlendModes.ADD,
			maxParticles: 200,
			x: PARTICLE_START_X_OFFSET * facingVectors.x,
			y: PARTICLE_START_Y_OFFSET * facingVectors.y
		});
		this.spikeEmitter.startFollow(this.body.gameObject);
		this.spikeEmitter.start();
	}

	attachToEnemy(enemy: Phaser.GameObjects.GameObject) {
		this.stuckEnemy = enemy.body as Phaser.Physics.Arcade.Body;
		this.stuckEnemyOffset = {
			x: this.stuckEnemy.position.x - this.body.x,
			y: this.stuckEnemy.position.y - this.body.y
		};
	}

	// tslint:disable: no-magic-numbers
	destroy() {
		this.snowEmitter.setEmitterAngle({min: -180, max: 180});
		this.snowEmitter.setSpeed({min:10, max: 120});
		this.snowEmitter.explode(40, this.body.x, this.body.y);
		setTimeout(() => {
			this.snowEmitter.setSpeed({min: 15, max: 40});
			this.snowEmitter.setFrequency(80);
			this.snowEmitter.setLifespan(1400);
			this.spikeEmitter.start();
		}, 0);
		this.spikeEmitter.stopFollow();
		this.spikeEmitter.setEmitterAngle({min: -180, max: 180});
		this.spikeEmitter.setSpeed({min:10, max: 120});
		this.spikeEmitter.explode(40, this.body.x, this.body.y);
		this.body.stop();
		this.body.destroy();

		setTimeout(() => {
			this.snowEmitter.stop();
			super.destroy();
		}, EFFECT_DESTRUCTION_TIMEOUT_MS);
	}
	// tslint:enable

	update() {
		if (this.stuckEnemy) {
			this.setPosition(
				this.stuckEnemy.position.x - this.stuckEnemyOffset!.x,
				this.stuckEnemy.position.y - this.stuckEnemyOffset!.y
			);
		}
	}
}