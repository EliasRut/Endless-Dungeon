import { Facings } from '../../helpers/constants';
import AbilityEffect from './AbilityEffect';

const BODY_RADIUS = 6;
const EXPLOSION_PARTICLE_SPEED = 100;
const EXPLOSION_PARTICLE_COUNT = 10;

export default class FireBallEffect extends AbilityEffect {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings) {
		super(scene, x, y, 'empty-tile', facing);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body.setCircle(BODY_RADIUS, 0, 0);
		this.body.setMass(1);

		const particles = scene.add.particles('fire');
		particles.setDepth(1);
		this.emitter = particles.createEmitter({
			alpha: { start: 1, end: 0 },
			scale: { start: 0.3, end: 0.05 },
			speed: 20,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 400, max: 600 },
			blendMode: Phaser.BlendModes.ADD,
			frequency: 30,
			maxParticles: 200,
		});
		this.emitter.startFollow(this.body.gameObject);
		this.emitter.start();
	}

	destroy() {
		this.emitter.stopFollow();
		if (this.body) {
			this.emitter.setEmitterAngle({min: -180, max: 180});
			this.emitter.setSpeed(EXPLOSION_PARTICLE_SPEED);
			this.emitter.explode(EXPLOSION_PARTICLE_SPEED, this.body.x, this.body.y);
		}

		super.destroy();
	}
}
