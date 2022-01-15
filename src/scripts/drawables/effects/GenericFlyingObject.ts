import { Facings, facingToSpriteNameMap, UiDepths } from '../../helpers/constants';
import TargetingEffect from './TargetingEffect';
import { ProjectileData } from '../../abilities/abilityData';
import { getRotationInRadiansForFacing, isCollidingTile } from '../../helpers/movement';

const BODY_RADIUS = 6;
const VISIBILITY_DELAY = 50;


export default class GenericFlyingObject extends TargetingEffect {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        spriteName: string,
        facing: Facings,
        projectileData: ProjectileData
    ) {
        super(scene, x, y, spriteName, facing, projectileData);
        scene.add.existing(this);
        this.setRotation(getRotationInRadiansForFacing(facing));
        this.setDepth(1);
        scene.physics.add.existing(this);
        this.body.setCircle(BODY_RADIUS, 0, 0);
        this.body.setMass(1);
        if (projectileData.targeting && spriteName !== '') {
            this.animations = true;
			const animation = `${spriteName}-${facingToSpriteNameMap[facing]}`;
			this.play({ key: animation, repeat: -1 });
        }        

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
