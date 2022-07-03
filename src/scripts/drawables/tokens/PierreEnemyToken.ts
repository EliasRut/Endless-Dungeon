import {
	facingToSpriteNameMap,
	KNOCKBACK_TIME,
	SCALE,
	NORMAL_ANIMATION_FRAME_RATE,
} from '../../helpers/constants';
import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';
import { updateStatus } from '../../worldstate/Character';
import { AbilityType } from '../../abilities/abilityData';
import Enemy from '../../worldstate/Enemy';

const BASE_ATTACK_DAMAGE = 10;
const REGULAR_ATTACK_RANGE = 75 * SCALE;
const REGULAR_MOVEMENT_SPEED = 80;
const MIN_MOVEMENT_SPEED = 25;
const BASE_HEALTH = 4;

const ITEM_DROP_CHANCE = 0.65;
const HEALTH_DROP_CHANCE = 0.06 * globalState.playerCharacter.luck;

const CHARGE_TIME = 1000;
const ATTACK_DURATION = 2000;
export default class PierreToken extends EnemyToken {
	attacking: boolean;
	chargeTime: number = CHARGE_TIME;
	startingHealth: number;
	firedShot: boolean = false;
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
		this.attackRange = REGULAR_ATTACK_RANGE;
		this.stateObject.movementSpeed = REGULAR_MOVEMENT_SPEED;
		this.attacking = false;
		this.startingHealth = BASE_HEALTH * (1 + this.level * 0.5);
		this.stateObject.health = this.startingHealth;
		this.stateObject.damage = BASE_ATTACK_DAMAGE * (1 + this.level * 0.5);
		this.stateObject.attackTime = ATTACK_DURATION;
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
			this.dead = true;
			this.die();
			return;
		} else if (this.dead) return;

		updateStatus(time, this.stateObject);
		if (this.stateObject.stunned) {
			this.setVelocityX(0);
			this.setVelocityY(0);
			return;
		}
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

		// follows you only if you're close enough, then runs straight at you,
		// stop when close enough (proximity)
		if (!this.attacking && this.targetStateObject) {
			const tx = this.target.x;
			const ty = this.target.y;
			const px = this.targetStateObject.x;
			const py = this.targetStateObject.y;
			if (this.aggro) {
				if (
					px !== tx ||
					py !== ty ||
					this.attackRange * SCALE < this.getDistanceToWorldStatePosition(tx, ty)
				) {
					const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
					const xSpeed =
						((tx * SCALE - this.x) / totalDistance) *
						this.stateObject.movementSpeed *
						SCALE *
						this.stateObject.slowFactor;
					const ySpeed =
						((ty * SCALE - this.y) / totalDistance) *
						this.stateObject.movementSpeed *
						SCALE *
						this.stateObject.slowFactor;
					this.setVelocityX(xSpeed);
					this.setVelocityY(ySpeed);
					const newFacing = getFacing4Dir(xSpeed, ySpeed);
					const animation = updateMovingState(this.stateObject, true, newFacing);
					if (animation) {
						this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE, repeat: -1 });
					}
				} else {
					this.attack(time);
				}
			} else {
				this.setVelocityX(0);
				this.setVelocityY(0);
				const animation = updateMovingState(
					this.stateObject,
					false,
					this.stateObject.currentFacing
				);
				if (animation) {
					this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				}
			}
		} else {
			if (this.attackedAt + this.stateObject.attackTime < time) {
				this.attacking = false;
				this.firedShot = false;
			} else this.attack(time);
		}
		this.stateObject.x = this.body.x / SCALE;
		this.stateObject.y = this.body.y / SCALE;
	}

	// FRAME RATE: 16
	attack(time: number) {
		console.log(`attacking ${this.target}`);
		if (!this.attacking) {
			this.stateObject.isWalking = false;
			const tx = this.target.x * SCALE;
			const ty = this.target.y * SCALE;
			const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
			const xFactor = (tx - this.x) / totalDistance;
			const yFactor = (ty - this.y) / totalDistance;
			(this.stateObject as Enemy).exactTargetXFactor = xFactor;
			(this.stateObject as Enemy).exactTargetYFactor = yFactor;
			this.attackedAt = time;
			this.attacking = true;
			this.setVelocityX(0);
			this.setVelocityY(0);
		}
		if (this.attackedAt + this.chargeTime > time) {
			const tx = this.target.x * SCALE;
			const ty = this.target.y * SCALE;
			const xSpeed = tx - this.x;
			const ySpeed = ty - this.y;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			// 9 frames, so 9 frame rate for 1s.
			if (this.attackedAt === time || this.stateObject.currentFacing !== newFacing) {
				const attackAnimationName = `pierre-throw-${facingToSpriteNameMap[newFacing]}`;
				this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				this.anims.setProgress((time - this.attackedAt) / this.chargeTime);
				this.stateObject.currentFacing = newFacing;
			}
		} else if (!this.firedShot) {
			this.firedShot = true;
			this.setVelocityX(0);
			this.setVelocityY(0);
			this.scene.abilityHelper.triggerAbility(
				this.stateObject,
				this.stateObject,
				AbilityType.BAT,
				this.level,
				time
			);
		}
	}
}
