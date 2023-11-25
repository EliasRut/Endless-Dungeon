import { AbilityType } from 'shared/AbilityType';
import { ProjectileData } from '../../abilities/abilityData';
import {
	Facings,
	SCALE,
	UiDepths,
	SUMMONING_TYPE,
	PossibleTargets,
	FadingLabelSize,
} from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import Character from '../../worldstate/Character';
import CharacterToken from '../tokens/CharacterToken';
import InstantEffect, { InstantEffectShape } from './InstantEffect';
import SummoningEffect from './SummoningEffect';

const RED_MIN = 0xcc0000;
const RED_DIFF = 0x010000;
const GREEN_DIFF = 0x000100;

export default class BloodDrainEffect extends InstantEffect {
	damage: number;
	caster: Character;
	abilityLevel: number;
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData,
		effectData: { damage: number; caster: Character; abilityLevel: number }
	) {
		super(
			scene,
			x,
			y,
			'empty-tile',
			facing,
			projectileData,
			PossibleTargets.ENEMIES,
			700,
			InstantEffectShape.CIRCLE,
			1,
			false
		);
		this.damage = effectData.damage;
		this.caster = effectData.caster;
		this.abilityLevel = effectData.abilityLevel;
	}

	drawEffect(targetX: number, targetY: number) {
		// this.particles = this.scene.add.particles('arcaneAura');
		// this.emitter = this.particles.createEmitter({
		// 	alpha: { start: 1, end: 0 },
		// 	scale: { start: 0.2 * this.effectScale * SCALE, end: 0.05 * SCALE },
		// 	speed: 20 * SCALE,
		// 	rotate: { min: -180, max: 180 },
		// 	lifespan: { min: 200, max: 400 },
		// 	tint: {
		// 		onEmit: (particle) => {
		// 			return (
		// 				RED_MIN +
		// 				RED_DIFF * Math.floor(Math.random() * 51) +
		// 				GREEN_DIFF * 228 +
		// 				Math.floor(Math.random() * 24) +
		// 				Math.floor(128 + Math.random() * 127)
		// 			);
		// 		},
		// 	},
		// 	frequency: 20,
		// 	maxParticles: 100,
		// });
		// const mainScene = this.scene as MainScene;
		// mainScene.abilityHelper.triggerAbility(this.caster, )
		// const playerCharacter = globalState.playerCharacter;
		// this.particles.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		// this.emitter.setEmitterAngle({ min: -180, max: 180 });
		// this.emitter.setSpeed(70 * SCALE);
		// this.emitter.setDeathZone({ type: 'onEnter', source: this.particleDeathZone });
		// this.emitter.setScale({ start: 0.4 * this.effectScale, end: 0.05 });
		// this.emitter.explode(20, targetX, targetY);
		// this.emitter.setSpeed({ min: 5 * SCALE, max: 55 * SCALE });
		// this.emitter.setScale({ start: 0.3 * this.effectScale * SCALE, end: 0.01 * SCALE });
		// this.emitter.explode(10, targetX, targetY);
		// setTimeout(() => {
		// 	this.particles.destroy();
		// }, 1000);
	}

	applyEffect(target: CharacterToken) {
		if (target.stateObject) {
			target.takeDamage(this.damage);
			target.receiveHit();

			const tx = target.x;
			const ty = target.y;
			const casterX = this.caster.x * SCALE;
			const casterY = this.caster.y * SCALE;
			const deltaX = casterX - tx;
			const deltaY = casterY - ty;
			const totalDistance = Math.abs(casterX - tx) + Math.abs(casterY - ty);
			const mainScene = this.scene as MainScene;
			mainScene.abilityHelper.triggerAbility(
				this.caster,
				{
					...target.stateObject,
					exactTargetXFactor: deltaX / totalDistance,
					exactTargetYFactor: deltaY / totalDistance,
				},
				AbilityType.BLOOD_DRAIN_PROJECTILE,
				this.abilityLevel,
				mainScene.time.now,
				0
			);
		}
	}
}
