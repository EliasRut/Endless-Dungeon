import { Facings } from '../../helpers/constants';
import AbilityEffect from './AbilityEffect';
import { ProjectileData } from '../../abilities/abilityData';

const BODY_RADIUS = 6;
const BODY_MASS = 10;
//const EFFECT_DESTRUCTION_TIMEOUT_MS = 1200;

export default class ConeEffect extends AbilityEffect {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings, projectileData: ProjectileData) {
		super(scene, x, y, 'empty-tile', facing, projectileData);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body.setCircle(BODY_RADIUS, 0, 0);
		this.body.setMass(BODY_MASS);

		const particles = scene.add.particles('wind');
		particles.setDepth(1);
		this.emitter = particles.createEmitter({
			alpha: { start: 0.6, end: 0 },
			scale: { start: 0, end: 0.5 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 400, max: 600 },
			frequency: 60,
			maxParticles: 20,
		});
		this.emitter.startFollow(this.body.gameObject);
		this.emitter.start();

		 if (projectileData?.timeToLive) {
		    setTimeout(() => {
		 	this.destroy();
		 }, projectileData?.timeToLive);
		}
	}

	destroy() {
		this.emitter.stop();

		super.destroy();
	}
}