import {
	facingToSpriteNameMap,
	KNOCKBACK_TIME,
	SCALE,
	NORMAL_ANIMATION_FRAME_RATE,
	ColorsOfMagic,
} from '../../helpers/constants';
import { getFacing4Dir, updateMovingState, getXYfromTotalSpeed } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import EnemyToken from './EnemyToken';
import { updateStatus } from '../../worldstate/Character';
import { EnemyCategory, MeleeAttackType } from '../../enemies/enemyData';
import { UneqippableItem } from '../../../items/itemData';

const BASE_ATTACK_DAMAGE = 10;
const REGULAR_ATTACK_RANGE = 75 * SCALE;
const REGULAR_MOVEMENT_SPEED = 80;
const MIN_MOVEMENT_SPEED = 25;
const BASE_HEALTH = 4;

const ITEM_DROP_CHANCE = 0;
const HEALTH_DROP_CHANCE = 0.06 * globalState.playerCharacter.luck;

const CHARGE_TIME = 650;
const ATTACK_DURATION = 2500;
const WALL_COLLISION_STUN = 2000;
const COLLISION_STUN = 1000;
const LAUNCH_SPEED = 150;
export default class VampireToken extends EnemyToken {
	attacking: boolean;
	startingHealth: number;
	launched: boolean = false;
	damaged: boolean = false;
	launchX: number;
	launchY: number;
	dead: boolean = false;

	constructor(
		scene: MainScene,
		x: number,
		y: number,
		tokenName: string,
		level: number,
		id: string
	) {
		super(scene, x, y, tokenName, id, {
			startingHealth: BASE_HEALTH * (1 + level * 0.5),
			damage: BASE_ATTACK_DAMAGE * (1 + level * 0.5),
			movementSpeed: REGULAR_MOVEMENT_SPEED,
			attackRange: REGULAR_ATTACK_RANGE,
			itemDropChance: 0,
			healthPotionDropChance: 0.05,
			category: EnemyCategory.NORMAL,
			color: ColorsOfMagic.BLOOD,
			isMeleeEnemy: true,
			isRangedEnemy: false,
			meleeAttackData: {
				attackDamageDelay: 450,
				attackType: MeleeAttackType.CHARGE,
				animationName: 'attack',
				wallCollisionStunDuration: WALL_COLLISION_STUN,
				enemyCollisionStunDuration: COLLISION_STUN,
				chargeTime: 250,
			},
		});
		// cool effects!
		this.level = level;
		this.stateObject.movementSpeed = REGULAR_MOVEMENT_SPEED;
		this.attacking = false;

		this.stateObject.attackTime = ATTACK_DURATION;
		this.color = ColorsOfMagic.BLOOD;
	}
}
