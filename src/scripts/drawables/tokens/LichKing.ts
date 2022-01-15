import { AbilityType } from '../../abilities/abilityData';
import { getFacing8Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import Enemy from '../../worldstate/Enemy';
import EnemyToken from './EnemyToken';
import { isCollidingTile } from '../../helpers/movement';

const ATTACK_RANGE = 120;
const SUMMON_SPEED = 500;
const CAST_DURATION = 2500;
const SPAWN_SEARCH_RADIUS = 250;

export default class LichtKingToken extends EnemyToken {
	summonCD = 20000;
	summonedAt = -Infinity;
	casting = 0;
	addsCounter: number = 0;
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

		if (this.casting > 0) {
			this.summon(time);
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
					this.play(animation);
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
		if (this.summonedAt + this.summonCD < time) {
			this.summon(time);
		} else if (this.attackedAt + this.stateObject.attackTime < time) {
			this.setVelocityX(0);
			this.setVelocityY(0);
			this.attackedAt = time;
			this.scene.abilityHelper.triggerAbility(
				this.stateObject,
				this.stateObject,
				AbilityType.ARCANE_BLADE,
				this.level,
				time
			);
		}
	}
	summon(time: number) {
		if (this.casting === 0) {
			this.casting = SUMMON_SPEED;
			this.summonedAt = time;
		}
		if (this.casting >= CAST_DURATION) {
			this.casting = 0;
			return;
		}
		if (time - this.summonedAt > this.casting) {
			if ((this.casting / 1000) % 2 === 0) {
				const xy = this.getUncollidingXY(this.target.x, this.target.y);
				this.scene.addNpc(
					'LichAdd_' + this.addsCounter.toString(),
					'red-link',
					xy[0],
					xy[1],
					1,
					0,
					0
				);
				this.addsCounter++;
				this.casting += SUMMON_SPEED;
			} else {
				const xy = this.getUncollidingXY(this.stateObject.x, this.stateObject.y);
				this.scene.addNpc(
					'LichAdd_' + this.addsCounter.toString(),
					'enemy-zombie',
					xy[0],
					xy[1],
					1,
					0,
					0
				);
				this.addsCounter++;
				this.casting += SUMMON_SPEED;
			}
		}
	}
	getUncollidingXY(x: number, y: number) {
		let newX = x + Math.round(Math.random() * SPAWN_SEARCH_RADIUS);
		let newY = y + Math.round(Math.random() * SPAWN_SEARCH_RADIUS);
		let tile = this.scene.tileLayer.getTileAtWorldXY(newX, newY);
		while (tile === null || isCollidingTile(tile?.index) === true) {
			newX = x + Math.round(Math.random() * SPAWN_SEARCH_RADIUS);
			newY = y + Math.round(Math.random() * SPAWN_SEARCH_RADIUS);
			tile = this.scene.tileLayer.getTileAtWorldXY(newX, newY);
		}
		return [newX, newY];
	}
}
