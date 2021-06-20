import { facingToSpriteNameMap } from '../../helpers/constants';
import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';

const BASE_ATTACK_DAMAGE = 20;
const REGULAR_ATTACK_RANGE = 25;
const REGULAR_MOVEMENT_SPEED = 50;
const MIN_MOVEMENT_SPEED = 15;
const BASE_HEALTH = 10;

const ATTACK_DAMAGE_DELAY = 500;

export default class ZombieToken extends EnemyToken {
	attackExecuted: boolean;
	startingHealth: number;
	level: number;

	constructor(scene: MainScene, x: number, y: number, tokenName: string, level: number, id: string) {
		super(scene, x, y, tokenName, id);
		// cool effects!
		this.level = level;
		this.attackRange = REGULAR_ATTACK_RANGE;
		this.stateObject.movementSpeed = REGULAR_MOVEMENT_SPEED;
		this.attackExecuted = false;
		this.startingHealth = BASE_HEALTH * this.level;
		this.stateObject.health = this.startingHealth;
		this.stateObject.damage = BASE_ATTACK_DAMAGE * (1 + this.level * 0.5);
	}

	public update(time: number) {
		super.update(time);

		const player = globalState.playerCharacter;

		this.stateObject.movementSpeed = Math.max(MIN_MOVEMENT_SPEED,
		REGULAR_MOVEMENT_SPEED * this.stateObject.health / this.startingHealth);

		// check death
		if (this.stateObject.health <= 0){
				this.dropRandomItem(this.level);
				this.destroy();
				return;
		}

		const tx = this.target.x;
		const ty = this.target.y;
		const distance = this.getDistance(tx, ty);

		if (this.attackedAt > 0
				&& !this.attackExecuted
				&& (this.attackedAt + ATTACK_DAMAGE_DELAY) < time) {
			this.attackExecuted = true;
			this.maybeDealDamage();
			return;
		} else if (this.attackedAt + this.stateObject.attackTime >= time) {
			return;
		}

		// follows you only if you're close enough, then runs straight at you,
		// stop when close enough (proximity)

		if ( this.attackedAt + this.stateObject.attackTime < time
				&& this.attackRange < distance) {
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
		if(distance <= this.attackRange) {
			this.attack(time);
		}
		this.stateObject.x = this.body.x;
		this.stateObject.y = this.body.y;
	}

	destroy() {
		super.destroy();
	}

	attack(time: number) {
		const player = globalState.playerCharacter;

		if (this.attackedAt + this.stateObject.attackTime < time) {
			const tx = this.target.x;
			const ty = this.target.y;
			const xSpeed = (tx - this.x);
			const ySpeed = (ty - this.y);
			const newFacing = getFacing4Dir(xSpeed, ySpeed);

			const attackAnimationName = `enemy-zombie-slash-${facingToSpriteNameMap[newFacing]}`;
			this.play(attackAnimationName);

			this.setVelocityX(0);
			this.setVelocityY(0);
			this.attackedAt = time;
			this.attackExecuted = false;
		}
	}

	maybeDealDamage() {
		const player = globalState.playerCharacter;
		const tx = player.x;
		const ty = player.y;
		const distance = this.getDistance(tx, ty);

		if (distance < this.attackRange) {
			player.health -= this.stateObject.damage;
			console.log(`player health=${player.health}`);
		}
	}
}