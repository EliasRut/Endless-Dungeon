import { Facings, Faction, PossibleTargets, UiDepths } from '../../helpers/constants';
import AbilityEffect from './AbilityEffect';
import MainScene from '../../scenes/MainScene';
import CharacterToken from '../tokens/CharacterToken';
import { VISITED_TILE_TINT } from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';
import { ProjectileData } from '../../abilities/abilityData';

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
		this.setScale(0.025);
		this.setOrigin(0.5, 0.5);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body.setCircle(BODY_RADIUS, 0, 0);
		this.body.setMass(100);
		this.tint = 0xff00ff;
		this.setVisible(false);

		const particles = scene.add.particles('rock');
		particles.setDepth(UiDepths.UI_FOREGROUND_LAYER);

		this.trailEmitter = particles.createEmitter({
			alpha: { start: 1, end: 0 },
			scale: { start: 0.01 * this.effectScale, end: 0 },
			speed: 70,
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

		this.coreEmitter = particles.createEmitter({
			alpha: { start: 1, end: 0, ease: 'ease-out' },
			// scale: { start: 0.033, end: 0.2 },
			scale: 0.033 * this.effectScale,
			angle: { min: 0, max: 360 },
			speed: { min: 0, max: 70 },
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
		this.trailEmitter.setDeathZone({ type: 'onEnter', source: this.particleDeathZone });
		this.coreEmitter.setDeathZone({ type: 'onEnter', source: this.particleDeathZone });

		if (projectileData?.timeToLive) {
			setTimeout(() => {
				this.destroy();
			}, projectileData?.timeToLive);
		}
	}

	destroy() {
		this.trailEmitter.stopFollow();
		if (this.body && this.explodeOnDestruction) {
			// this.trailEmitter.setEmitterAngle({min: 120, max: 240});
			this.trailEmitter.setSpeed({
				min: 0.1 * EXPLOSION_PARTICLE_SPEED,
				max: 1 * EXPLOSION_PARTICLE_SPEED,
			});
			this.trailEmitter.setLifespan({ min: 200, max: 400 });
			this.trailEmitter.setScale({ start: 0.03 * this.effectScale, end: 0 });
			this.trailEmitter.explode(40, this.body.x, this.body.y);

			this.coreEmitter.setSpeed({
				min: 0.4 * EXPLOSION_PARTICLE_SPEED,
				max: EXPLOSION_PARTICLE_SPEED,
			});
			this.coreEmitter.setLifespan({ min: 200, max: 700 });
			this.coreEmitter.setAlpha({ start: 1, end: 0 });
			this.coreEmitter.explode(8, this.body.x, this.body.y);

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
			this.trailEmitter.startFollow(this.body.gameObject);
			this.trailEmitter.start();
			this.coreEmitter.startFollow(this.body.gameObject);
			this.coreEmitter.start();
			this.setVisible(true);
			this.isStarted = true;
		}
	}
}
