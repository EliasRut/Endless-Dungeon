import { AbilityType } from '../../abilities/abilityData';
import MainScene from '../../scenes/MainScene';
import ElementalToken from './ElementalToken';

export default class FireElementalToken extends ElementalToken {
	constructor(scene: MainScene, x: number, y: number, level: number, id: string) {
		super(scene, x, y, 'firesprite', level, id, AbilityType.FIRE_NOVA);
	}
}
