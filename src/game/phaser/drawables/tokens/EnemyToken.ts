import {
	Faction,
	SCALE,
	VISITED_TILE_TINT,
	NORMAL_ANIMATION_FRAME_RATE,
	KNOCKBACK_TIME,
	FadingLabelSize,
} from '../../helpers/constants';
import CharacterToken from './CharacterToken';
import Enemy from '../../../../types/Enemy';
import worldstate from '../../worldState';
import MainScene from '../../scenes/MainScene';
import { generateRandomItem } from '../../helpers/item';
import { RandomItemOptions } from '../../helpers/item';
import { updateStatus } from '../../../../types/Character';
import { findNextPathSegmentTo } from '../../helpers/pathfindingHelper';
import { TILE_HEIGHT, TILE_WIDTH } from '../../helpers/generateDungeon';
import { updateMovingState } from '../../helpers/movement';
import { EnemyData, EnemyCategory, MeleeAttackType } from '../../enemies/enemyData';
import { DEBUG_ENEMY_AI } from '../../helpers/constants';
import { getClosestTarget } from '../../helpers/targetingHelpers';
import { UneqippableItem } from '../../../../types/Item';
import { DefaultEnemyTokenData, EnemyTokenData } from '../../../../types/EnemyTokenData';
import { handleCollision } from '../../ai/enemies/handleCollision';
import { applyAiStepResult } from '../../ai/applyAiStepResult';
import { executeMeleeAttack, handleMeleeAttack } from '../../ai/enemies/executeMeleeAttack';
import { executeRangedAttack, handleRangedAttack } from '../../ai/enemies/executeRangedAttack';
import { handleTokenMovement } from '../../ai/enemies/handleTokenMovement';
import { getDistanceToWorldStatePosition } from '../../helpers/getDistanceToWorldStatePosition';
import { handleEnemyAi } from '../../ai/enemies/handleEnemyAi';

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

		applyAiStepResult(
			this,
			handleEnemyAi(
				this.tokenData,
				this.stateObject,
				this.x,
				this.y,
				this.body!.x,
				this.body!.y,
				time,
				this.scene
			)
		);
	}

	onCollide(withEnemy: boolean) {
		applyAiStepResult(
			this,
			handleCollision(this.tokenData, this.stateObject, this.x, this.y, withEnemy)
		);
	}
}
