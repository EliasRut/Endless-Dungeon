import { AbilityType } from 'shared/AbilityType';
import MainScene from '../../scenes/MainScene';
import ElementalToken from './ElementalToken';

export default class IceElementalToken extends ElementalToken {
	constructor(
		scene: MainScene,
		x: number,
		y: number,
		tokenName: string,
		level: number,
		id: string
	) {
		super(scene, x, y, tokenName, level, id, AbilityType.ICE_NOVA);
	}
}
