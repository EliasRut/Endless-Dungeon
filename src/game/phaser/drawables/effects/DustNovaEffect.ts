import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings } from '../../helpers/constants';
import AbilityEffect from './AbilityEffect';

const BODY_RADIUS = 6;
const BODY_MASS = 10;
const EFFECT_DESTRUCTION_TIMEOUT_MS = 600;

export default class DustNovaEffect extends AbilityEffect {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
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
		this.body!.setCircle(BODY_RADIUS, 0, 0);
		this.body!.setMass(BODY_MASS);

		this.emitter = scene.add.particles(x, y, 'wind', {
			alpha: { start: 0.6, end: 0 },
			scale: { start: 0, end: 0.5 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 400, max: 600 },
			frequency: 60,
			maxParticles: 20,
		});
		this.emitter.setDepth(1);
		this.emitter.startFollow(this.body!);
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
