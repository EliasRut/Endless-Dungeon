import {
	Abilities,
	AbilityData,
	AbilityType,
	SpreadData,
	getRelevantAbilityVersion,
} from '../abilities/abilityData';
import AbilityEffect from '../drawables/effects/AbilityEffect';
import CharacterToken from '../drawables/tokens/CharacterToken';
import EnemyToken from '../drawables/tokens/EnemyToken';
import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import MainScene from '../scenes/MainScene';
import globalState, { WorldState } from '../worldstate';
import Character from '../worldstate/Character';
import { Facings, Faction, PossibleTargets, SCALE } from './constants';
import { getFacing8Dir, getRotationInRadiansForFacing, getVelocitiesForFacing } from './movement';
import TargetingEffect from '../drawables/effects/TargetingEffect';
import Enemy from '../worldstate/Enemy';
import TrailingParticleProjectileEffect from '../drawables/effects/TrailingParticleProjectileEffect';
import { CASTING_SPEED_MS } from '../scenes/MainScene';

export interface SimplePointOfOrigin {
	currentFacing: Facings;
	x: number;
	y: number;
	exactTargetXFactor?: number;
	exactTargetYFactor?: number;
	width?: number;
	height?: number;
}

export interface PointOfOrigin extends SimplePointOfOrigin {
	getUpdatedData?: () => SimplePointOfOrigin;
}

export default class AbilityHelper {
	scene: MainScene;
	abilityEffects: AbilityEffect[] = [];
	abilities: AbilityEffect[];

	constructor(scene: MainScene) {
		this.scene = scene;
	}

