import {
	Facings,
	facingToSpriteNameMap,
	Faction,
	PossibleTargets,
	VISITED_TILE_TINT,
} from '../../helpers/constants';
import { getFacing4Dir } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import CharacterToken from '../tokens/CharacterToken';
import AbilityEffect from './AbilityEffect';
import { SCALE, NORMAL_ANIMATION_FRAME_RATE } from '../../helpers/constants';
import { ProjectileData } from '../../abilities/abilityData';

export default class TargetingEffect extends AbilityEffect {
	allowedTargets: PossibleTargets = PossibleTargets.NONE;
	acquisitionSpeed: number;
	acquisitionDistance: number;
	seekingSpeed: number;
	seekingTimeOffset: number;
	animationName: string = '';

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData
	) {
		super(scene, x, y, spriteName, facing);
		this.acquisitionSpeed = (projectileData.acquisitionSpeed ?? 100) * SCALE;
		this.acquisitionDistance = (projectileData.acquisitionDistance ?? 30) * SCALE;
		this.seekingSpeed = (projectileData.seekingSpeed ?? 500) * SCALE;
		this.seekingTimeOffset = projectileData.seekingTimeOffset ?? 50;
	}

	update(time: number) {
		if (time - this.castTime < this.seekingTimeOffset) {
			return;
		}
		let nearestEnemy: CharacterToken | undefined;
		let closestDistance = Infinity;
		if (this.allowedTargets === PossibleTargets.ENEMIES) {
			const potentialEnemies = Object.values((this.scene as MainScene).npcMap).filter(
				(npc) =>
					npc.faction === Faction.ENEMIES &&
					npc.tintBottomLeft >= VISITED_TILE_TINT &&
					npc.stateObject?.health > 0
			);
			closestDistance = Infinity;
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
			const xDiff = nearestEnemy.x - this.x;
			const yDiff = nearestEnemy.y - this.y;
			let xAccel: number;
			if (nearestEnemy.x > this.x) {
				if (xDiff < this.acquisitionDistance) {
					xAccel = this.acquisitionSpeed;
				} else {
					xAccel = this.seekingSpeed;
				}
			} else {
				if (xDiff > -this.acquisitionDistance) {
					xAccel = -this.acquisitionSpeed;
				} else {
					xAccel = -this.seekingSpeed;
				}
			}
			let yAccel: number;
			if (nearestEnemy.y > this.y) {
				if (yDiff < this.acquisitionDistance) {
					yAccel = this.acquisitionSpeed;
				} else {
					yAccel = this.seekingSpeed;
				}
			} else {
				if (yDiff > -this.acquisitionDistance) {
					yAccel = -this.acquisitionSpeed;
				} else {
					yAccel = -this.seekingSpeed;
				}
			}

			this.setAcceleration(xAccel, yAccel);
		}
		if (this.animationName !== '') {
			const xSpeed = this.body.velocity.x;
			const ySpeed = this.body.velocity.y;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			if (this.facing !== newFacing) {
				this.facing = newFacing;
				const animation = `${this.animationName}-${facingToSpriteNameMap[newFacing]}`;
				this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE, repeat: -1 });
			}
		}
	}
}
