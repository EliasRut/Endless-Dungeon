import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, SCALE, UiDepths } from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';

const BODY_RADIUS = 6;
const EXPLOSION_PARTICLE_SPEED = 100;
const EXPLOSION_PARTICLE_COUNT = 10;

const RED_MIN = 0x330000;
const RED_MAX = 0xff0000;
const RED_DIFF = 0x010000;
const GREEN_DIFF = 0x000100;

const VISIBILITY_DELAY = 25;

export default class ArcaneBoltEffect extends TargetingEffect {
	coreEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData
	) {
		super(scene, x, y, 'empty-tile', facing, projectileData);
		this.setScale(0.025 * SCALE);
		this.setOrigin(0.5, 0.5);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body!.setCircle(BODY_RADIUS, 0, 0);
		this.body!.setMass(100);
		this.tint = 0xff00ff;
		this.setVisible(false);

		this.trailEmitter = scene.add.particles(x, y, 'rock', {
			alpha: { start: 1, end: 0 },
			scale: { start: 0.01 * this.effectScale * SCALE, end: 0 },
			speed: 70 * SCALE,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 500, max: 800 }, // used to be: { min: 200, max: 400 },
			blendMode: Phaser.BlendModes.ADD,
			// tint: {min: 0x000000, max: 0xffffff},
			tint: {
				onEmit: (particle) => {
					return (
						RED_DIFF * Math.floor(Math.random() * 256) +
						GREEN_DIFF * Math.floor(Math.random() * 56) +
						Math.floor(Math.random() * 256)
					); // + 128;
				},
			},
			frequency: 0,
			maxParticles: 200,
		});
		this.trailEmitter.setDepth(UiDepths.UI_FOREGROUND_LAYER);

		this.coreEmitter = scene.add.particles(x, y, 'rock', {
			alpha: { start: 1, end: 0, ease: 'ease-out' },
			// scale: { start: 0.033, end: 0.2 },
			scale: 0.033 * this.effectScale * SCALE,
			angle: { min: 0, max: 360 },
			speed: { min: 0 * SCALE, max: 70 * SCALE },
			rotate: { min: -180, max: 180 },
			lifespan: 800, // used to be: 300,
			blendMode: Phaser.BlendModes.ADD,
			tint: {
				onEmit: (particle) => {
					return (
						RED_MIN +
						RED_DIFF *
							// tslint:disable-next-line: no-magic-numbers
							Math.floor(Math.random() * 128) +
						Math.floor(Math.random() * 256)
					);
				},
			},
			frequency: 0,
			maxParticles: 2000,
		});
		this.trailEmitter.addDeathZone({ type: 'onEnter', source: this.particleDeathZone });
		this.coreEmitter.addDeathZone({ type: 'onEnter', source: this.particleDeathZone });

		if (projectileData?.timeToLive) {
			setTimeout(() => {
				this.destroy();
			}, projectileData?.timeToLive);
		}
	}

	destroy() {
		this.trailEmitter.stopFollow();
		if (this.body! && this.explodeOnDestruction) {
			// this.trailEmitter.setEmitterAngle({min: 120, max: 240});
			this.trailEmitter.updateConfig({
				speed: {
					min: 0.1 * EXPLOSION_PARTICLE_SPEED * SCALE,
					max: 1 * EXPLOSION_PARTICLE_SPEED * SCALE,
				},
				lifespan: { min: 200, max: 400 },
				scale: {
					start: 0.03 * this.effectScale * SCALE,
					end: 0 * SCALE,
				},
			});
			this.trailEmitter.explode(40, this.body!.x, this.body!.y);

			this.coreEmitter.updateConfig({
				speed: {
					min: 0.4 * EXPLOSION_PARTICLE_SPEED * SCALE,
					max: EXPLOSION_PARTICLE_SPEED * SCALE,
				},
				lifespan: { min: 200, max: 700 },
				alpha: { start: 1, end: 0 },
			});
			this.coreEmitter.explode(8, this.body!.x, this.body!.y);

			setTimeout(() => {
				this.coreEmitter.stopFollow();
			}, 300);
		} else {
			this.coreEmitter.stopFollow();
		}

		super.destroy();
	}

	update(time: number) {
		super.update(time);
		if (time - this.castTime > VISIBILITY_DELAY && !this.isStarted) {
			this.trailEmitter.startFollow(this.body!);
			this.trailEmitter.start();
			this.coreEmitter.startFollow(this.body!);
			this.coreEmitter.start();
			this.setVisible(true);
			this.isStarted = true;
		}
	}
}
