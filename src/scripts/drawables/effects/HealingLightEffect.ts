import { Facings } from '../../helpers/constants';
import AbilityEffect from './AbilityEffect';
import worldstate from '../../worldState';
import { ProjectileData } from '../../../types/ProjectileData';

const BODY_RADIUS = 6;
const EFFECT_DESTRUCTION_TIMEOUT_MS = 300;
const HEALING_STRENGTH = 20;

export default class HealingLightEffect extends AbilityEffect {
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
		this.body!.setMass(0);

		this.emitter = scene.add.particles(x, y, 'fire', {
			alpha: { start: 0.4, end: 0 },
			scale: { start: 0, end: 0.8 },
			speed: 40,
			angle: { min: -180, max: 180 },
			rotate: { min: -180, max: 180 },
			lifespan: { min: 200, max: 240 },
			blendMode: Phaser.BlendModes.LUMINOSITY,
			frequency: 20,
			maxParticles: 40,
		});
		this.emitter.setDepth(1);
		this.emitter.startFollow(this.body!);
		this.emitter.start();

		worldstate.playerCharacter.health = Math.min(
			worldstate.playerCharacter.health + HEALING_STRENGTH,
			worldstate.playerCharacter.maxHealth
		);

		setTimeout(() => {
			this.destroy();
		}, EFFECT_DESTRUCTION_TIMEOUT_MS);
	}

	destroy() {
		this.emitter.stop();

		super.destroy();
	}

	update() {
		this.setPosition(worldstate.playerCharacter.x, worldstate.playerCharacter.y);
	}
}