	triggerAbility(
		caster: Character,
		pointOfOrigin: PointOfOrigin,
		type: AbilityType,
		abilityLevel: number,
		globalTime: number,
		comboCast: number,
		abilityData?: AbilityData
	) {
		// We allow for multiple projectiles per ability.
		// Let's get the data for ability projectiles first.
		const usedAbilityData = abilityData || getRelevantAbilityVersion(type, abilityLevel, comboCast);
		const projectileData = usedAbilityData.projectileData;
		// Since we're allowing projectiles to have a spread, we'll be using radians for easier math
		const facingRotation = getRotationInRadiansForFacing(pointOfOrigin.currentFacing);
		const numProjectiles = usedAbilityData.projectiles || 0;
		const fireProjectile = (projectileIndex: number) => {
			const usedPointOfOrigin = pointOfOrigin.getUpdatedData
				? pointOfOrigin.getUpdatedData()
				: pointOfOrigin;
			// Spread multiple projectiles over an arc on a circle
			const spread: SpreadData = projectileData?.spread ? projectileData!.spread : [0, 0];
			// The total arc we want to cover
			const spreadDistance = spread[1] - spread[0];
			let currentSpread: number;
			if (spread[2]) {
				currentSpread =
					spread[0] + spread[2](projectileIndex / (numProjectiles - 1 || 1)) * spreadDistance;
			} else {
				currentSpread = spread[0] + spreadDistance * (projectileIndex / (numProjectiles - 1 || 1));
			}
			// We want to combine the arc position with the characters facing to allow cone-like effects
			let yMultiplier = -Math.cos(currentSpread * Math.PI + facingRotation);
			let xMultiplier = Math.sin(currentSpread * Math.PI + facingRotation);
			if (
				usedAbilityData.useExactTargetVector &&
				usedPointOfOrigin.exactTargetXFactor !== undefined
			) {
				xMultiplier = usedPointOfOrigin.exactTargetXFactor;
			}
			if (
				usedAbilityData.useExactTargetVector &&
				usedPointOfOrigin.exactTargetYFactor !== undefined
			) {
				yMultiplier = usedPointOfOrigin.exactTargetYFactor;
			}
			const effect = new (projectileData!.effect || TrailingParticleProjectileEffect)(
				this.scene,
				usedPointOfOrigin.x +
					(usedPointOfOrigin.width || 0) / 2 +
					xMultiplier * projectileData!.xOffset,
				usedPointOfOrigin.y +
					(usedPointOfOrigin.height || 0) / 2 +
					yMultiplier * projectileData!.yOffset,
				usedAbilityData.spriteName || '',
				getFacing8Dir(xMultiplier, yMultiplier),
				projectileData
			);
			if (projectileData?.targeting) {
				(effect as TargetingEffect).allowedTargets =
					caster.faction === Faction.PLAYER || caster.faction === Faction.ALLIES
						? PossibleTargets.ENEMIES
						: PossibleTargets.PLAYER;
			}
			effect.setVelocity(xMultiplier * SCALE, yMultiplier * SCALE);
			effect.setMaxVelocity(projectileData!.velocity * SCALE);
			effect.body.velocity.scale(projectileData!.velocity);

			effect.setDrag(
				(projectileData!.drag || 0) * SCALE * Math.abs(xMultiplier),
				(projectileData!.drag || 0) * SCALE * Math.abs(yMultiplier)
			);

			effect.setDebug(true, true, 0xffff00);

			this.scene.physics.add.collider(effect, this.scene.tileLayer, () => {
				if (projectileData!.destroyOnWallContact) {
					effect.destroy();
				}
				if (projectileData?.collisionSound) {
					this.scene.sound.play(projectileData.collisionSound!, {
						volume: projectileData.sfxVolume!,
					});
				}
			});
			this.scene.physics.add.collider(effect, this.scene.decorationLayer, () => {
				if (projectileData!.destroyOnWallContact) {
					effect.destroy();
				}
				if (projectileData?.collisionSound) {
					this.scene.sound.play(projectileData.collisionSound!, {
						volume: projectileData.sfxVolume!,
					});
				}
			});
			this.scene.physics.add.collider(effect, Object.values(this.scene.doorMap), () => {
				if (projectileData!.destroyOnWallContact) {
					effect.destroy();
				}
				if (projectileData?.collisionSound) {
					this.scene.sound.play(projectileData.collisionSound!, {
						volume: projectileData.sfxVolume!,
					});
				}
			});

			const targetTokens =
				caster.faction === Faction.PLAYER || caster.faction === Faction.ALLIES
					? Object.values(this.scene.npcMap).filter((npc) => npc.faction === Faction.ENEMIES)
					: [this.scene.mainCharacter, ...(this.scene.follower ? [this.scene.follower] : [])];
			const collidingCallback = (collidingEffect: AbilityEffect, enemy: CharacterToken) => {
				if (collidingEffect.hitEnemyTokens.includes(enemy)) {
					return;
				}
				collidingEffect.onCollisionWithEnemy(enemy);
				if (projectileData!.destroyOnEnemyContact) {
					collidingEffect.destroy();
				}
				effect.hitEnemyTokens.push(enemy);
				const damage = caster.damage * usedAbilityData.damageMultiplier * abilityLevel;
				const prevHealth = enemy.stateObject.health;
				enemy.takeDamage(damage);
				if (usedAbilityData.castOnEnemyHit) {
					const enemyStateObject = { ...enemy.stateObject };
					this.triggerAbility(
						caster,
						enemyStateObject,
						usedAbilityData.castOnEnemyHit!,
						caster.level,
						globalTime,
						1
					);
				}
				if (prevHealth > 0 && enemy.stateObject.health <= 0) {
					// Enemy died from this attack
					if (usedAbilityData.castOnEnemyDestroyed) {
						const enemyStateObject = { ...enemy.stateObject };
						this.triggerAbility(
							caster,
							enemyStateObject,
							usedAbilityData.castOnEnemyDestroyed!,
							caster.level,
							globalTime,
							1
						);
					}
				}
				if (usedAbilityData.stun) {
					enemy.receiveStun(usedAbilityData.stun!);
				}

				enemy.receiveHit();
				if (usedAbilityData.necroticStacks) {
					enemy.lastNecroticEffectTimestamp = globalTime;
					enemy.necroticEffectStacks += usedAbilityData.necroticStacks!;
				}
				if (usedAbilityData.iceStacks) {
					enemy.lastIceEffectTimestamp = globalTime;
					enemy.iceEffectStacks += usedAbilityData.iceStacks!;
				}
				if (projectileData?.knockback) {
					enemy.lastMovedTimestamp = globalTime;
					const angle = Phaser.Math.Angle.Between(effect.x, effect.y, enemy.x, enemy.y);
					enemy.setVelocity(
						Math.cos(angle) * projectileData.knockback,
						Math.sin(angle) * projectileData.knockback
					);
				}
				if (projectileData?.collisionSound) {
					this.scene.sound.play(projectileData.collisionSound!, {
						volume: projectileData.sfxVolume!,
					});
				}
			};
			if (!projectileData?.passThroughEnemies) {
				this.scene.physics.add.collider(effect, targetTokens, collidingCallback as any);
			} else {
				this.scene.physics.add.overlap(effect, targetTokens, collidingCallback as any);
			}
			this.abilityEffects.push(effect);
		};
		// Go through all projectiles the ability should launch
		for (let i = 0; i < numProjectiles; i++) {
			// If the ability uses time delayed casting, use a timeout for each of them
			if (usedAbilityData.delayProjectiles || projectileData?.delay) {
				setTimeout(
					() => fireProjectile(i),
					(usedAbilityData.delayProjectiles || 0) + i * (projectileData?.delay || 0)
				);
			} else {
				// If not, we can cast them immediately
				fireProjectile(i);
			}
		}
		if (usedAbilityData.dashSpeed && usedAbilityData.dashDuration) {
			const casterToken = this.scene.getTokenForStateObject(caster);
			if (casterToken) {
				const rotationFactors = getVelocitiesForFacing(caster.currentFacing);
				const velocity = casterToken.body.velocity;
				casterToken.setVelocity(
					usedAbilityData.dashSpeed * SCALE * rotationFactors.x,
					usedAbilityData.dashSpeed * SCALE * rotationFactors.y
				);
				if (usedAbilityData.dashInvulnerability) {
					casterToken.body.checkCollision.none = true;
					caster.dashing = true;
					casterToken.alpha = 0.2;
				}

				setTimeout(() => {
					casterToken.setVelocity(velocity.x, velocity.y);
					caster.dashing = false;
					casterToken.body.checkCollision.none = false;
					casterToken.alpha = 1;
				}, usedAbilityData.dashDuration);
			}
		}

		// We just want to play the ability sound once, not once for each projectile
		if (usedAbilityData.sound) {
			this.scene.sound.play(usedAbilityData.sound!, { volume: usedAbilityData.sfxVolume! });
		}
	}
	update(time: number, castAbilities: [AbilityType, number][]) {
		castAbilities.forEach(([ability, abilityLevel]) => {
			const relevantAbility = getRelevantAbilityVersion(
				ability,
				abilityLevel,
				globalState.playerCharacter.comboCast
			);
			const castingTime = relevantAbility?.castingTime || CASTING_SPEED_MS;
			globalState.playerCharacter.lastComboCast = globalState.playerCharacter.comboCast;
			setTimeout(() => {
				this.triggerAbility(
					globalState.playerCharacter,
					{
						...globalState.playerCharacter,
						getUpdatedData: () => globalState.playerCharacter,
					},
					ability,
					abilityLevel,
					time,
					globalState.playerCharacter.comboCast
				);
				if (relevantAbility.resetComboCast) {
					globalState.playerCharacter.comboCast = 1;
				} else if (relevantAbility.increaseComboCast) {
					globalState.playerCharacter.comboCast++;
					globalState.playerCharacter.lastComboCastTime = time;
				}
				console.log(`Current combo cast: ${globalState.playerCharacter.comboCast}`);
			}, castingTime * 0.67);
			this.scene.keyboardHelper.lastCastingDuration = castingTime;
		});

		this.abilityEffects = this.abilityEffects.filter((effect) => !effect.destroyed);
		this.abilityEffects.forEach((effect) => {
			effect.update(time);
		});
	}
}
