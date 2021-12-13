import { facingToSpriteNameMap, KNOCKBACK_TIME } from '../../helpers/constants';
import { getFacing4Dir, updateMovingState, getXYfromTotalSpeed } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';
import { updateStatus } from '../../worldstate/Character';

const BASE_ATTACK_DAMAGE = 10;
const REGULAR_ATTACK_RANGE = 75;
const REGULAR_MOVEMENT_SPEED = 80;
const MIN_MOVEMENT_SPEED = 25;
const BASE_HEALTH = 4;

const ITEM_DROP_CHANCE = 0.65;
const HEALTH_DROP_CHANCE = 0.06;

const CHARGE_TIME = 1500;
const ATTACK_DURATION = 3000;
const WALL_COLLISION_STUN = 2000;
const PLAYER_STUN = 800;
const COLLISION_STUN = 1000;
const LAUNCH_SPEED = 100;
export default class VampireToken extends EnemyToken {
	attacking: boolean;
	chargeTime: number = CHARGE_TIME;
	startingHealth: number;
	launched: boolean = false;
	damaged: boolean = false;
	launchX: number;
	launchY: number;

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
		if (this.stateObject.health <= 0) {
			if (Math.random() < ITEM_DROP_CHANCE) {
				this.dropRandomItem(this.level);
			} else if (Math.random() < HEALTH_DROP_CHANCE) this.dropFixedItem('health');
			this.destroy();
			return;
		}
		updateStatus(time, this.stateObject);
		if (this.stateObject.stunned) {
			this.setVelocityX(0);
			this.setVelocityY(0);
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
		if (!this.attacking) {
			const tx = this.target.x;
			const ty = this.target.y;
			const px = globalState.playerCharacter.x;
			const py = globalState.playerCharacter.y;
			if (this.aggro) {
				if (px !== tx || py !== ty || this.attackRange < this.getDistance(tx, ty)) {
					const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
					const xSpeed =
						((tx - this.x) / totalDistance) *
						this.stateObject.movementSpeed *
						this.stateObject.slowFactor;
					const ySpeed =
						((ty - this.y) / totalDistance) *
						this.stateObject.movementSpeed *
						this.stateObject.slowFactor;
					this.setVelocityX(xSpeed);
					this.setVelocityY(ySpeed);
					const newFacing = getFacing4Dir(xSpeed, ySpeed);
					const animation = updateMovingState(this.stateObject, true, newFacing);
					if (animation) {
						this.play(animation);
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
					this.play(animation);
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

	destroy() {
		super.destroy();
	}

	receiveHit(damage: number) {
		super.receiveHit(damage);
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
			const tx = this.target.x;
			const ty = this.target.y;
			const xSpeed = tx - this.x;
			const ySpeed = ty - this.y;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `enemy-vampire-prepare-${facingToSpriteNameMap[newFacing]}`;
			// 9 frames, so 9 frame rate for 1s.
			const frame = Math.round(((time - this.attackedAt) / this.chargeTime) * 8);
			this.play({ key: attackAnimationName, frameRate: 10, startFrame: frame });
		} else if (this.attackedAt + this.chargeTime <= time && !this.launched) {
			this.launched = true;
			const tx = this.target.x;
			const ty = this.target.y;
			const speeds = getXYfromTotalSpeed(this.y - ty, this.x - tx);
			const xSpeed = speeds[0] * LAUNCH_SPEED * this.stateObject.slowFactor;
			const ySpeed = speeds[1] * LAUNCH_SPEED * this.stateObject.slowFactor;

			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `enemy-vampire-fly-${facingToSpriteNameMap[newFacing]}`;
			this.play({ key: attackAnimationName, repeat: -1 });
			this.launchX = xSpeed;
			this.launchY = ySpeed;
		}
	}

	onCollide(withEnemy: boolean) {
		if (this.launched) {
			let stunDuration = WALL_COLLISION_STUN;
			if (withEnemy) {
				stunDuration = COLLISION_STUN;
				if (!this.damaged) {
					this.scene.mainCharacter.receiveStun(stunDuration);
					this.scene.mainCharacter.receiveHit(this.stateObject.damage)
					this.damaged = true;
				}
			}
			this.receiveStun(stunDuration);
			const tx = this.target.x;
			const ty = this.target.y;
			const xSpeed = tx - this.x;
			const ySpeed = ty - this.y;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `enemy-vampire-stun-${facingToSpriteNameMap[newFacing]}`;
			const attackAnimationRecover = `enemy-vampire-recover-${facingToSpriteNameMap[newFacing]}`;
			// 4 repeats per second, at currently 16 fps.
			this.play({
				key: attackAnimationName,
				repeat: Math.floor((4 * (stunDuration - 500)) / 1000),
			}).chain({ key: attackAnimationRecover, repeat: 3 });
		}
	}
}
