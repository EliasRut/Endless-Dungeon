import { facingToSpriteNameMap, KNOCKBACK_TIME } from '../../helpers/constants';
import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';
import { updateStatus } from '../../worldstate/Character';
import { stun } from '../../helpers/AbilityHelper';

const BASE_ATTACK_DAMAGE = 10;
const REGULAR_ATTACK_RANGE = 75;
const REGULAR_MOVEMENT_SPEED = 80;
const MIN_MOVEMENT_SPEED = 25;
const BASE_HEALTH = 4;

const ITEM_DROP_CHANCE = 0.15;
const HEALTH_DROP_CHANCE = 0.06;

const CHARGE_TIME = 1500;
const ATTACK_DURATION = 3000;
const WALL_COLLISION_STUN = 2000;
const PLAYER_STUN = 500;
const COLLISION_STUN = 1000;
export default class VampireToken extends EnemyToken {
	attacking: boolean;
	chargeTime: number = CHARGE_TIME;
	startingHealth: number;
	launched: boolean = false;
	damaged: boolean = false;
	launchX: number;
	launchY: number;

	constructor(scene: MainScene, x: number, y: number, tokenName: string, level: number, id: string) {
		super(scene, x, y, tokenName, id);
		// cool effects!
		this.level = level - 1;
		this.attackRange = REGULAR_ATTACK_RANGE;
		this.stateObject.movementSpeed = REGULAR_MOVEMENT_SPEED;
		this.attacking = false;
		this.startingHealth = BASE_HEALTH * (1 + this.level * 0.5);
		this.stateObject.health = this.startingHealth;
		this.stateObject.damage = BASE_ATTACK_DAMAGE * (1 + this.level * 0.5);
		this.stateObject.attackTime = ATTACK_DURATION;
	}

	public update(time: number) {
		super.update(time);

		this.stateObject.movementSpeed = Math.max(MIN_MOVEMENT_SPEED,
			REGULAR_MOVEMENT_SPEED * this.stateObject.health / this.startingHealth);

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
			if (this.aggro) {
				if(this.attackRange < this.getDistance(tx, ty)){
				const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
				const xSpeed = (tx - this.x) / totalDistance * this.stateObject.movementSpeed;
				const ySpeed = (ty - this.y) / totalDistance * this.stateObject.movementSpeed;
				this.setVelocityX(xSpeed);
				this.setVelocityY(ySpeed);
				const newFacing = getFacing4Dir(xSpeed, ySpeed);
				const animation = updateMovingState(
					this.stateObject,
					true,
					newFacing);
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
					this.stateObject.currentFacing);
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
			const xSpeed = (tx - this.x);
			const ySpeed = (ty - this.y);
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `enemy-vampire-prepare-${facingToSpriteNameMap[newFacing]}`;
			// 9 frames, so 9 frame rate for 1s.
			//this.play({ key: attackAnimationName, frameRate: (9 / this.chargeTime * 1000)});
			const frame = Math.round((time - this.attackedAt) / this.chargeTime * 8);
			this.play({ key: attackAnimationName, frameRate: 10, startFrame: frame});

		} else if (this.attackedAt + this.chargeTime <= time && !this.launched) {
			this.launched = true;
			const tx = this.target.x;
			const ty = this.target.y;
			const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
			const xSpeed = (tx - this.x) / totalDistance * this.stateObject.movementSpeed;
			const ySpeed = (ty - this.y) / totalDistance * this.stateObject.movementSpeed;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `enemy-vampire-fly-${facingToSpriteNameMap[newFacing]}`;
			this.play({ key: attackAnimationName, repeat: -1 });

			this.launchX = (xSpeed * 3);
			this.launchY = (ySpeed * 3);
		}
	}

	onCollide(withEnemy: boolean) {
		if (this.launched) {
			let stunDuration = WALL_COLLISION_STUN;
			if (withEnemy) {
				stunDuration = COLLISION_STUN;
				if(!this.damaged) {
					globalState.playerCharacter.health -= this.stateObject.damage;
					stun(globalState.gameTime, PLAYER_STUN, globalState.playerCharacter);
					this.damaged = true;
				}
			}
			stun(globalState.gameTime, stunDuration, this.stateObject);
			const tx = this.target.x;
			const ty = this.target.y;
			const xSpeed = (tx - this.x);
			const ySpeed = (ty - this.y);
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `enemy-vampire-stun-${facingToSpriteNameMap[newFacing]}`;
			const attackAnimationRecover = `enemy-vampire-recover-${facingToSpriteNameMap[newFacing]}`;
			// 4 repeats per second, at currently 16 fps.
			this.play({ key: attackAnimationName, repeat: Math.floor(4 * (stunDuration - 500) / 1000)})
			.chain({ key: attackAnimationRecover, repeat: 3});
		}
	}
}