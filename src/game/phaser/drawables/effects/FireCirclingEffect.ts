import { AbilityType } from '../../../../types/AbilityType';
import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, SUMMONING_TYPE } from '../../helpers/constants';
import CirclingEffect from './CirclingEffect';

export default class FireCirclingEffect extends CirclingEffect {
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
			'firesprite',
			facing,
			projectileData,
			SUMMONING_TYPE.FIRE_ELEMENTAL,
			AbilityType.FIRE_SUMMON_CIRCLING,
			AbilityType.FIRE_SUMMON_ELEMENTAL,
			AbilityType.FIREBALL
		);
	}
}
