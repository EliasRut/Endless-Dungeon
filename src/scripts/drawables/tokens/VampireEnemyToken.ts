import {
	facingToSpriteNameMap,
	KNOCKBACK_TIME,
	SCALE,
	NORMAL_ANIMATION_FRAME_RATE,
} from '../../helpers/constants';
import { getFacing4Dir, updateMovingState, getXYfromTotalSpeed } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';
import { updateStatus } from '../../worldstate/Character';

const BASE_ATTACK_DAMAGE = 10;
const REGULAR_ATTACK_RANGE = 75 * SCALE;
const REGULAR_MOVEMENT_SPEED = 80;
const MIN_MOVEMENT_SPEED = 25;
const BASE_HEALTH = 4;

const ITEM_DROP_CHANCE = 0.65;
const HEALTH_DROP_CHANCE = 0.06 * globalState.playerCharacter.luck;

const CHARGE_TIME = 650;
const ATTACK_DURATION = 2500;
const WALL_COLLISION_STUN = 2000;
const COLLISION_STUN = 1000;
const LAUNCH_SPEED = 150;
export default class VampireToken extends EnemyToken {
	attacking: boolean;
	chargeTime: number = CHARGE_TIME;
	startingHealth: number;
	launched: boolean = false;
	damaged: boolean = false;
	launchX: number;
	launchY: number;
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
			if (animation && !this.launched) {
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
		} else if (this.launched) {
			this.setVelocityX(this.launchX);
			this.setVelocityY(this.launchY);
		}

		// follows you only if you're close enough, then runs straight at you,
		// stop when close enough (proximity)
		if (!this.attacking && this.targetStateObject) {
			const tx = this.target.x;
			const ty = this.target.y;
			const px = this.targetStateObject.x * SCALE;
			const py = this.targetStateObject.y * SCALE;
			if (this.aggro) {
				if (
					px !== tx * SCALE ||
					py !== ty * SCALE ||
					this.attackRange < this.getDistanceToWorldStatePosition(tx, ty)
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
					this.setVelocityX(xSpeed * SCALE);
					this.setVelocityY(ySpeed * SCALE);
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
				this.launched = false;
			} else this.attack(time);
		}

		this.stateObject.x = this.body.x;
		this.stateObject.y = this.body.y;
	}

	// FRAME RATE: 16
	attack(time: number) {
		if (!this.attacking) {
			this.attackedAt = time;
			this.attacking = true;
			this.damaged = false;
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
				const attackAnimationName = `jacques-attack-${facingToSpriteNameMap[newFacing]}`;
				this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				this.anims.setProgress((time - this.attackedAt) / this.chargeTime);
				this.stateObject.currentFacing = newFacing;
			}
		} else if (this.attackedAt + this.chargeTime <= time && !this.launched) {
			this.launched = true;
			const tx = this.target.x * SCALE;
			const ty = this.target.y * SCALE;
			const speeds = getXYfromTotalSpeed(this.y - ty, this.x - tx);
			const xSpeed = speeds[0] * LAUNCH_SPEED * this.stateObject.slowFactor * SCALE;
			const ySpeed = speeds[1] * LAUNCH_SPEED * this.stateObject.slowFactor * SCALE;

			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `jacques-attack-${facingToSpriteNameMap[newFacing]}`;
			this.play({
				key: attackAnimationName,
				frameRate: NORMAL_ANIMATION_FRAME_RATE,
				startFrame: 8,
			});
			this.launchX = xSpeed;
			this.launchY = ySpeed;
		}
	}

	onCollide(withEnemy: boolean) {
		if (this.launched) {
			let stunDuration = WALL_COLLISION_STUN;
			if (withEnemy) {
				stunDuration = COLLISION_STUN;
				if (!this.damaged && this.targetStateObject) {
					const targetToken = this.scene.getTokenForStateObject(this.targetStateObject);
					targetToken?.receiveStun(stunDuration);
					targetToken?.takeDamage(this.stateObject.damage);
					targetToken?.receiveHit();
					this.damaged = true;
				}
			}
			this.receiveStun(stunDuration);
			const tx = this.target.x;
			const ty = this.target.y;
			const xSpeed = tx - this.x;
			const ySpeed = ty - this.y;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const stunAnimation = `jacques-stun-${facingToSpriteNameMap[newFacing]}`;
			const recoverAnimation = `jacques-shake-${facingToSpriteNameMap[newFacing]}`;
			// 4 repeats per second, at currently 16 fps.
			this.play({
				key: stunAnimation,
				frameRate: NORMAL_ANIMATION_FRAME_RATE,
				repeat: Math.floor((4 * (stunDuration - 500)) / 1000),
			}).chain({ key: recoverAnimation, repeat: 3 });
		}
	}
}
