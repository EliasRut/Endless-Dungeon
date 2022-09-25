import {
	ColorsOfMagic,
	DEBUG_PATHFINDING,
	facingToSpriteNameMap,
	KNOCKBACK_TIME,
	NORMAL_ANIMATION_FRAME_RATE,
	SCALE,
} from '../../helpers/constants';
import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';
import { updateStatus } from '../../worldstate/Character';
import { TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import { EnemyCategory, EnemyData } from '../../enemies/enemyData';
import { UneqippableItem } from '../../../items/itemData';

const BASE_ATTACK_DAMAGE = 3;
const REGULAR_ATTACK_RANGE = 25;
const REGULAR_MOVEMENT_SPEED = 80;
const MIN_MOVEMENT_SPEED = 25;
const BASE_HEALTH = 4;

const ATTACK_DAMAGE_DELAY = 250;

const ITEM_DROP_CHANCE = 0;
const HEALTH_DROP_CHANCE = 0 * globalState.playerCharacter.luck;

export default class ZombieToken extends EnemyToken {
	attackExecuted: boolean;
	startingHealth: number;
	dead: boolean = false;

	constructor(
		scene: MainScene,
		x: number,
		y: number,
		tokenName: string,
		level: number,
		id: string,
		enemyData: EnemyData
	) {
		super(scene, x, y, tokenName, id, enemyData);
		// cool effects!
		this.level = level;
		this.attackRange = REGULAR_ATTACK_RANGE * SCALE;
		this.stateObject.movementSpeed = REGULAR_MOVEMENT_SPEED;
		this.attackExecuted = false;
		this.startingHealth = BASE_HEALTH * (1 + this.level * 0.5);
		this.stateObject.health = this.startingHealth;
		this.stateObject.damage = BASE_ATTACK_DAMAGE * (1 + this.level * 0.5);
		this.color = ColorsOfMagic.FLUX;
	}

	public update(time: number, delta: number) {
		super.update(time, delta);

		this.stateObject.movementSpeed = Math.max(
			MIN_MOVEMENT_SPEED,
			(REGULAR_MOVEMENT_SPEED * this.stateObject.health) / this.startingHealth
		);

		// check death
		if (this.stateObject.health <= 0 && !this.dead) {
			if (Math.random() < ITEM_DROP_CHANCE) {
				this.maybeDropEquippableItem();
			} else if (Math.random() < HEALTH_DROP_CHANCE) {
				this.dropNonEquippableItem(UneqippableItem.HEALTH_POTION);
			}
			this.dropNonEquippableItem(UneqippableItem.ESSENCE);
			this.dead = true;
			this.die();
			return;
		} else if (this.dead) return;

		updateStatus(time, this.stateObject);
		if (this.stateObject.stunned) return;
		if (this.scene.isPaused) {
			const animation = updateMovingState(this.stateObject, false, this.stateObject.currentFacing);
			if (animation) {
				if (this.scene.game.anims.exists(animation)) {
					this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				}
			}
			return;
		}

		if (this.lastMovedTimestamp + KNOCKBACK_TIME > time) {
			return;
		}

		// Attack, if a target exists and is alive
		let tx = this.target.x;
		let ty = this.target.y;
		const distance = this.getDistanceToWorldStatePosition(tx, ty);

		if (
			this.attackedAt > 0 &&
			!this.attackExecuted &&
			this.attackedAt + ATTACK_DAMAGE_DELAY < time
		) {
			this.attackExecuted = true;
			this.maybeDealDamage();
			return;
		} else if (this.attackedAt + this.stateObject.attackTime >= time) {
			return;
		}

		// follows you only if you're close enough, then runs straight at you,
		// stop when close enough (proximity)
		if (
			this.targetStateObject &&
			this.targetStateObject.health > 0 &&
			this.aggro &&
			this.attackedAt + this.stateObject.attackTime < time &&
			this.attackRange < distance
		) {
			super.walkToWaypoint();
			// Just stand around and do nothing, otherwise
		} else {
			this.setVelocityX(0);
			this.setVelocityY(0);
			const animation = updateMovingState(this.stateObject, false, this.stateObject.currentFacing);
			if (animation) {
				if (this.scene.game.anims.exists(animation)) {
					this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				}
			}
		}
		if (
			distance <= this.attackRange &&
			this.targetStateObject &&
			this.targetStateObject.health > 0
		) {
			this.attack(time);
		}

		this.stateObject.x = this.body.x / SCALE;
		this.stateObject.y = this.body.y / SCALE;
	}

	attack(time: number) {
		if (this.attackedAt + this.stateObject.attackTime < time) {
			const tx = this.target.x * SCALE;
			const ty = this.target.y * SCALE;
			const xSpeed = tx - this.x;
			const ySpeed = ty - this.y;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);

			const attackAnimationName = `${this.tokenName}-${
				this.enemyData.meleeAttackData!.animationName
			}-${facingToSpriteNameMap[newFacing]}`;
			this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });

			this.setVelocityX(0);
			this.setVelocityY(0);
			this.stateObject.isWalking = false;
			this.attackedAt = time;
			this.attackExecuted = false;
		}
	}

	maybeDealDamage() {
		const target = this.targetStateObject;
		if (!target) {
			return;
		}
		const tx = target.x;
		const ty = target.y;
		const distance = this.getDistanceToWorldStatePosition(tx, ty);

		if (distance < this.attackRange) {
			const targetToken = this.scene.getTokenForStateObject(target);
			targetToken?.takeDamage(this.stateObject.damage);
			targetToken?.receiveHit();
		}
	}
}
