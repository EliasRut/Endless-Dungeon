import { Facings } from '../../helpers/constants';
import AbilityEffect from './AbilityEffect';

const BODY_RADIUS = 6;
const BODY_MASS = 10;
const EFFECT_DESTRUCTION_TIMEOUT_MS = 200;

export default class RoundHouseKickEffect extends AbilityEffect {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings) {
		super(scene, x, y, 'empty-tile', facing);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body.setCircle(BODY_RADIUS, 0, 0);
		this.body.setMass(BODY_MASS);

		const particles = scene.add.particles('wind');
		particles.setDepth(1);
		this.emitter = particles.createEmitter({
			alpha: { start: 0.6, end: 0 },
			scale: { start: 0, end: 0.6 },
			lifespan: { min: 400, max: 600 },
			frequency: 100,
			maxParticles: 1,
		});
		this.emitter.startFollow(this.body.gameObject);
		this.emitter.start();

		setTimeout(() => {
			this.destroy();
		}, EFFECT_DESTRUCTION_TIMEOUT_MS);
	}

	destroy() {
		this.emitter.stop();

		super.destroy();
	}
}