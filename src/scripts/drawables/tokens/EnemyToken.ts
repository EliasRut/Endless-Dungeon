import {
	facingToSpriteNameMap,
	Faction,
	SCALE,
	VISITED_TILE_TINT,
	NORMAL_ANIMATION_FRAME_RATE,
	ColorsOfMagic,
	DEBUG_PATHFINDING,
	KNOCKBACK_TIME,
} from '../../helpers/constants';
import CharacterToken from './CharacterToken';
import Enemy from '../../worldstate/Enemy';
import globalState from '../../worldstate';
import MainScene from '../../scenes/MainScene';
import { generateRandomItem } from '../../helpers/item';
import { RandomItemOptions } from '../../helpers/item';
import Character, { updateStatus } from '../../worldstate/Character';
import { findNextPathSegmentTo } from '../../helpers/pathfindingHelper';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import { getFacing4Dir, getXYfromTotalSpeed, updateMovingState } from '../../helpers/movement';
import { EnemyData, EnemyCategory, MeleeAttackType } from '../../enemies/enemyData';
import { UneqippableItem } from '../../../items/itemData';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

const ENEMY_DAMAGE = 5;
const ENEMY_HEALTH = 4;
const ENEMY_SPEED = 35;

const GREEN_DIFF = 0x003300;

const dropType = {
	BOSS: { ringWeight: 1, amuletWeight: 1 } as Partial<RandomItemOptions>,
	ELITE: { sourceWeight: 1, armorWeight: 1, catalystWeight: 1 } as Partial<RandomItemOptions>,
};

export default class EnemyToken extends CharacterToken {
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	tokenName: string;
	attackRange: number;
	attackedAt: number = -Infinity;
	lastUpdate: number = -Infinity;
	aggroLinger: number = 3000;
	aggro: boolean = false;
	target: Phaser.Geom.Point;
	nextWaypoint: [number, number][] | undefined;
	level: number;
	color: ColorsOfMagic;
	targetStateObject: Character | undefined;
	lastTileX: number;
	lastTileY: number;
	enemyData: EnemyData;
	dead: boolean;
	isCharging: boolean = false;
	chargeX: number | undefined;
	chargeY: number | undefined;

	isWaitingToDealDamage: boolean = false;

	protected showHealthbar() {
		return !!this.scene.showHealthbars;
	}

