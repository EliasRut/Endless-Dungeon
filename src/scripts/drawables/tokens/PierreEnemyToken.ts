import { facingToSpriteNameMap, KNOCKBACK_TIME } from '../../helpers/constants';
import { getFacing4Dir, updateMovingState, getXYfromTotalSpeed } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';
import { updateStatus } from '../../worldstate/Character';
import { AbilityType } from '../../abilities/abilityData';

const BASE_ATTACK_DAMAGE = 10;
const REGULAR_ATTACK_RANGE = 75;
const REGULAR_MOVEMENT_SPEED = 80;
const MIN_MOVEMENT_SPEED = 25;
const BASE_HEALTH = 4;

const ITEM_DROP_CHANCE = 0.65;
const HEALTH_DROP_CHANCE = 0.06;

const CHARGE_TIME = 1500;
const ATTACK_DURATION = 3000;
export default class PierreToken extends EnemyToken {
	attacking: boolean;
	chargeTime: number = CHARGE_TIME;
	startingHealth: number;

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
		}

		// follows you only if you're close enough, then runs straight at you,
		// stop when close enough (proximity)
		if (!this.attacking) {
			const tx = this.target.x;
			const ty = this.target.y;
			const px = globalState.playerCharacter.x;
			const py = globalState.playerCharacter.y;
			if (this.aggro) {
				if (
					px !== tx ||
					py !== ty ||
					this.attackRange < this.getDistanceToWorldStatePosition(tx, ty)
				) {
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
			this.play({ key: attackAnimationName, startFrame: frame });
		} else {
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
