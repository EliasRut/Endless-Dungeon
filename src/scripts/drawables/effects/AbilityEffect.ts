import { ProjectileData } from '../../abilities/abilityData';
import { Facings, PossibleTargets } from '../../helpers/constants';
import CharacterToken from '../tokens/CharacterToken';

export default class AbilityEffect extends Phaser.Physics.Arcade.Sprite {
		effectScale: number;
		destroyed = false;
		castTime: number;
		isStarted: boolean = false;
		explodeOnDestruction: boolean;
		hitEnemyTokens: CharacterToken[] = [];
		constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings, projectileData?: ProjectileData) {
			super(scene, x, y, spriteName,);
			this.castTime = scene.time.now;
			this.explodeOnDestruction = !!projectileData?.explodeOnDestruction;
			this.effectScale = projectileData?.effectScale || 1;
		}

		destroy() {
			this.destroyed = true;
			super.destroy();
		}

		// tslint:disable-next-line: no-empty
		static onCast() {}
	}