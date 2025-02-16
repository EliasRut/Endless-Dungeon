import { AbilityType } from '../../../../types/AbilityType';
import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, SUMMONING_TYPE } from '../../helpers/constants';
import CirclingEffect from './CirclingEffect';

export default class ArcaneCirclingEffect extends CirclingEffect {
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
			'arcaneAura',
			facing,
			projectileData,
			SUMMONING_TYPE.ARCANE_ELEMENTAL,
			AbilityType.ARCANE_SUMMON_CIRCLING,
			AbilityType.ARCANE_SUMMON_ELEMENTAL,
			AbilityType.ARCANE_BOLT
		);
	}
}
