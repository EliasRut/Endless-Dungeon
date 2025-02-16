import { AbilityType } from '../../../../types/AbilityType';
import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, SUMMONING_TYPE } from '../../helpers/constants';
import CircelingEffect from './CircelingEffect';

export default class ArcaneCircelingEffect extends CircelingEffect {
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
			AbilityType.ARCANE_SUMMON_CIRCELING,
			AbilityType.ARCANE_SUMMON_ELEMENTAL,
			AbilityType.ARCANE_BOLT
		);
	}
}
