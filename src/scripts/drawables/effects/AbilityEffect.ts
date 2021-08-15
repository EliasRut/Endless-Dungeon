import { Facings, PossibleTargets } from '../../helpers/constants';

export default class AbilityEffect extends Phaser.Physics.Arcade.Sprite {
		destroyed = false;
		castTime: number;
		isStarted: boolean = false;
		constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings) {
			super(scene, x, y, spriteName);
			this.castTime = scene.time.now;
		}

		destroy() {
			this.destroyed = true;
			super.destroy();
		}

		// tslint:disable-next-line: no-empty
		static onCast() {}
	}