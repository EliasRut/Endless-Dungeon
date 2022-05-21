import { AbilityType } from '../../abilities/abilityData';
import { Faction, PossibleTargets, SCALE, VISITED_TILE_TINT } from '../../helpers/constants';
import { getFacing4Dir, updateMovingState } from '../../helpers/movement';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import Character from '../../worldstate/Character';
import CharacterToken from './CharacterToken';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

const ELEMENTAL_DAMAGE = 5;
const ELEMENTAL_HEALTH = 4;
const ELEMENTAL_SPEED = 5;

const REGULAR_ATTACK_RANGE = 10;

export default class ElementalToken extends CharacterToken {
	id: string;
	tokenName: string;
	attackRange: number;
	attackedAt: number = -Infinity;
	lastUpdate: number = -Infinity;
	aggroLinger: number = 3000;
	aggro: boolean = false;
	target: Phaser.Geom.Point;
	level: number;
	allowedTargets: PossibleTargets = PossibleTargets.ENEMIES;
	destroyed: boolean = false;

	constructor(
		scene: MainScene,
		x: number,
		y: number,
		tokenName: string,
		level: number,
		id: string
	) {
		super(scene, x, y, tokenName, tokenName, id);
		this.scene = scene;
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		globalState.npcs[id] = this.stateObject;
		this.stateObject = new Character('rich', ELEMENTAL_HEALTH, ELEMENTAL_DAMAGE, ELEMENTAL_SPEED);
		this.stateObject.vision = 150;
		this.stateObject.movementSpeed = 100;
		this.tokenName = tokenName;
		this.target = new Phaser.Geom.Point(0, 0);
		this.faction = Faction.NPCS;
		this.attackRange = REGULAR_ATTACK_RANGE * SCALE;
		this.level = level;

		setTimeout(() => {
			if (this) {
				this.destroy();
			}
		}, 5000);
	}

	public checkLoS() {
		// Instead of ray tracing we're using the players line of sight calculation, which tints the
		// tile the enemy stands on.
		const tile = this.getOccupiedTile();
		return tile && tile.tint > VISITED_TILE_TINT;
	}

	// update from main Scene
	public update(time: number, deltaTime: number) {
		super.update(time, deltaTime);
		if (this.destroyed) {
			return;
		}
		// set aggro boolean, use a linger time for aggro
		if (this.lastUpdate <= time) {
			let nearestEnemy: CharacterToken | undefined;
			let closestDistance = Infinity;
			if (this.allowedTargets === PossibleTargets.ENEMIES) {
				const potentialEnemies = Object.values((this.scene as MainScene).npcMap).filter(
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
					this.aggro = true;
					this.lastUpdate = time;
					this.target.x = nearestEnemy.x;
					this.target.y = nearestEnemy.y;
				} else if (this.aggro && this.lastUpdate + this.aggroLinger < time) {
					this.aggro = false;
				}
			}
		}

		if (this.aggro) {
			const tx = this.target.x;
			const ty = this.target.y;
			const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);

			if (totalDistance < this.attackRange * SCALE) {
				const time = this.scene.time;
				(this.scene as MainScene).abilityHelper.triggerAbility(
					this.stateObject,
					{
						...this.stateObject,
						x: this.x / SCALE,
						y: this.y / SCALE,
					},
					AbilityType.FIRE_NOVA,
					1,
					time.now
				);

				this.destroyed = true;
				setTimeout(() => {
					this.destroy();
				}, 100);
			} else {
				const xSpeed =
					((tx - this.x) / totalDistance) *
					this.stateObject.movementSpeed *
					this.stateObject.slowFactor;
				const ySpeed =
					((ty - this.y) / totalDistance) *
					this.stateObject.movementSpeed *
					this.stateObject.slowFactor;
				this.setVelocityX(xSpeed * SCALE);
				this.setVelocityY(ySpeed * SCALE);
				const newFacing = getFacing4Dir(xSpeed, ySpeed);
				const animation = updateMovingState(this.stateObject, true, newFacing);
				if (animation) {
					if (this.scene.game.anims.exists(animation)) {
						this.play({ key: animation, repeat: -1 });
					} else {
						console.log(`Animation ${animation} does not exist.`);
						this.play({ key: animation, repeat: -1 });
					}
				}
			}
		} else {
			this.setVelocityX(0);
			this.setVelocityY(0);
			const animation = updateMovingState(this.stateObject, false, this.stateObject.currentFacing);
			if (animation) {
				if (this.scene.game.anims.exists(animation)) {
					this.play(animation);
				} else {
					console.log(`Animation ${animation} does not exist.`);
					this.play(animation);
				}
			}
		}
	}

	die() {
		this.play('death_anim_small');
		this.on('animationcomplete', () => this.destroy());
	}

	// destroy the elemental
	destroy() {
		if (this.scene?.npcMap) {
			delete this.scene.npcMap[this.id];
		}
		super.destroy();
	}
}
