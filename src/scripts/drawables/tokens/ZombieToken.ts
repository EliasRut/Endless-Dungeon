import { facingToSpriteNameMap, KNOCKBACK_TIME, SCALE } from '../../helpers/constants';
import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';
import { updateStatus } from '../../worldstate/Character';

const BASE_ATTACK_DAMAGE = 3;
const REGULAR_ATTACK_RANGE = 25;
const REGULAR_MOVEMENT_SPEED = 80;
const MIN_MOVEMENT_SPEED = 25;
const BASE_HEALTH = 4;

const ATTACK_DAMAGE_DELAY = 250;

const ITEM_DROP_CHANCE = 0.65;
const HEALTH_DROP_CHANCE = 0.06;

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
		id: string
	) {
		super(scene, x, y, tokenName, id);
		// cool effects!
		this.level = level;
		this.attackRange = REGULAR_ATTACK_RANGE * SCALE;
		this.stateObject.movementSpeed = REGULAR_MOVEMENT_SPEED;
		this.attackExecuted = false;
		this.startingHealth = BASE_HEALTH * (1 + this.level * 0.5);
		this.stateObject.health = this.startingHealth;
		this.stateObject.damage = BASE_ATTACK_DAMAGE * (1 + this.level * 0.5);
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
				this.dropRandomItem(this.level);
			} else if (Math.random() < HEALTH_DROP_CHANCE) {
				this.dropFixedItem('health');
			}
			//this.dropFixedItem('source-fire');
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
					this.play(animation);
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play(animation);
				}
			}
			return;
		}

		if (this.lastMovedTimestamp + KNOCKBACK_TIME > time) {
			return;
		}

		const tx = this.target.x;
		const ty = this.target.y;
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
			this.aggro &&
			this.attackedAt + this.stateObject.attackTime < time &&
			this.attackRange < distance
		) {
			const totalDistance = Math.abs(tx * SCALE - this.x) + Math.abs(ty * SCALE - this.y);
			const xSpeed =
				((tx * SCALE - this.x) / totalDistance) *
				this.stateObject.movementSpeed *
				this.stateObject.slowFactor;
			const ySpeed =
				((ty * SCALE - this.y) / totalDistance) *
				this.stateObject.movementSpeed *
				this.stateObject.slowFactor;
			this.setVelocityX(xSpeed);
			this.setVelocityY(ySpeed);
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const animation = updateMovingState(this.stateObject, true, newFacing);
			if (animation) {
				if (this.scene.game.anims.exists(animation)) {
					this.play({ key: animation, repeat: -1 });
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play({ key: animation, repeat: -1 });
				}
			}
		} else {
			this.setVelocityX(0);
			this.setVelocityY(0);
			const animation = updateMovingState(this.stateObject, false, this.stateObject.currentFacing);
			if (animation) {
				if (this.scene.game.anims.exists(animation)) {
					this.play(animation);
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play(animation);
				}
			}
		}
		if (distance <= this.attackRange) {
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

			const attackAnimationName = `${this.tokenName}-attack-${facingToSpriteNameMap[newFacing]}`;
			this.play(attackAnimationName);

			this.setVelocityX(0);
			this.setVelocityY(0);
			this.stateObject.isWalking = false;
			this.attackedAt = time;
			this.attackExecuted = false;
		}
	}

	maybeDealDamage() {
		const player = globalState.playerCharacter;
		const tx = player.x;
		const ty = player.y;
		const distance = this.getDistanceToWorldStatePosition(tx, ty);

		if (distance < this.attackRange) {
			this.scene.mainCharacter.receiveHit(this.stateObject.damage);
		}
	}
}
