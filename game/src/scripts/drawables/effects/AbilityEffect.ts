import { ProjectileData } from '../../abilities/abilityData';
import { Facings, PossibleTargets, SCALE } from '../../helpers/constants';
import { isCollidingTile } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import CharacterToken from '../tokens/CharacterToken';
import globalState from '../../worldstate/index';

export default class AbilityEffect extends Phaser.Physics.Arcade.Sprite {
	facing: Facings;
	spriteName: string;
	effectScale: number;
	destroyed = false;
	castTime: number;
	isStarted: boolean = false;
	explodeOnDestruction: boolean;
	hitEnemyTokens: CharacterToken[] = [];
	particleDeathZone: { contains: (x: number, y: number) => boolean };

	lightingRadius: number | undefined = 2;
	lightingStrength: number | undefined = 2;
	lightingMinStrength: number | undefined = undefined;
	lightingMaxStrength: number | undefined = undefined;
	lightingFrequency: number | undefined = undefined;
	lightingSeed: number | undefined = undefined;
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData?: ProjectileData,
		effectData?: any
	) {
		super(scene, x * SCALE, y * SCALE, spriteName);
		this.castTime = globalState.gameTime;
		this.facing = facing;
		this.spriteName = spriteName;

		this.explodeOnDestruction = !!projectileData?.explodeOnDestruction;
		this.effectScale = projectileData?.effectScale || 1;
		// this.lightingStrength = projectileData?.lightingStrength || undefined;
		// this.lightingRadius = projectileData?.lightingRadius || undefined;

		const mainScene = scene as MainScene;

		this.particleDeathZone = {
			contains: (particleX, particleY) => {
				const tileLayerTile = mainScene.tileLayer.getTileAtWorldXY(particleX, particleY);
				return !tileLayerTile || isCollidingTile(tileLayerTile.index);
			},
		};
	}

	onCollisionWithEnemy(enemy: Phaser.GameObjects.GameObject) {}

	destroy() {
		this.destroyed = true;
		super.destroy();
	}

	// tslint:disable-next-line: no-empty
	static onCast() {}
}
