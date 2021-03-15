import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';

const REGULAR_ATTACK_DAMAGE = 20;
const REGULAR_ATTACK_RANGE = 15;
const REGULAR_MOVEMENT_SPEED = 75;
const MIN_MOVEMENT_SPEED = 15;
const REGULAR_HEALTH = 10;

export default class ZombieToken extends EnemyToken {

	constructor(scene: MainScene, x: number, y: number, tokenName: string, id: string) {
		super(scene, x, y, tokenName, id);
		// cool effects!
		this.attackRange = REGULAR_ATTACK_RANGE;
		this.stateObject.movementSpeed = REGULAR_MOVEMENT_SPEED;
	}

	public update(time: number) {
				super.update(time);

				const player = globalState.playerCharacter;

				this.stateObject.movementSpeed = Math.max(MIN_MOVEMENT_SPEED,
				REGULAR_MOVEMENT_SPEED * this.stateObject.health / REGULAR_HEALTH);

				// check death
				if (this.stateObject.health <= 0){
						this.dropItem();
						this.destroy();
						return;
				}

				const tx = this.target.x;
				const ty = this.target.y;
				const distance = this.getDistance(tx, ty);

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
				}
				else {
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
				this.setVelocityX(0);
				this.setVelocityY(0);
				this.attackedAt = time;
				player.health -= REGULAR_ATTACK_DAMAGE;
				// tslint:disable-next-line: no-console
				console.log(`player health=${player.health}`);
		}
	}
}