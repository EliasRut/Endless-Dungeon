import { Facings, SCALE, UiDepths } from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';
import { ProjectileData } from '../../../../types/ProjectileData';

const BODY_RADIUS = 6;
const OFFSET = -5;
const VISIBILITY_DELAY = 0;

export default class CondemnEffect extends TargetingEffect {
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
		this.seekingSpeed = 5000 * SCALE;
		//this.setDepth(1);
		this.setDepth(UiDepths.TOKEN_FOREGROUND_LAYER);
		this.setScale(SCALE);
		this.setOrigin(0);
		scene.physics.add.existing(this);
		this.body!.setCircle(BODY_RADIUS, OFFSET, OFFSET);
		this.body!.setMass(1);

		this.emitter = scene.add.particles(x, y, 'rock', {
			alpha: { start: 1, end: 0 },
			scale: { start: 0.04 * this.effectScale * SCALE, end: 0.03 * SCALE },
			speed: 6 * SCALE,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 2000, max: 4000 },
			blendMode: Phaser.BlendModes.ADD,
			tint: 0x3333ff,
			frequency: 20,
			maxParticles: 120,
		});

		this.emitter.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		if (projectileData?.timeToLive) {
			setTimeout(() => {
				this.destroy();
			}, projectileData?.timeToLive);
		}
	}

	destroy() {
		this.emitter.stopFollow();
		if (this.body && this.explodeOnDestruction) {
			this.emitter.updateConfig({
				angle: { min: -180, max: 180 },
				speed: 70 * SCALE,
				scale: { start: 0.4 * this.effectScale, end: 0.05 },
			});
			this.emitter.addDeathZone({ type: 'onEnter', source: this.particleDeathZone });
			this.emitter.explode(20, this.body.x + 6 * SCALE, this.body.y + 6 * SCALE);

			this.emitter.updateConfig({
				speed: { min: 5 * SCALE, max: 55 * SCALE },
				scale: { start: 0.3 * this.effectScale * SCALE, end: 0.01 * SCALE },
			});
			this.emitter.explode(10, this.body.x + 6 * SCALE, this.body.y + 6 * SCALE);
		}

		setTimeout(() => {
			this.emitter.destroy();
		}, 1000);
		super.destroy();
	}

	update(time: number) {
		super.update(time);
		if (time - this.castTime > VISIBILITY_DELAY && !this.isStarted) {
			this.emitter.startFollow(this.body!);
			this.emitter.start();
			this.isStarted = true;
		}
	}
}
