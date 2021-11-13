import {
	Facings,
	Faction,
	PossibleTargets,
	TARGETABLE_TILE_TINT,
	VISITED_TILE_TINT,
} from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import CharacterToken from '../tokens/CharacterToken';
import AbilityEffect from './AbilityEffect';

export default class TargetingEffect extends AbilityEffect {
	allowedTargets: PossibleTargets = PossibleTargets.NONE;
	seekingSpeed: number = 3000;
	seekingTimeOffset: number = 150;

	update(time: number) {
		if (time - this.castTime < this.seekingTimeOffset) {
			return;
		}
		let nearestEnemy: CharacterToken | undefined;
		if (this.allowedTargets === PossibleTargets.ENEMIES) {
			const potentialEnemies = Object.values((this.scene as MainScene).npcMap).filter(
				(npc) =>
					npc.faction === Faction.ENEMIES &&
					npc.tintBottomLeft >= VISITED_TILE_TINT &&
					npc.stateObject?.health > 0
			);
			let closestDistance = Infinity;
			nearestEnemy = potentialEnemies.reduce((nearest, token) => {
				if (Math.hypot(token.x - this.x, token.y - this.y) < closestDistance) {
					closestDistance = Math.hypot(token.x - this.x, token.y - this.y);
					return token;
				}
				return nearest;
			}, undefined as CharacterToken | undefined);
		} else if (this.allowedTargets === PossibleTargets.PLAYER) {
			nearestEnemy = (this.scene as MainScene).mainCharacter;
		}
		if (nearestEnemy) {
			this.setAcceleration(
				nearestEnemy.x > this.x ? this.seekingSpeed : -this.seekingSpeed,
				nearestEnemy.y > this.y ? this.seekingSpeed : -this.seekingSpeed
			);
		}
	}
}
