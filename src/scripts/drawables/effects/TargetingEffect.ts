import {
	Facings,
	facingToSpriteNameMap,
	Faction,
	PossibleTargets,
	TARGETABLE_TILE_TINT,
	VISITED_TILE_TINT,
} from '../../helpers/constants';
import { getFacing8Dir } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import CharacterToken from '../tokens/CharacterToken';
import AbilityEffect from './AbilityEffect';

export default class TargetingEffect extends AbilityEffect {
	allowedTargets: PossibleTargets = PossibleTargets.NONE;
	seekingSpeed: number = 3000;
	seekingTimeOffset: number = 150;
	animations: boolean = false;	

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
		if(this.animations === true) {			
			const xSpeed = this.body.velocity.x;
			const ySpeed = this.body.velocity.y;
			const newFacing = getFacing8Dir(xSpeed, ySpeed);
			if(this.facing !== newFacing) {
				this.facing = newFacing;
				const animation = `${this.spriteName}-${facingToSpriteNameMap[newFacing]}`;
				this.play({ key: animation, repeat: -1 });
			}
		}		
	}
}
