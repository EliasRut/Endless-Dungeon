import { AbilityType } from '../../../../types/AbilityType';
import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, SUMMONING_TYPE } from '../../helpers/constants';
import CircelingEffect from './CircelingEffect';

export default class IceCircelingEffect extends CircelingEffect {
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
			AbilityType.ICE_SUMMON_CIRCELING,
			AbilityType.ICE_SUMMON_ELEMENTAL,
			AbilityType.ICESPIKE
		);
	}
}
