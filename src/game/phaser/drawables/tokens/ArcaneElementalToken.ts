import { AbilityType } from '../../../../types/AbilityType';
import MainScene from '../../scenes/MainScene';
import ElementalToken from './ElementalToken';

export default class ArcaneElementalToken extends ElementalToken {
	constructor(
		scene: MainScene,
		x: number,
		y: number,
		tokenName: string,
		level: number,
		id: string
	) {
		super(scene, x, y, tokenName, level, id, AbilityType.ARCANE_NOVA);
	}
}
