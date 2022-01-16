import { Facings, SCALE, UiDepths } from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';
import { ProjectileData } from '../../abilities/abilityData';
import MainScene from '../../scenes/MainScene';
import { isCollidingTile } from '../../helpers/movement';

const BODY_RADIUS = 6;
const EXPLOSION_PARTICLE_SPEED = 100;
const VISIBILITY_DELAY = 50;

const RED_MIN = 0xcc0000;
const RED_DIFF = 0x010000;
const GREEN_DIFF = 0x000100;

export default class FireBallEffect extends TargetingEffect {
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
		this.setDepth(UiDepths.TOKEN_FOREGROUND_LAYER);
		this.setScale(SCALE);
		scene.physics.add.existing(this);
		this.body.setCircle(BODY_RADIUS, 0, 0);
		this.body.setMass(1);

		const particles = scene.add.particles('fire');
		this.emitter = particles.createEmitter({
			alpha: { start: 1, end: 0 },
			scale: { start: 0.2 * this.effectScale * SCALE, end: 0.05 * SCALE },
			speed: 20 * SCALE,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 200, max: 400 },
			// blendMode: Phaser.BlendModes.ADD,
			tint: {
				onEmit: (particle) => {
					return (
						RED_MIN +
						RED_DIFF * Math.floor(Math.random() * 51) +
						GREEN_DIFF * 228 +
						Math.floor(Math.random() * 24) +
						Math.floor(128 + Math.random() * 127)
					); // + 128;
				},
			},
			frequency: 20,
			maxParticles: 100,
		});

		particles.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		if (projectileData?.timeToLive) {
			setTimeout(() => {
				this.destroy();
			}, projectileData?.timeToLive);
		}
	}

	destroy() {
		this.emitter.stopFollow();
		if (this.body && this.explodeOnDestruction) {
			this.emitter.setEmitterAngle({ min: -180, max: 180 });
			this.emitter.setSpeed(70 * SCALE);
			this.emitter.setDeathZone({ type: 'onEnter', source: this.particleDeathZone });
			this.emitter.setScale({ start: 0.4 * this.effectScale, end: 0.05 });
			this.emitter.explode(20, this.body.x + 6 * SCALE, this.body.y + 6 * SCALE);
			this.emitter.setSpeed({ min: 5 * SCALE, max: 55 * SCALE });
			this.emitter.setScale({ start: 0.3 * this.effectScale * SCALE, end: 0.01 * SCALE });
			this.emitter.explode(10, this.body.x + 6 * SCALE, this.body.y + 6 * SCALE);
		}

		super.destroy();
	}

	update(time: number) {
		super.update(time);
		if (time - this.castTime > VISIBILITY_DELAY && !this.isStarted) {
			this.emitter.startFollow(this.body.gameObject);
			this.emitter.start();
			this.isStarted = true;
		}
	}
}
