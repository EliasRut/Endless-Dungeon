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

export default class VampireToken extends EnemyToken {
	attacking: boolean;
	preAttackTime: number = 1000;
	startingHealth: number;
	launched: boolean = false;

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
		this.stateObject.attackTime = 1500;	
		this.scene.anims.create({
			key: 'fly',
			frames: this.anims.generateFrameNumbers('enemy-vampire-charge', { start: 9, end: 9 }),
			frameRate: 16,
			repeat: -1
	});	
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
		}

		// follows you only if you're close enough, then runs straight at you,
		// stop when close enough (proximity)
		if (!this.attacking) {
			const tx = this.target.x;
			const ty = this.target.y;
			const distance = this.getDistance(tx, ty);
			if (this.aggro && this.attackRange < distance) {
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
			if (distance <= this.attackRange) {
				this.attack(time);
			}
		} else {
			if (this.attackedAt + this.stateObject.attackTime < time) {
				this.attacking = false;
				this.launched = false;
			}
			this.attack(time);
		}

		this.stateObject.x = this.body.x;
		this.stateObject.y = this.body.y;
	}

	destroy() {
		super.destroy();
	}

	attack(time: number) {
		if (this.attackedAt + this.stateObject.attackTime < time) {			
			this.attackedAt = time;
			this.attacking = true;
			const tx = this.target.x;
			const ty = this.target.y;
			const xSpeed = (tx - this.x);
			const ySpeed = (ty - this.y);
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `enemy-vampire-charge-${facingToSpriteNameMap[newFacing]}`;
			this.play(attackAnimationName);

			this.setVelocityX(0);
			this.setVelocityY(0);

		} else if (this.attackedAt + this.preAttackTime < time && !this.launched) {			
			this.launched = true;
			const tx = this.target.x;
			const ty = this.target.y;
			const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
			const xSpeed = (tx - this.x) / totalDistance * this.stateObject.movementSpeed;
			const ySpeed = (ty - this.y) / totalDistance * this.stateObject.movementSpeed;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const attackAnimationName = `enemy-vampire-charge-${facingToSpriteNameMap[newFacing]}`;
			//this.play(attackAnimationName);
		this.play('fly');
			

			this.setVelocityX(xSpeed * 3);
			this.setVelocityY(ySpeed * 3);
		}
	}

	onCollide(withEnemy: boolean) {
		if(this.launched && withEnemy) {
			globalState.playerCharacter.health -= this.stateObject.damage;
			stun(globalState.gameTime, 1000, globalState.playerCharacter);
			stun(globalState.gameTime, 1000, this.stateObject);			
		} else if(this.launched) {
			stun(globalState.gameTime, 1000, this.stateObject);
		}
	}
}