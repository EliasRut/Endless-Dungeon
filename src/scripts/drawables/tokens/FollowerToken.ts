import MainScene from '../../scenes/MainScene';
import {
	Faction,
	SCALE,
	NPC_ANIMATION_FRAME_RATE,
	VISITED_TILE_TINT,
	PossibleTargets,
	FadingLabelSize,
} from '../../helpers/constants';
import globalState from '../../worldstate';
import Follower from '../../worldstate/Follower';
import { TILE_WIDTH } from '../../helpers/generateDungeon';
import { getFacing4Dir, isCollidingTile, updateMovingState } from '../../helpers/movement';
import { AbilityType } from '../../abilities/abilityData';
import CharacterToken from './CharacterToken';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

const FOLLOWER_DAMAGE = 2;
const FOLLOWER_HEALTH = 50;
const FOLLOWER_MOVEMENT_SPEED = 300;

const REGULAR_ATTACK_RANGE = 150;
const OPTIMAL_DISTANCE_TO_PLAYER = 4 * TILE_WIDTH * SCALE;
const OPTIMAL_TILE_DISTANCE_TO_PLAYER = 4;

const MAX_DISTANCE_TO_PLAYER = 20 * TILE_WIDTH * SCALE;

export default class FollowerToken extends CharacterToken {
	allowedTargets: PossibleTargets = PossibleTargets.ENEMIES;
	aggro: boolean = false;
	aggroLinger: number = 3000;
	attackRange: number;
	destroyed: boolean = false;
	lastUpdate: number = -Infinity;
	triggersAttack?: boolean = false;
	target: Phaser.Geom.Point;
	exhausted: boolean = false;
	exhaustedAt: number = 0;
	exhaustionDuration: number = 6000;
	exhaustionText: Phaser.GameObjects.Text;

	constructor(scene: MainScene, x: number, y: number, type: string, id: string) {
		super(scene, x, y, type, type, id);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		this.stateObject = globalState.followers[id];

		// this.stateObject = new Follower(
		// 	id,
		// 	type,
		// 	FOLLOWER_HEALTH,
		// 	FOLLOWER_DAMAGE,
		// 	FOLLOWER_MOVEMENT_SPEED
		// );
		// globalState.followers[id] = this.stateObject as Follower;
		this.faction = Faction.ALLIES;
		this.stateObject.vision = 150;
		this.stateObject.faction = Faction.ALLIES;
		this.target = new Phaser.Geom.Point(0, 0);
		this.attackRange = REGULAR_ATTACK_RANGE * SCALE;
	}

	// Since follower should always stay near player, we can use the same logic for checking LoS as
	// for the player itself.
	public checkLoS() {
		// Instead of ray tracing we're using the players line of sight calculation, which tints the
		// tile the enemy stands on.
		const tile = this.getOccupiedTile();
		return tile && tile.tint > VISITED_TILE_TINT;
	}

	// The follower should stay near the player and if it moves out of range, it should move closer
	// to the player.
	protected followPlayer() {
		const player = globalState.playerCharacter;
		if (this.getDistanceToWorldStatePosition(player.x, player.y) > OPTIMAL_DISTANCE_TO_PLAYER) {
			const tx = player.x;
			const ty = player.y;

			const totalDistance = Math.abs(tx * SCALE - this.x) + Math.abs(ty * SCALE - this.y);
			const xSpeed = ((tx * SCALE - this.x) / totalDistance) * this.stateObject.movementSpeed;
			const ySpeed = ((ty * SCALE - this.y) / totalDistance) * this.stateObject.movementSpeed;
			this.setVelocityX(xSpeed);
			this.setVelocityY(ySpeed);
			const newFacing = getFacing4Dir(xSpeed, ySpeed);
			const animation = updateMovingState(this.stateObject, true, newFacing);
			if (animation) {
				if (this.scene.game.anims.exists(animation)) {
					this.play({ key: animation, frameRate: NPC_ANIMATION_FRAME_RATE, repeat: -1 });
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play({ key: animation, frameRate: NPC_ANIMATION_FRAME_RATE, repeat: -1 });
				}
			}
		} else {
			this.setVelocityX(0);
			this.setVelocityY(0);
			const animation = updateMovingState(this.stateObject, false, this.stateObject.currentFacing);
			if (animation) {
				if (this.scene.game.anims.exists(animation)) {
					this.play({ key: animation, frameRate: NPC_ANIMATION_FRAME_RATE });
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play({ key: animation, frameRate: NPC_ANIMATION_FRAME_RATE });
				}
			}
		}
	}

	// If follower is too far away from the player, it should be teleported to the player
	protected teleportFollower() {
		const player = globalState.playerCharacter;

		if (this.getDistanceToWorldStatePosition(player.x, player.y) > MAX_DISTANCE_TO_PLAYER) {
			const tx = player.x;
			const ty = player.y;

			// New coordinates for follower position
			let newXPosition: number;
			let newYPosition: number;
			let validPositionFound: boolean = false;

			for (
				let xDiff = -OPTIMAL_TILE_DISTANCE_TO_PLAYER;
				xDiff < OPTIMAL_TILE_DISTANCE_TO_PLAYER;
				xDiff++
			) {
				for (
					let yDiff = -OPTIMAL_TILE_DISTANCE_TO_PLAYER;
					yDiff < OPTIMAL_TILE_DISTANCE_TO_PLAYER;
					yDiff++
				) {
					newXPosition = (tx + xDiff * TILE_WIDTH) * SCALE;
					newYPosition = (ty + yDiff * TILE_WIDTH) * SCALE;

					// Test if target base or decoration tile is occupied and find unoccupied tile if necessary
					const currentBaseTileIndex = (this.scene as MainScene).tileLayer.getTileAtWorldXY(
						newXPosition,
						newYPosition
					)?.index;
					const currentDecorationTileIndex = (
						this.scene as MainScene
					).decorationLayer.getTileAtWorldXY(newXPosition, newYPosition)?.index;

					if (
						currentBaseTileIndex === undefined ||
						isCollidingTile(currentBaseTileIndex) ||
						isCollidingTile(currentDecorationTileIndex)
					) {
						continue;
					}
					validPositionFound = true;
					this.x = newXPosition;
					this.y = newYPosition;
					break;
				}
				if (validPositionFound) {
					break;
				}
			}
			if (!validPositionFound) {
				console.log(`Could not teleport follower - no valid position found.`);
			}
		}
	}

