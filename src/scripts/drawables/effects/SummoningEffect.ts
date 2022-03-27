import { AbilityType, ProjectileData } from '../../abilities/abilityData';
import {
	AbilityKey,
	Facings,
	Faction,
	PossibleTargets,
	SCALE,
	VISITED_TILE_TINT,
} from '../../helpers/constants';
import { getRotationInRadiansForFacing, getVelocitiesForFacing } from '../../helpers/movement';
import { spawnNpc } from '../../helpers/spawn';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import { updateAbility } from '../../worldstate/PlayerCharacter';
import CharacterToken from '../tokens/CharacterToken';
import AbilityEffect from './AbilityEffect';
import CircelingEffect from './CircelingEffect';
import TargetingEffect from './TargetingEffect';

const BODY_RADIUS = 12;
const OFFSET = 0;

export default class SummoningEffect extends TargetingEffect {
	allowedTargets: PossibleTargets = PossibleTargets.NONE;
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
		// this.body.setCircle(BODY_RADIUS, OFFSET, OFFSET);
		// this.body.setMass(1);

		const playerCharacter = globalState.playerCharacter;
		const summon = playerCharacter.activeSummons.find(
			(activeSummon) => activeSummon.summoningType === 'FIRE_ELEMENTAL'
		);
		if (summon) {
			const effect = (this.scene as MainScene).abilityHelper.abilityEffects.find(
				(ability) => (ability as any).id === summon.id
			);
			if (effect) {
				const targetX = effect.x;
				const targetY = effect.y;
				effect.destroy();

				updateAbility(scene as MainScene, playerCharacter, AbilityKey.TWO, AbilityType.FIRE_SUMMON);

				const unscaledX = targetX / SCALE;
				const unscaledY = targetY / SCALE;
				(this.scene as MainScene).addNpc(
					summon.id,
					'fire-elemental',
					unscaledX,
					unscaledY,
					1,
					1,
					0
				);

				const time = this.scene.time;
				(this.scene as MainScene).abilityHelper.triggerAbility(
					playerCharacter,
					{
						...playerCharacter,
						x: targetX,
						y: targetY,
					},
					AbilityType.FIRE_NOVA,
					1,
					time.now
				);
			}
		}
	}
}
