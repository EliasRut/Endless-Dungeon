import { Abilities, AbilityType, SpreadData } from '../abilities/abilityData';
import AbilityEffect from '../drawables/effects/AbilityEffect';
import CharacterToken from '../drawables/tokens/CharacterToken';
import EnemyToken from '../drawables/tokens/EnemyToken';
import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import Character from '../worldstate/Character';
import { Faction, PossibleTargets } from './constants';
import { getFacing8Dir, getRotationInRadiansForFacing } from './movement';
import TargetingEffect from '../drawables/effects/TargetingEffect';

export default class AbilityHelper {
	scene: MainScene;
	abilityEffects: AbilityEffect[] = [];
	abilities: AbilityEffect[];

	constructor(scene: MainScene) {
		this.scene = scene;
	}

	triggerAbility(origin: Character, type: AbilityType, globalTime: number) {
		// We allow for multiple projectiles per ability.
		// Let's get the data for ability projectiles first.
		const projectileData = Abilities[type].projectileData;
		// Since we're allowing projectiles to have a spread, we'll be using radians for easier math
		const facingRotation = getRotationInRadiansForFacing(origin.currentFacing);
		const numProjectiles = Abilities[type].projectiles || 0;
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
			const yMultiplier = -Math.cos(currentSpread * Math.PI + facingRotation);
			const xMultiplier = Math.sin(currentSpread * Math.PI + facingRotation);
			const effect = new projectileData!.effect(
				this.scene,
				origin.x + xMultiplier * projectileData!.xOffset,
				origin.y + yMultiplier * projectileData!.yOffset,
				'',
				getFacing8Dir(xMultiplier, yMultiplier),
				projectileData
			);
			if (projectileData?.targeting) {
				(effect as TargetingEffect).allowedTargets =
					origin.faction === Faction.PLAYER ? PossibleTargets.ENEMIES : PossibleTargets.PLAYER;
			}
			effect.setVelocity(xMultiplier, yMultiplier);
			effect.setMaxVelocity(projectileData!.velocity);
			effect.body.velocity.scale(projectileData!.velocity);

			effect.setDrag(
				(projectileData!.drag || 0) * Math.abs(xMultiplier),
				(projectileData!.drag || 0) * Math.abs(yMultiplier)
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

			const targetTokens =
				origin.faction === Faction.PLAYER
					? Object.values(this.scene.npcMap).filter((npc) => npc.faction === Faction.ENEMIES)
					: this.scene.mainCharacter;
			const collidingCallback = (collidingEffect: AbilityEffect, enemy: CharacterToken) => {
				if (collidingEffect.hitEnemyTokens.includes(enemy)) {
					return;
				}
				collidingEffect.onCollisionWithEnemy(enemy);
				if (projectileData!.destroyOnEnemyContact) {
					collidingEffect.destroy();
				}
				effect.hitEnemyTokens.push(enemy);
				enemy.stateObject.health -= origin.damage * Abilities[type].damageMultiplier;
				if (Abilities[type].stun) {
					stun(globalTime, Abilities[type].stun!, enemy.stateObject);
				}
				if (Abilities[type].necroticStacks) {
					enemy.lastNecroticEffectTimestamp = globalTime;
					enemy.necroticEffectStacks += Abilities[type].necroticStacks!;
				}
				if (Abilities[type].iceStacks) {
					enemy.lastIceEffectTimestamp = globalTime;
					enemy.iceEffectStacks += Abilities[type].iceStacks!;
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
		if (Abilities[type].sound) {
			this.scene.sound.play(Abilities[type].sound!, { volume: Abilities[type].sfxVolume! });
		}
	}
	update(time: number, castAbilities: AbilityType[]) {
		castAbilities.forEach((ability) => {
			this.triggerAbility(globalState.playerCharacter, ability, time);
		});

		this.abilityEffects = this.abilityEffects.filter((effect) => !effect.destroyed);
		this.abilityEffects.forEach((effect) => {
			effect.update(time);
		});
	}
}
export const stun = (time: number, duration: number, character: Character) => {
	if (character.stunnedAt + character.stunDuration + 1000 > time) return;
	character.stunned = true;
	character.stunnedAt = time;
	character.stunDuration = duration;
};
