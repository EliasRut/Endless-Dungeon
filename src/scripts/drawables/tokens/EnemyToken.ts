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
import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import { EnemyData, SlainEnemy } from '../../enemies/enemyData';
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

export default abstract class EnemyToken extends CharacterToken {
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

	meleeAttackExectued: boolean;

	protected showHealthbar() {
		return !!this.scene.showHealthbars;
	}

	constructor(scene: MainScene, x: number, y: number, tokenName: string, id: string) {
		super(scene, x, y, tokenName, tokenName, id);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.stateObject = new Enemy(id, tokenName, ENEMY_DAMAGE, ENEMY_HEALTH, ENEMY_SPEED);
		globalState.enemies[id] = this.stateObject;
		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);
		this.tokenName = tokenName;
		this.target = new Phaser.Geom.Point(0, 0);
		this.faction = Faction.ENEMIES;
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
	dropEquippableItem(level: number = 1, type: SlainEnemy) {
		if (this.scene === undefined) {
			// TODO find out when this happens
			return;
		}
		if (type === SlainEnemy.BOSS) {
			// Boss type enemies drop two items, a boss type and an elite type item
			const itemData = generateRandomItem({
				level,
				...dropType.BOSS,
			} as Partial<RandomItemOptions>);
			this.scene.dropItem(this.x, this.y, itemData.itemKey, itemData.level);

			const itemData2 = generateRandomItem({
				level,
				...dropType.ELITE,
			} as Partial<RandomItemOptions>);
			this.scene.dropItem(this.x, this.y, itemData2.itemKey, itemData2.level);
		} else if (type === SlainEnemy.ELITE) {
			// Elite type enemies drop an elite type item
			const itemData = generateRandomItem({
				level,
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
		if (this.scene === undefined) {
			// ???
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
	dropItemAfterDeath() {
		const HEALT_POTION_DROP_CHANCE =
			this.enemyData.healthPotionDropChance * globalState.playerCharacter.luck;

		if (this.stateObject.health <= 0 && !this.dead) {
			// Check if an equipable item or a health potion are dropped
			if (Math.random() < this.enemyData.itemDropChance) {
				this.dropEquippableItem(this.level, SlainEnemy.NORMAL);
			} else if (Math.random() < HEALT_POTION_DROP_CHANCE) {
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

	/**
	 * Defines the attack pattern dependen on the type of enemy (melee or ranged).
	 * @param time
	 */
	attack(time: number) {
		// Check if there is a target to attack
		const target = this.targetStateObject;
		if (!target) {
			return;
		}

		// Define attack pattern for melee type enemies
		if (this.enemyData.isMeleeEnemy === true) {
			//
			let tx = this.targetStateObject?.x || 0;
			let ty = this.targetStateObject?.y || 0;
			const distance = this.getDistanceToWorldStatePosition(tx, ty);

			if (
				this.attackedAt > 0 &&
				!this.meleeAttackExectued &&
				this.attackedAt + this.enemyData.meleeAttackData.attackDamageDelay < time
			) {
				this.meleeAttackExectued = true;
				// If target is in attack range, attack and deal damage
				if (distance < this.attackRange) {
					const targetToken = this.scene.getTokenForStateObject(target);
					targetToken?.takeDamage(this.stateObject.damage);
					targetToken?.receiveHit();
				}
				return;
			} else if (this.attackedAt + this.stateObject.attackTime >= time) {
				return;
			}

			// If target is out of attack range, enemy charges at it and stops when in target proximity.
			// Enemy follows target only if close enough
			if (
				this.targetStateObject &&
				this.targetStateObject.health > 0 &&
				this.aggro &&
				this.attackedAt + this.stateObject.attackTime < time &&
				this.attackRange < distance
			) {
				this.walkToWaypoint();
			} else {
				// If enemy is not close enough to target it stands around and does nothing
				this.setVelocityX(0);
				this.setVelocityY(0);
				const animation = updateMovingState(
					this.stateObject,
					false,
					this.stateObject.currentFacing
				);
				if (animation) {
					if (this.scene.game.anims.exists(animation)) {
						this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
					} else {
						console.log(`Animation ${animation} does not exist.`);
						this.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
					}
				}
			}
			// When enemy is in target proximity and target is alive, it attacks
			if (
				distance <= this.attackRange &&
				this.targetStateObject &&
				this.targetStateObject.health > 0
			) {
				if (this.attackedAt + this.stateObject.attackTime < time) {
					const tx = this.target.x * SCALE;
					const ty = this.target.y * SCALE;
					const xSpeed = tx - this.x;
					const ySpeed = ty - this.y;
					const newFacing = getFacing4Dir(xSpeed, ySpeed);

					const attackAnimationName = `${this.tokenName}-attack-${facingToSpriteNameMap[newFacing]}`;
					this.play({ key: attackAnimationName, frameRate: NORMAL_ANIMATION_FRAME_RATE });

					this.setVelocityX(0);
					this.setVelocityY(0);
					this.stateObject.isWalking = false;
					this.attackedAt = time;
					this.meleeAttackExectued = false;
				}
			}

			this.stateObject.x = this.body.x / SCALE;
			this.stateObject.y = this.body.y / SCALE;
		}

		return;
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
		this.dropItemAfterDeath();

		updateStatus(time, this.stateObject);
		// Check if enemy is stunned or if the scene is paused
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

		let possibleTargets: Character[];
		if (this.faction === Faction.ALLIES) {
			possibleTargets = [...Object.values(globalState.enemies)].filter(
				(character) => character.health > 0 && character.faction === Faction.ENEMIES
			);
		} else {
			possibleTargets = [
				globalState.playerCharacter,
				...(globalState.activeFollower ? [globalState.followers[globalState.activeFollower]] : []),
			].filter((character) => character.health > 0);
		}
		const sortedTargets = possibleTargets.sort((left, right) => {
			const distanceLeft = this.getDistanceToWorldStatePosition(left.x, left.y);
			const distanceRight = this.getDistanceToWorldStatePosition(right.x, right.y);
			return distanceLeft - distanceRight;
		});
		const closestTarget = sortedTargets[0];

		if (
			closestTarget &&
			this.checkLoS() &&
			this.getDistanceToWorldStatePosition(closestTarget.x, closestTarget.y) <
				this.stateObject.vision * SCALE
		) {
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
			// if we no longer see the target, and the aggro linger time has passed, reset the target
		} else if (this.aggro && this.lastUpdate + this.aggroLinger < time) {
			this.aggro = false;
			this.targetStateObject = undefined;
		}
	}
}
