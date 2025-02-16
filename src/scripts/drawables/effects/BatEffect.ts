import { ProjectileData } from '../../../types/ProjectileData';
import {
	Facings,
	facingToSpriteNameMap,
	SCALE,
	NORMAL_ANIMATION_FRAME_RATE,
} from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';

const BODY_RADIUS = 6;
const OFFSET = 14;
const VISIBILITY_DELAY = 0;

export default class BatEffect extends TargetingEffect {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData
	) {
		super(scene, x, y, 'empty-tile', facing, projectileData);
		scene.add.existing(this);
		this.setDepth(1);
		this.setScale(SCALE);
		this.setOrigin(0);
		scene.physics.add.existing(this);
		this.body!.setCircle(BODY_RADIUS, OFFSET, OFFSET);
		this.body!.setMass(1);
		if (projectileData.targeting) this.animationName = `${spriteName}-fly`;
		const spawnAnimation = `${spriteName}-spawn-${facingToSpriteNameMap[facing]}`;
		const animation = `${this.animationName}-${facingToSpriteNameMap[facing]}`;
		this.play({ key: spawnAnimation, frameRate: NORMAL_ANIMATION_FRAME_RATE }).chain({
			key: animation,
			repeat: -1,
		});

		if (projectileData?.timeToLive) {
			setTimeout(() => {
				this.destroy();
			}, projectileData?.timeToLive);
		}
	}

	destroy() {
		super.destroy();
	}

	update(time: number) {
		super.update(time);
		if (time - this.castTime > VISIBILITY_DELAY && !this.isStarted) {
			this.isStarted = true;
		}
	}
}
