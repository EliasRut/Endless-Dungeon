import {
	Facings,
	SCALE,
	UiDepths,
	convertEmitterDataToScaledValues,
	multiplyParticleValueByScale,
} from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';
import { ProjectileData } from '../../abilities/abilityData';

const BODY_RADIUS = 4;
const VISIBILITY_DELAY = 50;

const RED_VAL = 0x010000;
const GREEN_VAL = 0x000100;
const BLUE_VAL = 0x000001;

export default class TrailingParticleProjectileEffect extends TargetingEffect {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
	projectileData: ProjectileData;
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
		this.body.setCircle(BODY_RADIUS, 0, 0);
		this.body.setMass(1);

		this.projectileData = projectileData;

		this.particles = scene.add.particles(
			projectileData.particleData?.particleImage || 'empty-tile'
		);
		const emitterData = {
			alpha: { start: 1, end: 0 },
			speed: 20,
			frequency: 20,
			maxParticles: 100,
			...(projectileData.particleData || {}),
		} as Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
		const tintData = projectileData.particleData?.tint;
		this.emitter = this.particles.createEmitter({
			...convertEmitterDataToScaledValues(emitterData),
			...(typeof tintData === 'object'
				? {
						tint: {
							onEmit: (particle) => {
								return (
									RED_VAL * (tintData.redMin + Math.floor(Math.random() * tintData.redDiff)) +
									GREEN_VAL * (tintData.greenMin + Math.floor(Math.random() * tintData.greenDiff)) +
									BLUE_VAL * (tintData.blueMin + Math.floor(Math.random() * tintData.blueDiff))
								);
							},
						},
				  }
				: typeof tintData === 'number'
				? { tint: tintData }
				: {}),
		});

		this.particles.setDepth(UiDepths.UI_FOREGROUND_LAYER);
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
			this.emitter.setDeathZone({ type: 'onEnter', source: this.particleDeathZone });
			this.emitter.setSpeed(
				multiplyParticleValueByScale(this.projectileData?.explosionData?.speed || 70) as any
			);
			this.emitter.setLifespan(
				multiplyParticleValueByScale(this.projectileData?.explosionData?.lifespan || 300) as any
			);
			this.emitter.explode(
				this.projectileData?.explosionData?.particles || 20,
				this.body.x + 6 * SCALE,
				this.body.y + 6 * SCALE
			);
		}

		setTimeout(() => {
			this.particles.destroy();
		}, 1000);
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
