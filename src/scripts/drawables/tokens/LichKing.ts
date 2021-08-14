import { AbilityType } from '../../abilities/abilityData';
import { getFacing8Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import Enemy from '../../worldstate/Enemy';
import EnemyToken from './EnemyToken';
import { isCollidingTile } from '../../helpers/movement';

const ATTACK_RANGE = 80;
const SUMMON_SPEED = 1000;
const CAST_DURATION = 5000;

export default class LichtKingToken extends EnemyToken {

	summonCD = 30000;
	summonedAt = -Infinity;
	casting = 0;
	addsCounter: number = 0;
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	constructor(scene: MainScene, x: number, y: number, tokenName: string, level: number, id: string) {
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
			follow: this
		});
		this.emitter.startFollow(this.body.gameObject);
		this.emitter.start();
	}

	public update(time: number,) {
		super.update(time);

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

		const timeSinceAttack = Math.max(1,
			Math.min(this.stateObject.attackTime, time - this.attackedAt));
		this.emitter.setFrequency(30 + (this.stateObject.attackTime / timeSinceAttack))

		const tx = this.target.x;
		const ty = this.target.y;
		const distance = this.getDistance(tx, ty);

		const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
		const xFactor = (tx - this.x) / totalDistance;
		const yFactor = (ty - this.y) / totalDistance;
		(this.stateObject as Enemy).exactTargetXFactor = xFactor;
		(this.stateObject as Enemy).exactTargetYFactor = yFactor;
		const xSpeed = xFactor * this.stateObject.movementSpeed;
		const ySpeed = yFactor * this.stateObject.movementSpeed;
		const newFacing = getFacing8Dir(xSpeed, ySpeed);

		if(this.aggro) {
			if (this.attackedAt + this.stateObject.attackTime < time
				&& this.attackRange < distance) {

				this.setVelocityX(xSpeed);
				this.setVelocityY(ySpeed);
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
				this.stateObject.currentFacing = newFacing;
			}

			if(distance <= this.attackRange && this.checkLoS()) {
				this.attack(time);
			}

			this.stateObject.x = this.body.x;
			this.stateObject.y = this.body.y;
		}
	}

	attack(time: number) {
		if (this.summonedAt + this.summonCD < time) {
			this.summon(time);
		}
		else if (this.attackedAt + this.stateObject.attackTime < time) {
			this.setVelocityX(0);
			this.setVelocityY(0);
			this.attackedAt = time;
			this.scene.abilityHelper.triggerAbility(
				this.stateObject,
				AbilityType.ARCANE_BLADE,
				time);
		}
	}	
	summon(time: number) {
		if(this.casting === 0) {
			this.casting = SUMMON_SPEED;
			this.summonedAt = time;
		}
		if(this.casting >= CAST_DURATION) {
			this.casting = 0;
			return;
		}
		if (time - this.summonedAt > this.casting) {
			if ((this.casting / 1000) % 2 === 0) {
				let xy = this.getUncollidingXY(this.target.x, this.target.y);
				this.scene.addNpc(
					"LichAdd_" + this.addsCounter.toString(),
					"red-link",
					xy[0],
					xy[1],
					1,
					0,
					0);
				this.addsCounter++;
				this.casting += SUMMON_SPEED;
			} else {
				let xy = this.getUncollidingXY(this.stateObject.x, this.stateObject.y);
				this.scene.addNpc(
					"LichAdd_" + this.addsCounter.toString(),
					"enemy-zombie",
					xy[0],
					xy[1],
					1,
					0,
					0);
				this.addsCounter++;
				this.casting += SUMMON_SPEED;
			}
		}
	}
	getUncollidingXY(x: number, y: number) {
		let newX = x + Math.round(Math.random() * 100);
		let newY = y + Math.round(Math.random() * 100);
		let tile = this.scene.tileLayer.getTileAtWorldXY(newX, newY);
		console.log(tile?.index);
		while (isCollidingTile(tile?.index) === true) {
			newX = x + Math.round(Math.random() * 500);
			newY = y + Math.round(Math.random() * 500);
			tile = this.scene.tileLayer.getTileAtWorldXY(newX, newY);
		}
		return [newX, newY];
	}
}