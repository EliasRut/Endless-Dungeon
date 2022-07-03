import { AbilityType, ProjectileData } from '../../abilities/abilityData';
import { Facings, SCALE, UiDepths, SUMMONING_TYPE } from '../../helpers/constants';
import SummoningEffect from './SummoningEffect';

const RED_MIN = 0xcc0000;
const RED_DIFF = 0x010000;
const GREEN_DIFF = 0x000100;

export default class ArcaneSummoningEffect extends SummoningEffect {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData
	) {
		super(
			scene,
			x,
			y,
			'empty-tile',
			facing,
			projectileData,
			SUMMONING_TYPE.ARCANE_ELEMENTAL,
			AbilityType.ARCANE_SUMMON_CIRCELING
		);
	}

	drawSummoningAnimation(targetX: number, targetY: number): void {
		this.particles = this.scene.add.particles('arcaneAura');
		this.emitter = this.particles.createEmitter({
			alpha: { start: 1, end: 0 },
			scale: { start: 0.2 * this.effectScale * SCALE, end: 0.05 * SCALE },
			speed: 20 * SCALE,
			rotate: { min: -180, max: 180 },
			lifespan: { min: 200, max: 400 },
			tint: {
				onEmit: (particle) => {
					return (
						RED_MIN +
						RED_DIFF * Math.floor(Math.random() * 51) +
						GREEN_DIFF * 228 +
						Math.floor(Math.random() * 24) +
						Math.floor(128 + Math.random() * 127)
					);
				},
			},
			frequency: 20,
			maxParticles: 100,
		});

		this.particles.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.emitter.setEmitterAngle({ min: -180, max: 180 });
		this.emitter.setSpeed(70 * SCALE);
		this.emitter.setDeathZone({ type: 'onEnter', source: this.particleDeathZone });
		this.emitter.setScale({ start: 0.4 * this.effectScale, end: 0.05 });
		this.emitter.explode(20, targetX, targetY);
		this.emitter.setSpeed({ min: 5 * SCALE, max: 55 * SCALE });
		this.emitter.setScale({ start: 0.3 * this.effectScale * SCALE, end: 0.01 * SCALE });
		this.emitter.explode(10, targetX, targetY);
		setTimeout(() => {
			this.particles.destroy();
		}, 1000);
	}
}
