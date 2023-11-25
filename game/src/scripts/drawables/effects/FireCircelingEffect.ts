import { AbilityType } from 'shared/AbilityType';
import { ProjectileData } from '../../abilities/abilityData';
import { Facings, SUMMONING_TYPE } from '../../helpers/constants';
import CircelingEffect from './CircelingEffect';

export default class FireCircelingEffect extends CircelingEffect {
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
			AbilityType.FIRE_SUMMON_CIRCELING,
			AbilityType.FIRE_SUMMON_ELEMENTAL,
			AbilityType.FIREBALL
		);
	}
}
