import { AbilityType } from '../../../types/AbilityType';
import { ProjectileData } from '../../../types/ProjectileData';
import { Facings, SUMMONING_TYPE } from '../../helpers/constants';
import CircelingEffect from './CircelingEffect';

export default class NecroticCircelingEffect extends CircelingEffect {
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
			'necroticAura',
			facing,
			projectileData,
			SUMMONING_TYPE.NECROTIC_ELEMENTAL,
			AbilityType.NECROTIC_SUMMON_CIRCELING,
			AbilityType.NECROTIC_SUMMON_ELEMENTAL,
			AbilityType.NECROTIC_BOLT
		);
	}
}
