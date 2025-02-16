import { AbilityType } from '../../../../types/AbilityType';
import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, SUMMONING_TYPE } from '../../helpers/constants';
import CirclingEffect from './CirclingEffect';

export default class IceCirclingEffect extends CirclingEffect {
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
			'iceAura',
			facing,
			projectileData,
			SUMMONING_TYPE.ICE_ELEMENTAL,
			AbilityType.ICE_SUMMON_CIRCLING,
			AbilityType.ICE_SUMMON_ELEMENTAL,
			AbilityType.ICE_SPIKE
		);
	}
}