	// Check which enemy is closest and if enemy is in range, follower triggers an ability
	protected triggerAbility(globalTime: number) {
		let nearestEnemy: CharacterToken | undefined;
		let closestDistance = Infinity;
		let aggro = false;
		if (this.exhausted) {
			return;
		}
		if (this.allowedTargets === PossibleTargets.ENEMIES) {
			const potentialEnemies = Object.values((this.scene as MainScene)?.npcMap || {}).filter(
				(npc) =>
					npc.faction === Faction.ENEMIES &&
					npc.tintBottomLeft >= VISITED_TILE_TINT &&
					npc.stateObject?.health > 0
			);
			closestDistance = Infinity;
			nearestEnemy = potentialEnemies.reduce((nearest, token) => {
				if (Math.hypot(token.x - this.x, token.y - this.y) < closestDistance) {
					closestDistance = Math.hypot(token.x - this.x, token.y - this.y);
					return token;
				}
				return nearest;
			}, undefined as CharacterToken | undefined);
		} else if (this.allowedTargets === PossibleTargets.PLAYER) {
			nearestEnemy = (this.scene as MainScene).mainCharacter;
		}

		if (nearestEnemy) {
			console.log(`Closest distance: ${closestDistance}`);
			if (this.checkLoS() && closestDistance < this.stateObject.vision * SCALE) {
				aggro = true;
				this.lastUpdate = globalTime;
				this.target.x = nearestEnemy.x;
				this.target.y = nearestEnemy.y;
			} else if (aggro && this.lastUpdate + this.aggroLinger < globalTime) {
				aggro = false;
			}
		}

		if (aggro) {
			const tx = this.target.x;
			const ty = this.target.y;
			const deltaX = tx - this.x;
			const deltaY = ty - this.y;
			const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);

			if (totalDistance < this.attackRange * SCALE) {
				const time = this.scene.time;

				// Make sure follower is faced in direction of target when trigger ability
				const xSpeed = (deltaX / totalDistance) * this.stateObject.movementSpeed;
				const ySpeed = (deltaY / totalDistance) * this.stateObject.movementSpeed;
				this.setVelocityX(xSpeed);
				this.setVelocityY(ySpeed);
				const newFacing = getFacing4Dir(xSpeed, ySpeed);
				const animation = updateMovingState(this.stateObject, true, newFacing);
				if (animation) {
					if (this.scene.game.anims.exists(animation)) {
						this.play({ key: animation, frameRate: NPC_ANIMATION_FRAME_RATE, repeat: -1 });
					} else {
						console.log(`Animation ${animation} does not exist.`);
						this.play({ key: animation, frameRate: NPC_ANIMATION_FRAME_RATE, repeat: -1 });
					}
				}

				(this.scene as MainScene).abilityHelper.triggerAbility(
					this.stateObject,
					{
						...this.stateObject,
						x: this.x / SCALE,
						y: this.y / SCALE,
						exactTargetXFactor: deltaX / totalDistance,
						exactTargetYFactor: deltaY / totalDistance,
					},
					(this.stateObject as Follower).ability,
					(this.stateObject as Follower).level,
					time.now
				);
			}
		}
	}

	update(globalTime: number, deltaTime: number) {
		super.update(globalTime, deltaTime);

		// Check if follwer is exhausted
		if (this.stateObject.health <= 0 && !this.exhausted) {
			this.exhausted = true;
			this.exhaustedAt = globalTime;
			this.setVelocity(0, 0);

			// Make sure that follower is not attacked while exhausted
			this.faction = Faction.NPCS;
			this.stateObject.faction = Faction.NPCS;

			// Show exhaustion status
			this.scene.addFadingLabel(
				'I feel exhausted',
				FadingLabelSize.NORMAL,
				'#fff',
				this.x - 24 * SCALE,
				this.y - 24 * SCALE,
				this.exhaustionDuration
			);
		}

		// Reset state for follower after exhaustion time is over
		if (globalTime > this.exhaustedAt + this.exhaustionDuration && this.exhausted) {
			this.exhausted = false;
			this.stateObject.health = FOLLOWER_HEALTH;
			this.faction = Faction.ALLIES;
			this.stateObject.faction = Faction.ALLIES;
		}

		// Don't do NPC actions if exhausted
		if (this.exhausted) {
			return;
		}

		if (this.lastUpdate <= globalTime) {
			// Check if the follower needs to be teleported to player
			this.teleportFollower();

			// Check if the follower has to move closer to the player
			this.followPlayer();

			// Update follower position
			this.stateObject.x = Math.round(this.x / SCALE);
			this.stateObject.y = Math.round(this.y / SCALE);

			const stateObject = this.stateObject as Follower;
			if (globalTime - stateObject.abilityCastTime[0] > 1000) {
				// Check if enemy is in attack range and set attack trigger
				this.triggerAbility(globalTime);
				stateObject.abilityCastTime[0] = globalTime;
			}
		}
	}
}
