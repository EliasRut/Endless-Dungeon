import { VISITED_TILE_TINT } from '../../helpers/constants';
import CharacterToken from './CharacterToken';
import Enemy from '../../worldstate/Enemy';
import FireBallEffect from '../effects/FireBallEffect';
import globalState from '../../worldstate';
import MainScene from '../../scenes/MainScene';
import WeaponToken from './WeaponToken';
import { TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import { UI_DEPTHS } from '../../helpers/uiDepths';

const BODY_RADIUS = 6;
const BODY_X_OFFSET = 10;
const BODY_Y_OFFSET = 12;

const ENEMY_DAMAGE = 10;
const ENEMY_HEALTH = 10;
const ENEMY_SPEED = 35;

const NUMBER_ITEMS_IN_TILESET = 63;

export default abstract class EnemyToken extends CharacterToken {
	fireballEffect: FireBallEffect | undefined;
	emitter: Phaser.GameObjects.Particles.ParticleEmitter;
	scene: MainScene;
	tokenName: string;
	attackRange: number;
	attackedAt: number = -Infinity;
	lastUpdate: number = -Infinity;
	aggroLinger: number = 5000;
	aggro: boolean = false;
	target: Phaser.Geom.Point;

	constructor(scene: MainScene, x: number, y: number, tokenName: string) {
		super(scene, x, y, tokenName);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.stateObject = new Enemy(
			tokenName,
			ENEMY_DAMAGE,
			ENEMY_HEALTH,
			ENEMY_SPEED);
		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);
		this.tokenName = tokenName;
		this.target = new Phaser.Geom.Point(0, 0);

	}

	public getDistance(px: number, py: number) {
		const x = this.x - px;
		const y = this.y - py;
		return Math.hypot(x, y);
	}

	public checkLoS() {
		// Instead of ray tracing we're using the players line of sight calculation, which tints the
		// tile the enemy stands on.
		const tile = this.getOccupiedTile();
		return tile && tile.tint !== VISITED_TILE_TINT && tile.tint > 0;
	}

	dropItem() {
		if(this.scene === undefined) {
			// TODO find out when this happens
			return;
		}
		const rndItem = Math.floor(Math.random() * NUMBER_ITEMS_IN_TILESET);
		const length = this.scene.groundItem.push(new WeaponToken(this.scene, this.x, this.y, rndItem));
		this.scene.groundItem[length-1].setDepth(UI_DEPTHS.TOKEN_MAIN_LAYER);
	}

	private getOccupiedTile() {
		if (this.body) {
			const x = Math.round(this.body.x / TILE_WIDTH);
			const y = Math.round(this.body.y / TILE_HEIGHT);
			return this.scene.tileLayer.getTileAt(x, y);
		}
		return null;
	}

	// update from main Scene
	public update(time: number) {
		const tile = this.getOccupiedTile();
		if (tile) {
			this.tint = tile.tint;
			this.setVisible(tile.tint !== VISITED_TILE_TINT);
		}

		// set aggro boolean, use a linger time for aggro
		if (this.lastUpdate <= time) {
			const player = globalState.playerCharacter;
			const distance = this.getDistance(player.x, player.y);
			if (distance < this.stateObject.vision && this.checkLoS()) {
				this.aggro = true;
				this.lastUpdate = time;
				this.target.x = player.x;
				this.target.y = player.y;
			}
			else if(this.aggro
				&& this.lastUpdate + this.aggroLinger < time){
				this.aggro = false;
			}
		}
	}

	// destroy the enemy
	destroy() {
		super.destroy();
	}

	// attack our hero
	attack(time: number) {
		return;
	}
}