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
import globalState from '../worldstate';
import Character from '../worldstate/Character';
import { Facings, Faction, PossibleTargets, SCALE } from './constants';
import { getFacing4Dir, getRotationInRadiansForFacing } from './movement';
import TargetingEffect from '../drawables/effects/TargetingEffect';
import Enemy from '../worldstate/Enemy';
import TrailingParticleProjectileEffect from '../drawables/effects/TrailingParticleProjectileEffect';
import { CASTING_SPEED_MS } from '../scenes/MainScene';

export default class AbilityHelper {
	scene: MainScene;
	abilityEffects: AbilityEffect[] = [];
	abilities: AbilityEffect[];

	constructor(scene: MainScene) {
		this.scene = scene;
	}

	triggerAbility(
		caster: Character,
		pointOfOrigin: {
			currentFacing: Facings;
			x: number;
			y: number;
			exactTargetXFactor?: number;
			exactTargetYFactor?: number;
			width?: number;
			height?: number;
		},
		type: AbilityType,
		abilityLevel: number,
		globalTime: number,
		abilityData?: AbilityData
	) {
		// We allow for multiple projectiles per ability.
		// Let's get the data for ability projectiles first.
		const usedAbilityData = abilityData || getRelevantAbilityVersion(type, abilityLevel);
		const projectileData = usedAbilityData.projectileData;
		// Since we're allowing projectiles to have a spread, we'll be using radians for easier math
		const facingRotation = getRotationInRadiansForFacing(pointOfOrigin.currentFacing);
		const numProjectiles = usedAbilityData.projectiles || 0;
		const fireProjectile = (projectileIndex: number) => {
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
			if (pointOfOrigin.exactTargetXFactor !== undefined) {
				xMultiplier = pointOfOrigin.exactTargetXFactor;
			}
			if (pointOfOrigin.exactTargetYFactor !== undefined) {
				yMultiplier = pointOfOrigin.exactTargetYFactor;
			}
			const effect = new (projectileData!.effect || TrailingParticleProjectileEffect)(
				this.scene,
				pointOfOrigin.x + (pointOfOrigin.width || 0) / 2 + xMultiplier * projectileData!.xOffset,
				pointOfOrigin.y + (pointOfOrigin.height || 0) / 2 + yMultiplier * projectileData!.yOffset,
				usedAbilityData.spriteName || '',
				getFacing4Dir(xMultiplier, yMultiplier),
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
				if (prevHealth > 0 && enemy.stateObject.health <= 0) {
					console.log(`Enemy died`);
					// Enemy died from this attack
					if (usedAbilityData.castOnEnemyDestroyed) {
						this.triggerAbility(
							caster,
							enemy.stateObject,
							usedAbilityData.castOnEnemyDestroyed!,
							abilityLevel,
							globalTime
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
			if (projectileData?.delay) {
				setTimeout(() => fireProjectile(i), i * projectileData.delay);
			} else {
				// If not, we can cast them immediately
				fireProjectile(i);
			}
		}
		// We just want to play the ability sound once, not once for each projectile
		if (usedAbilityData.sound) {
			this.scene.sound.play(usedAbilityData.sound!, { volume: usedAbilityData.sfxVolume! });
		}
	}
	update(time: number, castAbilities: [AbilityType, number][]) {
		castAbilities.forEach(([ability, abilityLevel]) => {
			const castingTime =
				getRelevantAbilityVersion(ability, abilityLevel).castingTime || CASTING_SPEED_MS;
			setTimeout(() => {
				this.triggerAbility(
					globalState.playerCharacter,
					globalState.playerCharacter,
					ability,
					abilityLevel,
					time
				);
			}, castingTime * 0.67);
			this.scene.keyboardHelper.lastCastingDuration = castingTime;
		});

		this.abilityEffects = this.abilityEffects.filter((effect) => !effect.destroyed);
		this.abilityEffects.forEach((effect) => {
			effect.update(time);
		});
	}
}
