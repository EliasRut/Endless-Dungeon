import {
	facingToSpriteNameMap,
	Faction,
	SCALE,
	VISITED_TILE_TINT,
	NORMAL_ANIMATION_FRAME_RATE,
} from '../../helpers/constants';
import CharacterToken from './CharacterToken';
import Enemy from '../../worldstate/Enemy';
import FireBallEffect from '../effects/FireBallEffect';
import globalState from '../../worldstate';
import MainScene from '../../scenes/MainScene';
import { TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import { generateRandomItem } from '../../helpers/item';
import Item from '../../worldstate/Item';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

const ENEMY_DAMAGE = 5;
const ENEMY_HEALTH = 4;
const ENEMY_SPEED = 35;

const GREEN_DIFF = 0x003300;

export default abstract class EnemyToken extends CharacterToken {
	fireballEffect: FireBallEffect | undefined;
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	tokenName: string;
	attackRange: number;
	attackedAt: number = -Infinity;
	lastUpdate: number = -Infinity;
	aggroLinger: number = 3000;
	aggro: boolean = false;
	target: Phaser.Geom.Point;
	level: number;

	constructor(scene: MainScene, x: number, y: number, tokenName: string, id: string) {
		super(scene, x, y, tokenName, tokenName, id);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.stateObject = new Enemy(tokenName, ENEMY_DAMAGE, ENEMY_HEALTH, ENEMY_SPEED);
		globalState.enemies[id] = this.stateObject;
		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);
		this.tokenName = tokenName;
		this.target = new Phaser.Geom.Point(0, 0);
		this.faction = Faction.ENEMIES;
	}

	public checkLoS() {
		// Instead of ray tracing we're using the players line of sight calculation, which tints the
		// tile the enemy stands on.
		const tile = this.getOccupiedTile();
		return tile && tile.tint > VISITED_TILE_TINT;
	}

	dropRandomItem(level: number = 1) {
		if (this.scene === undefined) {
			// TODO find out when this happens
			return;
		}

		const itemData = generateRandomItem({ level });
		this.scene.dropItem(this.x, this.y, itemData.itemKey, itemData.level);
	}

	dropFixedItem(id: string) {
		if (this.scene === undefined) {
			// ???
			return;
		}
		this.scene.addFixedItem(id, this.x, this.y);
	}

	protected receiveDotDamage(deltaTime: number) {
		// dot = damage over time, deltatime is in ms so we have to devide it by 1000
		const dot =
			(globalState.playerCharacter.damage * this.necroticEffectStacks * deltaTime) / 1000 / 4;
		this.stateObject.health = this.stateObject.health - dot;
	}

	protected setSlowFactor() {
		this.stateObject.slowFactor = Math.max(1 - this.iceEffectStacks / 4, 0.01);
	}

	// update from main Scene
	public update(time: number, deltaTime: number) {
		super.update(time, deltaTime);
		this.setSlowFactor();
		// set aggro boolean, use a linger time for aggro
		if (this.lastUpdate <= time) {
			const player = globalState.playerCharacter;
			if (
				this.checkLoS() &&
				this.getDistanceToWorldStatePosition(player.x, player.y) < this.stateObject.vision * SCALE
			) {
				this.aggro = true;
				this.lastUpdate = time;
				this.target.x = player.x;
				this.target.y = player.y;
			} else if (this.aggro && this.lastUpdate + this.aggroLinger < time) {
				this.aggro = false;
			}
		}
	}

	die() {
		this.play({ key: 'death_anim_small', frameRate: NORMAL_ANIMATION_FRAME_RATE });
		// 925 ms
		// new Promise(r => setTimeout(r, 925)).then(result => {
		// 	this.destroy();
		// })
		this.on('animationcomplete', () => this.destroy());
	}

	// destroy the enemy
	destroy() {
		if (this.scene?.npcMap) {
			delete this.scene.npcMap[this.id];
		}
		super.destroy();
	}

	// attack our hero
	attack(time: number) {
		return;
	}
}
