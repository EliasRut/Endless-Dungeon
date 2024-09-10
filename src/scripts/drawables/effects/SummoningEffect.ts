import { AbilityType, ProjectileData } from '../../abilities/abilityData';
import {
	AbilityKey,
	Facings,
	PossibleTargets,
	SCALE,
	SUMMONING_TYPE,
} from '../../helpers/constants';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import { getOneLetterFacingName, isCollidingTile } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import { updateAbility } from '../../worldstate/PlayerCharacter';
import AbilityEffect from './AbilityEffect';
import { NORMAL_ANIMATION_FRAME_RATE } from '../../helpers/constants';

export default class SummoningEffect extends AbilityEffect {
	allowedTargets: PossibleTargets = PossibleTargets.NONE;
	summoningType: SUMMONING_TYPE;
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData,
		summoningType: SUMMONING_TYPE,
		circlingAbility: AbilityType
	) {
		super(scene, x, y, 'empty-tile', facing, projectileData);
		this.summoningType = summoningType;
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);

		const playerCharacter = globalState.playerCharacter;
		const summon = playerCharacter.activeSummons.find(
			(activeSummon) => activeSummon.summoningType === summoningType
		);
		if (summon) {
			const effect = (this.scene as MainScene).abilityHelper!.abilityEffects.find(
				(ability) => (ability as any).id === summon.id
			);
			if (effect) {
				this.x = effect.x;
				this.y = effect.y;
				const targetX = effect.x;
				const targetY = effect.y;
				effect.destroy();

				updateAbility(scene as MainScene, playerCharacter, AbilityKey.TWO, circlingAbility);

				const unscaledX = targetX / SCALE;
				const unscaledY = targetY / SCALE;

				const tileX = Math.round(targetX / TILE_WIDTH / SCALE);
				const tileY = Math.round(targetY / TILE_HEIGHT / SCALE);
				const tile = (this.scene as MainScene).tileLayer!.getTileAt(tileX, tileY);
				if (tile && !isCollidingTile(tile.index)) {
					const npc = (this.scene as MainScene).addNpc(
						summon.id,
						summoningType,
						unscaledX,
						unscaledY,
						1,
						1,
						0
					);

					if (this.summoningType === SUMMONING_TYPE.FIRE_ELEMENTAL) {
						npc.play({
							key: `firesprite-walk-${getOneLetterFacingName(effect.facing)}`,
							frameRate: NORMAL_ANIMATION_FRAME_RATE,
							repeat: -1,
						});
					}
				}
				this.drawSummoningAnimation(targetX, targetY);
			}
		}
		setTimeout(() => {
			this.destroy();
		}, 1000);
	}

	drawSummoningAnimation(targetX: number, targetY: number) {}
}
