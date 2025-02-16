import { ProjectileData } from '../../../../types/ProjectileData';
import { Facings, Faction, PossibleTargets, VISITED_TILE_TINT } from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import CharacterToken from '../tokens/CharacterToken';
import AbilityEffect from './AbilityEffect';

export const enum InstantEffectShape {
	LINE = 'LINE',
	CIRCLE = 'CIRCLE',
	CONE = 'CONE',
}

export default class InstantEffect extends AbilityEffect {
	targets: CharacterToken[] = [];
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData,
		allowedTargets: PossibleTargets = PossibleTargets.NONE,
		range: number = 0,
		shape: InstantEffectShape = InstantEffectShape.LINE,
		maxTargets: number = 0,
		ignoreWalls: boolean = false
	) {
		super(scene, x, y, 'empty-tile', facing, projectileData);
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);

		setTimeout(() => {
			this.selectTargets(allowedTargets, range, shape, maxTargets);
			this.targets.forEach((target) => {
				this.drawEffect(target.x, target.y);
				this.applyEffect(target);
			});
		}, 1);

		setTimeout(() => {
			this.destroy();
		}, 1000);
	}

	selectTargets(
		allowedTargets: PossibleTargets,
		range: number,
		shape: InstantEffectShape,
		maxTargets: number
	) {
		let targets = [];
		let potentialTargets: CharacterToken[] = [];
		if (allowedTargets === PossibleTargets.ENEMIES) {
			const potentialEnemies = Object.values((this.scene as MainScene).npcMap).filter(
				(npc) =>
					npc.faction === Faction.ENEMIES &&
					npc.tintBottomLeft >= VISITED_TILE_TINT &&
					npc.stateObject?.health > 0
			);

			potentialTargets = potentialEnemies.filter((token) => {
				if (Math.hypot(token.x - this.x, token.y - this.y) < range) {
					return true;
				}
				return false;
			});
		} else if (allowedTargets === PossibleTargets.PLAYER) {
			const token = (this.scene as MainScene).mainCharacter!;
			if (Math.hypot(token.x - this.x, token.y - this.y) < range) {
				potentialTargets = [token];
			}
		}

		if (maxTargets === 0) {
			targets = potentialTargets;
		} else {
			// Order targwets by distance
			const orderedTargets = potentialTargets.sort(
				(a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y)
			);
			targets = orderedTargets.slice(0, maxTargets);
		}
		this.targets = targets;
	}

	drawEffect(targetX: number, targetY: number) {}
	applyEffect(target: CharacterToken) {}
}
