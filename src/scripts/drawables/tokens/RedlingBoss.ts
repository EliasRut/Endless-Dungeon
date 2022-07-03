import { AbilityType } from '../../abilities/abilityData';
import { getFacing8Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import Enemy from '../../worldstate/Enemy';
import EnemyToken from './EnemyToken';
import { NORMAL_ANIMATION_FRAME_RATE } from '../../helpers/constants';

const ATTACK_RANGE = 80;

export default class RedlingBossToken extends EnemyToken {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	constructor(
		scene: MainScene,
		x: number,
		y: number,
		tokenName: string,
		level: number,
		id: string
	) {
		super(scene, x, y, tokenName, id);

		this.setScale(2);
		this.attackRange = ATTACK_RANGE; // how close the enemy comes.
		this.stateObject.health = 40 * level;
		this.stateObject.movementSpeed = 100 * (1 + level * 0.1);
		this.stateObject.damage = 5 * level;
		this.stateObject.attackTime = 4000;
		this.level = level;

		const particles = scene.add.particles('fire');
		particles.setDepth(1);
		this.emitter = particles.createEmitter({
			alpha: { start: 1, end: 0 },
			scale: { start: 0.3, end: 0.05 },
			speed: 200,
			rotate: { min: -180, max: 180 },
			angle: { min: -180, max: 180 },
			lifespan: { min: 100, max: 120 },
			blendMode: Phaser.BlendModes.ADD,
			frequency: 30,
			maxParticles: 200,
			follow: this,
		});
		this.emitter.startFollow(this.body.gameObject);
		this.emitter.start();
	}

	public update(time: number, delta: number) {
		super.update(time, delta);

		// check death
		if (this.stateObject.health <= 0) {
			this.dropFixedItem('book');
			this.dropRandomItem(this.level + 1);
			this.dropRandomItem(this.level + 1);
			this.dropRandomItem(this.level + 1);
			this.emitter.stop();
			this.destroy();
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

		const timeSinceAttack = Math.max(
			1,
			Math.min(this.stateObject.attackTime, time - this.attackedAt)
		);
		this.emitter.setFrequency(30 + this.stateObject.attackTime / timeSinceAttack);

		const tx = this.target.x;
		const ty = this.target.y;
		const distance = this.getDistanceToWorldStatePosition(tx, ty);

		const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
		const xFactor = (tx - this.x) / totalDistance;
		const yFactor = (ty - this.y) / totalDistance;
		(this.stateObject as Enemy).exactTargetXFactor = xFactor;
		(this.stateObject as Enemy).exactTargetYFactor = yFactor;
		const xSpeed = xFactor * this.stateObject.movementSpeed;
		const ySpeed = yFactor * this.stateObject.movementSpeed;
		const newFacing = getFacing8Dir(xSpeed, ySpeed);

		if (this.aggro) {
			if (this.attackedAt + this.stateObject.attackTime < time && this.attackRange < distance) {
				this.setVelocityX(xSpeed);
				this.setVelocityY(ySpeed);
				const animation = updateMovingState(this.stateObject, true, newFacing);

				if (animation) {
					this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
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
				this.stateObject.currentFacing = newFacing;
			}

			if (distance <= this.attackRange && this.checkLoS()) {
				this.attack(time);
			}

			this.stateObject.x = this.body.x;
			this.stateObject.y = this.body.y;
		}
	}

	attack(time: number) {
		if (this.attackedAt + this.stateObject.attackTime < time) {
			this.setVelocityX(0);
			this.setVelocityY(0);
			this.attackedAt = time;
			this.scene.abilityHelper.triggerAbility(
				this.stateObject,
				this.stateObject,
				AbilityType.HAIL_OF_FLAMES,
				this.level,
				time
			);
		}
	}
}
