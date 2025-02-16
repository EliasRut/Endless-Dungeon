import {
	facingToSpriteNameMap,
	Faction,
	SCALE,
	VISITED_TILE_TINT,
	NORMAL_ANIMATION_FRAME_RATE,
	ColorsOfMagic,
	DEBUG_PATHFINDING,
	KNOCKBACK_TIME,
	FadingLabelSize,
} from '../../helpers/constants';
import CharacterToken from './CharacterToken';
import Enemy from '../../../../types/Enemy';
import worldstate from '../../worldState';
import MainScene from '../../scenes/MainScene';
import { generateRandomItem } from '../../helpers/item';
import { RandomItemOptions } from '../../helpers/item';
import Character, { updateStatus } from '../../../../types/Character';
import { findNextPathSegmentTo } from '../../helpers/pathfindingHelper';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import { getFacing4Dir, getXYfromTotalSpeed, updateMovingState } from '../../helpers/movement';
import { EnemyData, EnemyCategory, MeleeAttackType } from '../../enemies/enemyData';
import { DEBUG_ENEMY_AI } from '../../helpers/constants';
import { getClosestTarget } from '../../helpers/targetingHelpers';
import { UneqippableItem } from '../../../../types/Item';
import { DefaultEnemyTokenData, EnemyTokenData } from '../../../../types/EnemyTokenData';
import { handleCollision } from '../../ai/enemies/handleCollision';
import { applyAiStepResult } from '../../ai/applyAiStepResult';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

const dropType = {
	BOSS: { ringWeight: 1, amuletWeight: 1 } as Partial<RandomItemOptions>,
	ELITE: { sourceWeight: 1, armorWeight: 1, catalystWeight: 1 } as Partial<RandomItemOptions>,
};

export default class EnemyToken extends CharacterToken {
	tokenData: EnemyTokenData;