	constructor(
		scene: MainScene,
		x: number,
		y: number,
		tokenName: string,
		id: string,
		enemyData: EnemyData
	) {
		super(scene, x, y, tokenName, tokenName, id);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.stateObject = new Enemy(
			id,
			tokenName,
			enemyData.damage,
			enemyData.startingHealth,
			enemyData.movementSpeed
		);
		globalState.enemies[id] = this.stateObject;
		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);
		this.tokenName = tokenName;
		this.target = new Phaser.Geom.Point(0, 0);
		this.faction = Faction.ENEMIES;
		this.enemyData = enemyData;
		this.attackRange = enemyData.attackRange;
		this.color = enemyData.color;
	}

	checkLoS() {
		// Instead of ray tracing we're using the players line of sight calculation, which tints the
		// tile the enemy stands on.
		const tile = this.getOccupiedTile();
		return tile && tile.tint > VISITED_TILE_TINT;
	}

	/**
	 * Returns which equippable item is dropped, based on the type and level of the slain enemy.
	 * @param level of enemy
	 * @param type of enemy (boss, elite, normal)
	 */
	maybeDropEquippableItem() {
		// This shouldn't happen
		if (this.scene === undefined) {
			return;
		}
		if (this.enemyData.category === EnemyCategory.BOSS) {
			// Boss type enemies drop two items, a boss type and an elite type item
			const itemData = generateRandomItem({
				level: this.level,
				...dropType.BOSS,
			} as Partial<RandomItemOptions>);
			this.scene.dropItem(this.x, this.y, itemData.itemKey, itemData.level);

			const itemData2 = generateRandomItem({
				level: this.level,
				...dropType.ELITE,
			} as Partial<RandomItemOptions>);
			this.scene.dropItem(this.x, this.y, itemData2.itemKey, itemData2.level);
		} else if (this.enemyData.category === EnemyCategory.ELITE) {
			// Elite type enemies drop an elite type item
			const itemData = generateRandomItem({
				level: this.level,
				...dropType.ELITE,
			} as Partial<RandomItemOptions>);
			this.scene.dropItem(this.x, this.y, itemData.itemKey, itemData.level);
		}
	}

	/**
	 * Returns which unequippable item is dropped, based on the given id.
	 * @param itemType of unequippable item (essence, health, goldKey, ...)
	 */
	dropNonEquippableItem(itemType: UneqippableItem) {
		// This shouldn't happen
		if (this.scene === undefined) {
			return;
		}
		// For essence need to specify the color
		if (itemType === UneqippableItem.ESSENCE) {
			this.scene.addFixedItem(this.color, this.x, this.y);
		} else this.scene.addFixedItem(itemType, this.x, this.y);
	}

	/**
	 * Determines which items are dropped after an enemy is slain.
	 */
	dropItemsAfterDeath() {
		const HEALT_POTION_DROP_CHANCE =
			this.enemyData.healthPotionDropChance * globalState.playerCharacter.luck;

		if (this.stateObject.health <= 0 && !this.dead) {
			// Check if an equipable item or a health potion are dropped
			this.maybeDropEquippableItem();
			if (Math.random() < HEALT_POTION_DROP_CHANCE) {
				this.dropNonEquippableItem(UneqippableItem.HEALTH_POTION);
			}
			// Always drop essence
			this.dropNonEquippableItem(UneqippableItem.ESSENCE);

			this.dead = true;
			this.die();
			return;
		} else if (this.dead) return;
	}

	/**
	 *
	 */
	walkToWaypoint() {
		let tx = this.targetStateObject?.x || 0;
		let ty = this.targetStateObject?.y || 0;
		[tx, ty] = this.nextWaypoint
			? [this.nextWaypoint[0][0] * TILE_WIDTH, this.nextWaypoint[0][1] * TILE_HEIGHT]
			: [tx, ty];
		if (DEBUG_PATHFINDING) {
			this.nextWaypoint?.forEach((waypoint) => {
				const tile = this.scene.tileLayer.getTileAt(waypoint[0], waypoint[1]);
				if (tile) {
					tile.tint = 0xff0000;
				}
			});
		}
		const totalDistance =
			Math.abs(tx * SCALE - this.body.x) + Math.abs(ty * SCALE - this.body.y) || 1;
		const xSpeed =
			((tx * SCALE - this.body.x) / totalDistance) *
			this.stateObject.movementSpeed *
			this.stateObject.slowFactor;
		const ySpeed =
			((ty * SCALE - this.body.y) / totalDistance) *
			this.stateObject.movementSpeed *
			this.stateObject.slowFactor;
		this.setVelocityX(xSpeed);
		this.setVelocityY(ySpeed);
		const newFacing = getFacing4Dir(xSpeed, ySpeed);
		const animation = updateMovingState(this.stateObject, true, newFacing);
		if (animation) {
			if (this.scene.game.anims.exists(animation)) {
				this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE, repeat: -1 });
			} else {
				// tslint:disable-next-line: no-console
				console.log(`Animation ${animation} does not exist.`);
				this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE, repeat: -1 });
			}
		}
	}

	/**
	 * Defines what happens when enemy dies.
	 */
	die() {
		super.die();
		this.play({ key: 'death_anim_small', frameRate: NORMAL_ANIMATION_FRAME_RATE });
		this.body.destroy();
		this.on('animationcomplete', () => this.destroy());
	}

	/**
	 * Destroys the enemy token by deleting the id from the npc map.
	 */
	destroy() {
		if (this.scene?.npcMap) {
			delete this.scene.npcMap[this.id];
		}
		super.destroy();
	}

	executeMeleeAttack(time: number) {
		switch (this.enemyData.meleeAttackData!.attackType) {
			case MeleeAttackType.HIT: {
				if (this.attackedAt + this.stateObject.attackTime < time) {
					const tx = this.targetStateObject!.x * SCALE;
					const ty = this.targetStateObject!.y * SCALE;
					const xSpeed = tx - this.x;
					const ySpeed = ty - this.y;
					const newFacing = getFacing4Dir(xSpeed, ySpeed);

					const attackAnimationName = `${this.tokenName}-${
						this.enemyData.meleeAttackData!.animationName
					}-${facingToSpriteNameMap[newFacing]}`;
					this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });

					this.setVelocityX(0);
					this.setVelocityY(0);
					this.stateObject.isWalking = false;
					this.attackedAt = time;
					this.isWaitingToDealDamage = true;
				}
				break;
			}
			case MeleeAttackType.CHARGE: {
				if (!this.isWaitingToDealDamage) {
					this.attackedAt = time;
					this.isWaitingToDealDamage = true;
					this.setVelocityX(0);
					this.setVelocityY(0);
				}
				const chargeTime = this.enemyData.meleeAttackData?.chargeTime || 1;
				if (this.attackedAt + chargeTime > time) {
					const tx = this.target.x * SCALE;
					const ty = this.target.y * SCALE;
					const xSpeed = tx - this.x;
					const ySpeed = ty - this.y;
					const newFacing = getFacing4Dir(xSpeed, ySpeed);
					// 9 frames, so 9 frame rate for 1s.
					if (this.attackedAt === time || this.stateObject.currentFacing !== newFacing) {
						const attackAnimationName = `${this.tokenName}-${
							this.enemyData.meleeAttackData!.animationName
						}-${facingToSpriteNameMap[newFacing]}`;
						this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });
						this.anims.setProgress((time - this.attackedAt) / chargeTime);
						this.stateObject.currentFacing = newFacing;
					}
				} else if (this.attackedAt + chargeTime <= time && !this.isCharging) {
					const chargeSpeed =
						this.enemyData.meleeAttackData?.chargeSpeed || this.enemyData.movementSpeed;
					this.isCharging = true;
					const tx = this.target.x * SCALE;
					const ty = this.target.y * SCALE;
					const speeds = getXYfromTotalSpeed(this.y - ty, this.x - tx);
					const xSpeed = speeds[0] * chargeSpeed * this.stateObject.slowFactor * SCALE;
					const ySpeed = speeds[1] * chargeSpeed * this.stateObject.slowFactor * SCALE;
					const newFacing = getFacing4Dir(xSpeed, ySpeed);
					const attackAnimationName = `${this.tokenName}-${
						this.enemyData.meleeAttackData!.animationName
					}-${facingToSpriteNameMap[newFacing]}`;
					this.play({
						key: attackAnimationName,
						frameRate: NORMAL_ANIMATION_FRAME_RATE,
						startFrame: 8,
					});
					this.chargeX = xSpeed;
					this.chargeY = ySpeed;
				}
				break;
			}
		}
	}

	dealMeleeDamage(distance: number) {
		this.isWaitingToDealDamage = false;
		// If target is in attack range, attack and deal damage
		if (distance < this.attackRange) {
			const targetToken = this.scene.getTokenForStateObject(this.targetStateObject!);
			targetToken?.takeDamage(this.stateObject.damage);
			targetToken?.receiveHit();
		}
	}

	handleTokenMovement() {
		// If target is out of attack range, charge at it and stop when the token is in the proximity.
		// Enemy follows target only if close enough
		if (this.targetStateObject!.health > 0 && this.aggro) {
			this.walkToWaypoint();
		} else {
			// If token does not have aggro, or is already in attack range, stop walking
			this.setVelocityX(0);
			this.setVelocityY(0);
			const animation = updateMovingState(this.stateObject, false, this.stateObject.currentFacing);
			if (animation) {
				if (this.scene.game.anims.exists(animation)) {
					this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				}
			}
		}
	}

	handleMeleeAttack(time: number) {
		const distance = this.getDistanceToWorldStatePosition(
			this.targetStateObject!.x,
			this.targetStateObject!.y
		);

		// Deal damage for the currently running attack
		if (
			this.isWaitingToDealDamage &&
			this.enemyData.meleeAttackData?.attackType === MeleeAttackType.HIT
		) {
			if (this.attackedAt + this.enemyData.meleeAttackData!.attackDamageDelay < time) {
				this.dealMeleeDamage(distance);
			}
			return;
		}

		// If we are still in the cooldown period of the current attack, do nothing
		if (this.attackedAt + this.stateObject.attackTime >= time) {
			return;
		}

		// When token is in the proximity of the target, and target is alive, attack
		if (distance <= this.attackRange && this.targetStateObject!.health > 0) {
			this.executeMeleeAttack(time);
		} else {
			// Handle moving the token towards the enemy
			this.handleTokenMovement();
		}
	}

	/**
	 * Update funtion from the main scene.
	 * @param time
	 * @param deltaTime
	 */
	update(time: number, deltaTime: number) {
		super.update(time, deltaTime);
		this.setSlowFactor();

		// Check if enemy died and in that case, drop item
		this.dropItemsAfterDeath();

		updateStatus(time, this.stateObject);

		// Check if enemy is dead, stunned or if the scene is paused
		if (this.dead) return;
		if (this.stateObject.stunned) return;
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

		// If enemy is charmed, let it get back to normal aggro pattern
		if (this.charmedTime + 6000 < globalState.gameTime) {
			this.faction = Faction.ENEMIES;
			this.stateObject.faction = Faction.ENEMIES;
		}

		// Check for knockback effects
		if (this.lastMovedTimestamp + KNOCKBACK_TIME > time) {
			return;
		}
		// if (this.isCharging) {
		// 	this.setVelocityX(this.chargeX!);
		// 	this.setVelocityY(this.chargeY!);
		// }

		if (!this.checkLoS()) {
			// If we no longer see the target, and the aggro linger time has passed, reset the target
			if (this.lastUpdate + this.aggroLinger < time) {
				this.aggro = false;
				this.targetStateObject = undefined;
			}

			// if the token does not have aggro, and is not within line of sight to the player, do nothing
			if (!this.aggro) {
				return;
			}

			// The token is not in the line of sight, but still has lingering aggro, so move towards the
			// target.
			this.handleTokenMovement();
		} else {
			// Find closest target from all possible targets available
			let possibleTargets: Character[];
			if (this.faction === Faction.ALLIES) {
				possibleTargets = [...Object.values(globalState.enemies)].filter(
					(character) => character.health > 0 && character.faction === Faction.ENEMIES
				);
			} else {
				possibleTargets = [
					globalState.playerCharacter,
					...(globalState.activeFollower
						? [globalState.followers[globalState.activeFollower]]
						: []),
				].filter((character) => character.health > 0);
			}
			const sortedTargets = possibleTargets.sort((left, right) => {
				const distanceLeft = this.getDistanceToWorldStatePosition(left.x, left.y);
				const distanceRight = this.getDistanceToWorldStatePosition(right.x, right.y);
				return distanceLeft - distanceRight;
			});
			const closestTarget = sortedTargets[0];

			// If target is in vision, set aggro and update target
			const distanceToClosestTarget = closestTarget
				? this.getDistanceToWorldStatePosition(closestTarget.x, closestTarget.y)
				: Infinity;
			if (distanceToClosestTarget < this.stateObject.vision * SCALE) {
				this.aggro = true;
				this.lastUpdate = time;
				const currentTileX = Math.round(this.stateObject.x / TILE_WIDTH);
				const currentTileY = Math.round(this.stateObject.y / TILE_HEIGHT);
				if (
					this.lastTileX !== currentTileX ||
					this.lastTileY !== currentTileY ||
					this.targetStateObject?.x !== closestTarget.x ||
					this.targetStateObject?.y !== closestTarget.y
				) {
					this.lastTileX = currentTileX;
					this.lastTileY = currentTileY;
					this.nextWaypoint = findNextPathSegmentTo(
						currentTileX,
						currentTileY,
						Math.round(closestTarget.x / TILE_WIDTH),
						Math.round(closestTarget.y / TILE_HEIGHT),
						this.scene.navigationalMap
					);
				}
				this.targetStateObject = closestTarget;

				// If token has melee type, make melee attack
				if (this.enemyData.isMeleeEnemy === true) {
					this.handleMeleeAttack(time);
				}
			}
		}
		this.stateObject.x = this.body.x / SCALE;
		this.stateObject.y = this.body.y / SCALE;
	}

	onCollide(withEnemy: boolean) {
		if (this.isCharging) {
			let stunDuration = this.enemyData.meleeAttackData?.wallCollisionStunDuration || 0;
			if (withEnemy) {
				stunDuration = this.enemyData.meleeAttackData?.enemyCollisionStunDuration || 0;
				if (this.isWaitingToDealDamage && this.targetStateObject) {
					const targetToken = this.scene.getTokenForStateObject(this.targetStateObject);
					targetToken?.receiveStun(stunDuration);
					targetToken?.takeDamage(this.stateObject.damage);
					targetToken?.receiveHit();
					this.isWaitingToDealDamage = false;
				}
			}
			this.receiveStun(stunDuration);
			const tx = this.target.x;
			const ty = this.target.y;
			const xSpeed = tx - this.x;
			const ySpeed = ty - this.y;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const stunAnimation = `${this.tokenName}-stun-${facingToSpriteNameMap[newFacing]}`;
			const recoverAnimation = `${this.tokenName}-shake-${facingToSpriteNameMap[newFacing]}`;
			// 4 repeats per second, at currently 16 fps.
			this.play({
				key: stunAnimation,
				frameRate: NORMAL_ANIMATION_FRAME_RATE,
				repeat: Math.floor((4 * (stunDuration - 500)) / 1000),
			}).chain({ key: recoverAnimation, repeat: 3 });
		}
	}
}
