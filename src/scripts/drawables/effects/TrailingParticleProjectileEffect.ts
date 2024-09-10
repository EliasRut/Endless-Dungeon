import {
	Facings,
	SCALE,
	UiDepths,
	convertEmitterDataToScaledValues,
	multiplyParticleValueByScale,
} from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';
import { ProjectileData } from '../../abilities/abilityData';
import globalState from '../../worldstate/index';

const BODY_RADIUS = 4;
const VISIBILITY_DELAY = 50;

const RED_VAL = 0x010000;
const GREEN_VAL = 0x000100;
const BLUE_VAL = 0x000001;

const getBodyOffset = (facing: Facings) => {
	switch (facing) {
		case Facings.NORTH:
			return { x: 4, y: 8 };
		case Facings.EAST:
			return { x: 0, y: 4 };
		case Facings.WEST:
			return { x: 8, y: 4 };
		case Facings.SOUTH:
			return { x: 4, y: 0 };
		case Facings.NORTH_EAST:
			return { x: 0, y: 8 };
		case Facings.SOUTH_EAST:
			return { x: 0, y: 0 };
		case Facings.NORTH_WEST:
			return { x: 8, y: 8 };
		case Facings.SOUTH_WEST:
			return { x: 8, y: 0 };
	}
};

export default class TrailingParticleProjectileEffect extends TargetingEffect {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
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
		this.setScale(SCALE * (projectileData.effectScale || 1));
		scene.physics.add.existing(this);

		const bodyOffset = getBodyOffset(facing);

		this.body!.setCircle(BODY_RADIUS, bodyOffset.x, bodyOffset.y);
		this.body!.setMass(1);

		this.projectileData = projectileData;

		const emitterData = {
			alpha: { start: 1, end: 0 },
			speed: 20,
			frequency: 20,
			maxParticles: 100,
			...(projectileData.particleData || {}),
		} as Phaser.Types.GameObjects.Particles.ParticleEmitterConfig;
		const tintData = projectileData.particleData?.tint;
		this.emitter = scene.add.particles(
			(this.width * SCALE) / 2 - bodyOffset.x,
			(this.height * SCALE) / 2 - bodyOffset.y,
			projectileData.particleData?.particleImage || 'empty-tile',
			{
				...convertEmitterDataToScaledValues(emitterData, projectileData.effectScale || 1),
				...(typeof tintData === 'object'
					? {
							tint: {
								onEmit: (particle) => {
									return (
										RED_VAL * (tintData.redMin + Math.floor(Math.random() * tintData.redDiff)) +
										GREEN_VAL *
											(tintData.greenMin + Math.floor(Math.random() * tintData.greenDiff)) +
										BLUE_VAL * (tintData.blueMin + Math.floor(Math.random() * tintData.blueDiff))
									);
								},
							},
					  }
					: typeof tintData === 'number'
					? { tint: tintData }
					: {}),
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
			this.emitter.addDeathZone({ type: 'onEnter', source: this.particleDeathZone });
			this.emitter.updateConfig({
				angle: { min: -180, max: 180 },
				speed: multiplyParticleValueByScale(
					this.projectileData?.explosionData?.speed || 70,
					this.projectileData.effectScale || 1
				) as any,
				lifespan: this.projectileData?.explosionData?.lifespan || 300,
			});

			this.emitter.explode(
				this.projectileData?.explosionData?.particles || 20,
				this.body.x + 6 * SCALE,
				this.body.y + 6 * SCALE
			);
		}

		this.lightingRadius = 4;
		this.lightingStrength = undefined;
		this.lightingMinStrength = 0;
		this.lightingMaxStrength = 4;
		this.lightingFrequency = 1000;
		this.lightingSeed = globalState.gameTime - 100;
		this.body!.destroy();
		this.setVisible(false);
		setTimeout(() => {
			this.emitter.destroy();
		}, 1000);
		setTimeout(() => {
			super.destroy();
		}, 500);
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
