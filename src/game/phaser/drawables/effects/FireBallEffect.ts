import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, SCALE, UiDepths } from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';

const BODY_RADIUS = 4;
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
		super(scene, x, y, projectileData.projectileImage || 'empty-tile', facing, projectileData);
		scene.add.existing(this);
		this.setDepth(UiDepths.TOKEN_FOREGROUND_LAYER);
		this.setScale(SCALE);
		scene.physics.add.existing(this);
		this.body!.setCircle(BODY_RADIUS, 0, 0);
		this.body!.setMass(1);

		this.emitter = scene.add.particles(
			(this.width * SCALE) / 2,
			(this.height * SCALE) / 2,
			projectileData.particleData?.particleImage || 'fire',
			{
				alpha: { start: 1, end: 0 },
				scale: { start: this.effectScale * SCALE, end: 0.2 * SCALE },
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
			}
		);

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
				scale: { start: this.effectScale, end: 0.125 },
			});
			this.emitter.addDeathZone({ type: 'onEnter', source: this.particleDeathZone });
			this.emitter.explode(20, this.body.x + 6 * SCALE, this.body.y + 6 * SCALE);

			this.emitter.updateConfig({
				speed: { min: 5 * SCALE, max: 55 * SCALE },
				scale: { start: 0.8 * this.effectScale * SCALE, end: 0.1 * SCALE },
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
