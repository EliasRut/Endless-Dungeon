import { AbilityType, ProjectileData } from '../../abilities/abilityData';
import {
	AbilityKey,
	Facings,
	Faction,
	PossibleTargets,
	SCALE,
	SUMMONING_TYPE,
	VISITED_TILE_TINT,
} from '../../helpers/constants';
import MainScene from '../../scenes/MainScene';
import globalState from '../../worldstate';
import { updateAbility } from '../../worldstate/PlayerCharacter';
import CharacterToken from '../tokens/CharacterToken';
import AbilityEffect from './AbilityEffect';
import {
	getFacing4Dir,
	getOneLetterFacingName,
	shiftFacingByOneClockwise,
} from '../../helpers/movement';
import { NORMAL_ANIMATION_FRAME_RATE } from '../../helpers/constants';

const CIRCELING_TIME_MS = 500;
const SPRITE_SCALE = 0.3;

export default class CircelingEffect extends AbilityEffect {
	declare scene: MainScene;
	lastCast: number;
	emitter?: Phaser.GameObjects.Particles.ParticleEmitter;
	allowedTargets: PossibleTargets = PossibleTargets.NONE;
	summoningType: SUMMONING_TYPE;
	circelingAbility: AbilityType;
	summoningAbility: AbilityType;
	attackAbility: AbilityType;
	id: string;
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		spriteName: string,
		facing: Facings,
		projectileData: ProjectileData,
		summoningType: SUMMONING_TYPE,
		circelingAbility: AbilityType,
		summoningAbility: AbilityType,
		attackAbility: AbilityType
	) {
		super(scene, x, y, spriteName, facing, projectileData);
		this.summoningType = summoningType;
		this.circelingAbility = circelingAbility;
		this.attackAbility = attackAbility;
		this.summoningAbility = summoningAbility;
		this.id = `${Math.round((Math.random() * 2) ^ 16)}`;
		this.lastCast = -Infinity;
		scene.add.existing(this);
		this.setDepth(1);
		scene.physics.add.existing(this);
		this.body!.checkCollision.none = true;
		this.setScale(SCALE * (summoningType === SUMMONING_TYPE.FIRE_ELEMENTAL ? 1 : SPRITE_SCALE));

		// Clean up players active summons
		const identicalSummons = globalState.playerCharacter.activeSummons.map((summon) => {
			const effect = this.scene.abilityHelper!.abilityEffects.find((ability) => {
				(ability as any).id === summon.id;
			});
			return effect;
		});
		identicalSummons.forEach((summon) => {
			if (summon) {
				summon.destroy();
			}
		});
		globalState.playerCharacter.activeSummons.push({
			summoningType: this.summoningType,
			id: this.id,
		});
		updateAbility(
			scene as MainScene,
			globalState.playerCharacter,
			AbilityKey.TWO,
			summoningAbility
		);
	}

	destroy() {
		super.destroy();
		globalState.playerCharacter.activeSummons = globalState.playerCharacter.activeSummons.filter(
			(effect) => effect.id !== this.id
		);
	}

	update(time: number) {
		const activeAbilityTwo = globalState.playerCharacter.abilityKeyMapping[AbilityKey.TWO];
		if (activeAbilityTwo !== this.summoningAbility) {
			if (activeAbilityTwo === this.circelingAbility) {
				updateAbility(
					this.scene as MainScene,
					globalState.playerCharacter,
					AbilityKey.TWO,
					this.summoningAbility
				);
			} else {
				this.destroy();
				return;
			}
		}

		const xOffset = Math.sin(time / CIRCELING_TIME_MS) * 36;
		const yOffset = Math.cos(time / CIRCELING_TIME_MS) * 36;
		this.x = globalState.playerCharacter.x * SCALE + xOffset * SCALE;
		this.y = globalState.playerCharacter.y * SCALE + yOffset * SCALE;

		let nearestEnemy: CharacterToken | undefined;
		let closestDistance = Infinity;
		if (this.allowedTargets === PossibleTargets.ENEMIES) {
			const potentialEnemies = Object.values((this.scene as MainScene).npcMap).filter(
				(npc) =>
					npc.faction === Faction.ENEMIES &&
					npc.tintBottomLeft > VISITED_TILE_TINT &&
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

		let facingX = xOffset;
		let facingY = yOffset;

		if (nearestEnemy) {
			const tx = nearestEnemy.x;
			const ty = nearestEnemy.y;

			const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
			const xFactor = (tx - this.x) / totalDistance;
			const yFactor = (ty - this.y) / totalDistance;
			facingX = tx - this.x;
			facingY = ty - this.y;

			if (time - this.lastCast > 1000) {
				this.lastCast = time;
				this.scene.abilityHelper!.triggerAbility(
					globalState.playerCharacter,
					{
						...globalState.playerCharacter,
						x: globalState.playerCharacter.x + xOffset,
						y: globalState.playerCharacter.y + yOffset,
						exactTargetXFactor: xFactor,
						exactTargetYFactor: yFactor,
					},
					this.attackAbility,
					1,
					time,
					1
				);
			}
		}
		let newFacing = getFacing4Dir(facingX, facingY);
		// If there is no enemy, the elemental should follow it's clockwise path around the player
		if (!nearestEnemy) {
			newFacing = shiftFacingByOneClockwise(newFacing);
		}
		if (newFacing !== this.facing) {
			if (this.summoningType === SUMMONING_TYPE.FIRE_ELEMENTAL) {
				this.play({
					key: `firesprite-walk-${getOneLetterFacingName(newFacing)}`,
					frameRate: NORMAL_ANIMATION_FRAME_RATE,
					repeat: -1,
				});
			} else {
				this.setScale(SCALE * 0.3 * (0.9 + Math.sin(time / 200) * 0.1));
			}
			this.facing = newFacing;
		}
	}
}
