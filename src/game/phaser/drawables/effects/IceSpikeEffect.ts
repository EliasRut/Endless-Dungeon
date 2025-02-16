import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, SCALE, UiDepths } from '../../helpers/constants';
import {
	getFacing8Dir,
	getRotationInRadiansForFacing,
	getVelocitiesForFacing,
} from '../../helpers/movement';
import TargetingEffect from './TargetingEffect';

const VISIBILITY_DELAY = 50;
const SPRITE_SCALE = 1;
const BODY_RADIUS = 3;
const BODY_X_OFFSET = 5;
const BODY_Y_OFFSET = 5;
const PARTICLE_START_X_OFFSET = -8;
const PARTICLE_START_Y_OFFSET = -8;
const EFFECT_DESTRUCTION_TIMEOUT_MS = 2000;

export default class IceSpikeEffect extends TargetingEffect {
	snowEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	spikeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	wasStuckToEnemy: boolean = false;
	stuckEnemy?: Phaser.Physics.Arcade.Body;
	stuckEnemyOffset?: { x: number; y: number };
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData
	) {
		super(scene, x, y, 'ice', facing, projectileData);
		this.setScale(SPRITE_SCALE * (projectileData.spriteScale || 1) * SCALE);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body!.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);
		this.body!.setMass(1);

		const facingVectors = getVelocitiesForFacing(facing);

		this.snowEmitter = scene.add.particles(x, y, 'snow', {
			alpha: { start: 1, end: 0.4 },
			// scale: { start: 0.3, end: 0.05 },
			scale: { start: 0.3 * (projectileData.effectScale || 1) * SCALE, end: 0.15 * SCALE },
			// tint: 0x3366ff,//{ start: 0xff945e, end: 0x660000 }, //0x663300
			speed: { min: 60 * SCALE, max: 100 * SCALE },
			// accelerationY: -300,
			angle: { min: -180, max: 180 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 400, max: 600 },
			frequency: 10,
			// blendMode: Phaser.BlendModes.ADD,
			maxParticles: projectileData.shape === 'cone' || projectileData.shape === 'nova' ? 20 : 200,
			x: PARTICLE_START_X_OFFSET * facingVectors.x * SCALE,
			y: PARTICLE_START_Y_OFFSET * facingVectors.y * SCALE,
		});
		this.snowEmitter.setDepth(1);

		this.spikeEmitter = scene.add.particles(x, y, 'ice', {
			alpha: { start: 1, end: 0.4 },
			scale: { start: 0.3 * (projectileData.effectScale || 1) * SCALE, end: 0 },
			speed: { min: 60 * SCALE, max: 100 * SCALE },
			angle: { min: -180, max: 180 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 400, max: 600 },
			frequency: 1,
			blendMode: Phaser.BlendModes.ADD,
			maxParticles: projectileData.shape === 'cone' || projectileData.shape === 'nova' ? 20 : 200,
			x: PARTICLE_START_X_OFFSET * facingVectors.x * SCALE,
			y: PARTICLE_START_Y_OFFSET * facingVectors.y * SCALE,
		});
		this.spikeEmitter.setDepth(UiDepths.UI_FOREGROUND_LAYER);

		this.snowEmitter.addDeathZone({ type: 'onEnter', source: this.particleDeathZone });
		this.spikeEmitter.addDeathZone({ type: 'onEnter', source: this.particleDeathZone });

		if (projectileData?.timeToLive) {
			setTimeout(() => {
				this.destroy();
			}, projectileData?.timeToLive);
		}
	}

	onCollisionWithEnemy(enemy: Phaser.GameObjects.GameObject) {
		this.wasStuckToEnemy = true;
		this.stuckEnemy = enemy.body as Phaser.Physics.Arcade.Body;
		this.stuckEnemyOffset = {
			x: this.stuckEnemy.position.x - this.body!.x - this.body!.velocity.x,
			y: this.stuckEnemy.position.y - this.body!.y - this.body!.velocity.y,
		};
	}

	// tslint:disable: no-magic-numbers
	destroy() {
		this.snowEmitter.updateConfig({
			angle: { min: -180, max: 180 },
			speed: { min: 10 * SCALE, max: 40 * SCALE },
		});
		this.snowEmitter.explode(100, this.body!.x, this.body!.y);

		setTimeout(() => {
			this.snowEmitter.updateConfig({
				speed: { min: 15 * SCALE, max: 40 * SCALE },
				frequency: 80,
				lifespan: 700,
			});
			this.spikeEmitter.start();
		}, 0);

		this.spikeEmitter.stopFollow();
		this.spikeEmitter.updateConfig({
			angle: { min: -180, max: 180 },
			speed: { min: 10 * SCALE, max: 40 * SCALE },
		});
		this.spikeEmitter.explode(10, this.body!.x, this.body!.y);
		this.body!.stop();
		this.body!.destroy();

		if (this.explodeOnDestruction || this.stuckEnemy) {
			setTimeout(() => {
				this.snowEmitter.stop();
				super.destroy();
			}, EFFECT_DESTRUCTION_TIMEOUT_MS);
		} else {
			this.snowEmitter.stop();
			super.destroy();
		}
	}
	// tslint:enable

	update(time: number) {
		super.update(time);

		if (this.body!.velocity.x || this.body!.velocity.y) {
			this.setRotation(
				getRotationInRadiansForFacing(getFacing8Dir(this.body!.velocity.x, this.body!.velocity.y)) -
					0.5 * Math.PI
			);
		}
		if (time - this.castTime > VISIBILITY_DELAY && !this.isStarted) {
			this.snowEmitter.startFollow(this.body!);
			this.spikeEmitter.startFollow(this.body!);
			this.snowEmitter.start();
			this.spikeEmitter.start();
			this.isStarted = true;
		}
		if (this.wasStuckToEnemy) {
			if (this.stuckEnemy) {
				this.setPosition(
					this.stuckEnemy.position.x - this.stuckEnemyOffset!.x,
					this.stuckEnemy.position.y - this.stuckEnemyOffset!.y
				);
			} else {
				this.spikeEmitter.stop();
				this.snowEmitter.stop();
				super.destroy();
			}
		}
	}
}