	protected showHealthbar() {
		return !!this.scene?.showHealthbars && !this.tokenData.isSpawning;
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
			enemyData.level,
			enemyData.damage,
			enemyData.startingHealth,
			enemyData.movementSpeed
		);
		worldstate.enemies[id] = this.stateObject;
		this.body!.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);
		this.tokenData = { ...DefaultEnemyTokenData, ...this.getTokenData() };
		this.tokenData.tokenName = tokenName;
		this.tokenData.target = [0, 0];
		this.tokenData.faction = Faction.ENEMIES;
		this.tokenData.enemyData = enemyData;
		this.tokenData.color = enemyData.color;
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
		if (this.tokenData.enemyData?.category === EnemyCategory.BOSS) {
			// Boss type enemies drop two items, a boss type and an elite type item
			const itemData = generateRandomItem({
				level: this.stateObject.level,
				...dropType.BOSS,
			} as Partial<RandomItemOptions>);
			this.scene.dropItem(this.x, this.y, itemData.itemKey, itemData.level);

			const itemData2 = generateRandomItem({
				level: this.stateObject.level,
				...dropType.ELITE,
			} as Partial<RandomItemOptions>);
			this.scene.dropItem(this.x, this.y, itemData2.itemKey, itemData2.level);
		} else if (this.tokenData.enemyData?.category === EnemyCategory.ELITE) {
			// Elite type enemies drop an elite type item
			const itemData = generateRandomItem({
				level: this.stateObject.level,
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
			this.scene.addFixedItem(this.tokenData.color!, this.x, this.y);
		} else this.scene.addFixedItem(itemType, this.x, this.y);
	}

	/**
	 * Determines which items are dropped after an enemy is slain.
	 */
	dropItemsAfterDeath() {
		const HEALT_POTION_DROP_CHANCE =
			this.tokenData.enemyData!.healthPotionDropChance * worldstate.playerCharacter.luck;

		if (this.stateObject.health <= 0 && !this.tokenData.dead) {
			// Check if an equipable item or a health potion are dropped
			this.maybeDropEquippableItem();
			if (Math.random() < HEALT_POTION_DROP_CHANCE) {
				this.dropNonEquippableItem(UneqippableItem.HEALTH_POTION);
			}
			// Always drop essence
			this.dropNonEquippableItem(UneqippableItem.ESSENCE);

			this.tokenData.dead = true;
			this.die();
			return;
		} else if (this.tokenData.dead) return;
	}

	/**
	 *
	 */
	walkToWaypoint() {
		let tx = this.tokenData.targetStateObject?.x || 0;
		let ty = this.tokenData.targetStateObject?.y || 0;
		[tx, ty] = this.tokenData.nextWaypoint
			? [
					this.tokenData.nextWaypoint[0][0] * TILE_WIDTH,
					this.tokenData.nextWaypoint[0][1] * TILE_HEIGHT,
			  ]
			: [tx, ty];
		if (DEBUG_PATHFINDING) {
			this.tokenData.nextWaypoint?.forEach((waypoint) => {
				const tile = this.scene.tileLayer!.getTileAt(waypoint[0], waypoint[1]);
				if (tile) {
					tile.tint = 0xff0000;
				}
			});
		}
		const totalDistance =
			Math.abs(tx * SCALE - this.body!.x) + Math.abs(ty * SCALE - this.body!.y) || 1;
		const xSpeed =
			((tx * SCALE - this.body!.x) / totalDistance) *
			this.stateObject.movementSpeed *
			this.stateObject.slowFactor;
		const ySpeed =
			((ty * SCALE - this.body!.y) / totalDistance) *
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
		this.body!.destroy();
		this.on('animationcomplete', () => this.destroy());
		console.log(`Enemy ${this.tokenData.id} died.`);
		if (DEBUG_ENEMY_AI) {
			this.scene.addFadingLabel('Dying', FadingLabelSize.NORMAL, '#ff0000', this.x, this.y, 1000);
		}
	}

	/**
	 * Destroys the enemy token by deleting the id from the npc map.
	 */
	destroy() {
		if (this.scene?.npcMap) {
			delete this.scene.npcMap[this.tokenData.id];
		}
		super.destroy();
	}

	handleTokenMovement() {
		// If target is out of attack range, move towards it and stop when the token is in the proximity.
		// Enemy follows target only if close enough
		if (this.tokenData.targetStateObject!.health > 0 && this.tokenData.aggro) {
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

		this.stateObject.x = this.body!.x / SCALE;
		this.stateObject.y = this.body!.y / SCALE;
	}

	executeMeleeAttack(time: number) {
		switch (this.tokenData.enemyData?.meleeAttackData!.attackType) {
			case MeleeAttackType.HIT: {
				if (this.tokenData.attackedAt + this.stateObject.attackTime < time) {
					if (DEBUG_ENEMY_AI) {
						this.scene.addFadingLabel(
							'Attacking',
							FadingLabelSize.NORMAL,
							'#ff0000',
							this.x,
							this.y,
							1000
						);
					}
					const tx = this.tokenData.targetStateObject!.x * SCALE;
					const ty = this.tokenData.targetStateObject!.y * SCALE;
					const xSpeed = tx - this.x;
					const ySpeed = ty - this.y;
					const newFacing = getFacing4Dir(xSpeed, ySpeed);

					const attackAnimationName = `${this.tokenData.tokenName}-${
						this.tokenData.enemyData.meleeAttackData!.animationName
					}-${facingToSpriteNameMap[newFacing]}`;
					this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });

					this.setVelocityX(0);
					this.setVelocityY(0);
					this.stateObject.isWalking = false;
					this.tokenData.attackedAt = time;
					this.tokenData.isWaitingToDealDamage = true;
				}
				break;
			}
			case MeleeAttackType.CHARGE: {
				if (!this.tokenData.isWaitingToAttack) {
					this.tokenData.attackedAt = time;
					this.tokenData.isWaitingToAttack = true;
					this.setVelocityX(0);
					this.setVelocityY(0);
					// this.scene.addFadingLabel(
					// 	'Charge!',
					// 	FadingLabelSize.NORMAL,
					// 	'#ff0000',
					// 	this.x,
					// 	this.y,
					// 	1000
					// );
				}
				const chargeTime = this.tokenData.enemyData.meleeAttackData?.chargeTime || 1;
				if (this.tokenData.attackedAt + chargeTime > time && !this.tokenData.isCharging) {
					if (DEBUG_ENEMY_AI) {
						this.scene.addFadingLabel(
							'Preparing Charge',
							FadingLabelSize.NORMAL,
							'#ff0000',
							this.x,
							this.y,
							1000
						);
					}
					const tx = this.tokenData.targetStateObject!.x * SCALE;
					const ty = this.tokenData.targetStateObject!.y * SCALE;
					const xSpeed = tx - this.x;
					const ySpeed = ty - this.y;
					const newFacing = getFacing4Dir(xSpeed, ySpeed);
					// 9 frames, so 9 frame rate for 1s.
					if (this.tokenData.attackedAt === time || this.stateObject.currentFacing !== newFacing) {
						const attackAnimationName = `${this.tokenData.tokenName}-${
							this.tokenData.enemyData.meleeAttackData!.animationName
						}-${facingToSpriteNameMap[newFacing]}`;
						this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });
						this.anims.setProgress((time - this.tokenData.attackedAt) / chargeTime);
						this.stateObject.currentFacing = newFacing;
					}
					this.tokenData.isCharging = true;
					this.tokenData.isWaitingToAttack = false;
				} else if (
					this.tokenData.attackedAt + chargeTime <= time &&
					!this.tokenData.isWaitingToDealDamage
				) {
					if (DEBUG_ENEMY_AI) {
						this.scene.addFadingLabel(
							'Charging',
							FadingLabelSize.NORMAL,
							'#ff0000',
							this.x,
							this.y,
							1000
						);
					}
					const chargeSpeed =
						this.tokenData.enemyData.meleeAttackData?.chargeSpeed ||
						this.tokenData.enemyData.movementSpeed;
					const tx = this.tokenData.targetStateObject!.x * SCALE;
					const ty = this.tokenData.targetStateObject!.y * SCALE;
					const speeds = getXYfromTotalSpeed(this.y - ty, this.x - tx);
					const xSpeed = speeds[0] * chargeSpeed * this.stateObject.slowFactor * SCALE;
					const ySpeed = speeds[1] * chargeSpeed * this.stateObject.slowFactor * SCALE;
					const newFacing = getFacing4Dir(xSpeed, ySpeed);
					const attackAnimationName = `${this.tokenData.tokenName}-${
						this.tokenData.enemyData.meleeAttackData!.animationName
					}-${facingToSpriteNameMap[newFacing]}`;
					this.play({
						key: attackAnimationName,
						frameRate: NORMAL_ANIMATION_FRAME_RATE,
						startFrame: 8,
					});
					this.tokenData.chargeX = xSpeed;
					this.tokenData.chargeY = ySpeed;
					this.setVelocityX(xSpeed);
					this.setVelocityY(ySpeed);
					this.tokenData.isWaitingToDealDamage = true;
				}
				break;
			}
		}
	}

	dealMeleeDamage(distance: number) {
		this.tokenData.isWaitingToDealDamage = false;
		// If target is in attack range, attack and deal damage
		if (distance < this.tokenData.enemyData!.meleeAttackData!.attackRange) {
			const targetToken = this.scene.getTokenForStateObject(this.tokenData.targetStateObject!);
			targetToken?.takeDamage(this.stateObject.damage);
			targetToken?.receiveHit();
			if (DEBUG_ENEMY_AI) {
				this.scene.addFadingLabel(
					'Dealing Damage',
					FadingLabelSize.NORMAL,
					'#ff0000',
					this.x,
					this.y,
					1000
				);
			}
		}
	}

	handleMeleeAttack(time: number) {
		const distance = this.getDistanceToWorldStatePosition(
			this.tokenData.targetStateObject!.x,
			this.tokenData.targetStateObject!.y
		);

		// Deal damage for the currently running attack
		if (
			this.tokenData.isWaitingToDealDamage &&
			this.tokenData.enemyData?.meleeAttackData?.attackType === MeleeAttackType.HIT
		) {
			if (
				this.tokenData.attackedAt + this.tokenData.enemyData?.meleeAttackData!.attackDamageDelay <
				time
			) {
				this.dealMeleeDamage(distance);
			}
			return;
		}

		// If we are still in the cooldown period of the current attack, do nothing
		if (this.tokenData.attackedAt + this.stateObject.attackTime >= time) {
			return;
		}

		// When token is in the proximity of the target, and target is alive, attack
		if (
			distance <= this.tokenData.enemyData!.meleeAttackData!.attackRange &&
			this.tokenData.targetStateObject!.health > 0
		) {
			this.executeMeleeAttack(time);
		} else {
			// Handle moving the token towards the enemy
			this.handleTokenMovement();
		}
	}

	executeRangedAttack(time: number) {
		if (!this.tokenData.isWaitingToAttack && !this.tokenData.isCasting) {
			this.tokenData.attackedAt = time;
			this.tokenData.isWaitingToAttack = true;
			this.setVelocityX(0);
			this.setVelocityY(0);
		}

		const castTime = this.tokenData.enemyData?.rangedAttackData?.castTime || 1;
		if (this.tokenData.attackedAt + castTime > time && !this.tokenData.isCasting) {
			if (DEBUG_ENEMY_AI) {
				this.scene.addFadingLabel(
					'Preparing Ranged Attack',
					FadingLabelSize.NORMAL,
					'#ff0000',
					this.x,
					this.y,
					1000
				);
			}
			const tx = this.tokenData.targetStateObject!.x * SCALE;
			const ty = this.tokenData.targetStateObject!.y * SCALE;
			const xSpeed = tx - this.x;
			const ySpeed = ty - this.y;
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			// 9 frames, so 9 frame rate for 1s.
			if (this.tokenData.attackedAt === time || this.stateObject.currentFacing !== newFacing) {
				const attackAnimationName = `${this.tokenData.tokenName}-${
					this.tokenData.enemyData!.rangedAttackData!.animationName
				}-${facingToSpriteNameMap[newFacing]}`;
				this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				this.anims.setProgress((time - this.tokenData.attackedAt) / castTime);
				this.stateObject.currentFacing = newFacing;
			}
			this.tokenData.isCasting = true;
			this.tokenData.isWaitingToAttack = false;
			this.setVelocityX(0);
			this.setVelocityY(0);
		} else if (this.tokenData.attackedAt + castTime <= time && this.tokenData.isCasting) {
			if (DEBUG_ENEMY_AI) {
				this.scene.addFadingLabel(
					'Casting',
					FadingLabelSize.NORMAL,
					'#ff0000',
					this.x,
					this.y,
					1000
				);
			}
			this.scene.abilityHelper!.triggerAbility(
				this.stateObject,
				this.stateObject,
				this.tokenData.enemyData?.rangedAttackData!.abilityType!,
				this.stateObject.level,
				time,
				1
			);

			this.tokenData.isCasting = false;
		}
	}

	handleRangedAttack(time: number) {
		const distance = this.getDistanceToWorldStatePosition(
			this.tokenData.targetStateObject!.x,
			this.tokenData.targetStateObject!.y
		);

		// If we are still in the cooldown period of the current attack, do nothing
		// if (this.attackedAt + this.stateObject.attackTime >= time) {
		// 	return;
		// }

		// When token is in the proximity of the target, and target is alive, attack
		if (
			distance <= this.tokenData.enemyData!.rangedAttackData!.castRange &&
			this.tokenData.targetStateObject!.health > 0
		) {
			this.executeRangedAttack(time);
		} else {
			this.tokenData.isWaitingToDealDamage = false;

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

		if (!this.tokenData.spawnedAt) {
			if (this.tokenData.enemyData?.spawnOnVisible) {
				if (!this.visible) {
					return;
				}
			}
			this.tokenData.spawnedAt = time;
			this.tokenData.isSpawning = true;
			if (this.tokenData.enemyData?.useSpawnAnimation) {
				const animation = `${this.tokenData.tokenName}-spawn-e`;
				this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				this.healthbar!.setVisible(false);
			}
		}

		if (
			this.tokenData.enemyData?.useSpawnAnimation &&
			this.tokenData.spawnedAt + (this.tokenData.enemyData?.spawnAnimationTime || 1000) > time
		) {
			return;
		}

		if (this.tokenData.isSpawning) {
			this.tokenData.isSpawning = false;
			const isHealthbarVisible = this.showHealthbar();
			if (isHealthbarVisible) {
				this.healthbar!.setVisible(true);
				this.updateHealthbar();
			}
		}

		this.setSlowFactor();

		// Check if enemy died and in that case, drop item
		this.dropItemsAfterDeath();

		updateStatus(time, this.stateObject);

		// Check if enemy is dead, stunned or if the scene is paused
		if (this.tokenData.dead) return;
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

		if (this.tokenData.charmedTime + 6000 < worldstate.gameTime) {
			// If enemy is charmed, let it get back to normal aggro pattern
			this.tokenData.faction = Faction.ENEMIES;
			this.stateObject.faction = Faction.ENEMIES;
		}

		// Check for knockback effects
		if (this.tokenData.lastMovedTimestamp + KNOCKBACK_TIME > time) {
			return;
		}
		if (this.tokenData.isCharging) {
			this.stateObject.x = this.body!.x / SCALE;
			this.stateObject.y = this.body!.y / SCALE;
			this.executeMeleeAttack(time);
			return;
		}

		if (!this.checkLoS()) {
			// If we no longer see the target, and the aggro linger time has passed, reset the target
			if (this.tokenData.lastUpdate + this.tokenData.aggroLinger < time) {
				this.tokenData.aggro = false;
				this.tokenData.targetStateObject = undefined;
			}

			// if the token does not have aggro, and is not within line of sight to the player, do nothing
			if (!this.tokenData.aggro) {
				return;
			}

			// The token is not in the line of sight, but still has lingering aggro, so move towards the
			// target.
			this.handleTokenMovement();
		} else {
			// Find closest target from all possible targets available
			const closestTarget = getClosestTarget(this.tokenData.faction!, this.x, this.y);

			// If target is in vision, set aggro and update target
			const distanceToClosestTarget = closestTarget
				? this.getDistanceToWorldStatePosition(closestTarget.x, closestTarget.y)
				: Infinity;
			if (distanceToClosestTarget < this.stateObject.vision * SCALE) {
				this.tokenData.aggro = true;
				this.tokenData.lastUpdate = time;
				const currentTileX = Math.round(this.stateObject.x / TILE_WIDTH);
				const currentTileY = Math.round(this.stateObject.y / TILE_HEIGHT);
				if (
					this.tokenData.lastTileX !== currentTileX ||
					this.tokenData.lastTileY !== currentTileY ||
					this.tokenData.targetStateObject?.x !== closestTarget!.x ||
					this.tokenData.targetStateObject?.y !== closestTarget!.y
				) {
					this.tokenData.lastTileX = currentTileX;
					this.tokenData.lastTileY = currentTileY;
					this.tokenData.nextWaypoint = findNextPathSegmentTo(
						currentTileX,
						currentTileY,
						Math.round(closestTarget!.x / TILE_WIDTH),
						Math.round(closestTarget!.y / TILE_HEIGHT),
						this.scene.navigationalMap
					);
					if (DEBUG_ENEMY_AI) {
						this.scene.addFadingLabel(
							'Pathfinding',
							FadingLabelSize.NORMAL,
							'#ff0000',
							this.x,
							this.y,
							1000
						);
					}
				}
				this.tokenData.targetStateObject = closestTarget;

				// If token has melee type, make melee attack
				if (this.tokenData.enemyData?.isMeleeEnemy === true) {
					this.handleMeleeAttack(time);
				}

				// If token has ranged type, make ranged attack
				if (this.tokenData.enemyData?.isRangedEnemy === true) {
					this.handleRangedAttack(time);
				}
			}
		}
		this.stateObject.x = this.body!.x / SCALE;
		this.stateObject.y = this.body!.y / SCALE;
	}

	onCollide(withEnemy: boolean) {
		const collisionHandlingResult = handleCollision(
			this.tokenData,
			this.stateObject,
			this.x,
			this.y,
			withEnemy
		);
		applyAiStepResult(this, collisionHandlingResult);
	}
}
