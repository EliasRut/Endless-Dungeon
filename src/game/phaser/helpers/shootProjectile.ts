import { AbilityData } from '../../../types/AbilityData';
import { AbilityType, SpreadData } from '../../../types/AbilityType';
import Character from '../../../types/Character';
import { ProjectileData } from '../../../types/ProjectileData';
import { PointOfOrigin } from '../../../types/SimplePointOfOrigin';
import AbilityEffect from '../drawables/effects/AbilityEffect';
import TargetingEffect from '../drawables/effects/TargetingEffect';
import TrailingParticleProjectileEffect from '../drawables/effects/TrailingParticleProjectileEffect';
import CharacterToken from '../drawables/tokens/CharacterToken';
import MainScene from '../scenes/MainScene';
import { Faction, PossibleTargets, SCALE } from './constants';
import { getFacing8Dir } from './movement';

export const shootProjectile = (
	abilityData: AbilityData,
	pointOfOrigin: PointOfOrigin,
	projectileData: ProjectileData | undefined,
	projectileIndex: number,
	numProjectiles: number,
	facingRotation: number,
	scene: MainScene,
	caster: Character,
	abilityLevel: number,
	globalTime: number,
	abilityEffects: AbilityEffect[],
	triggerAbility: (
		caster: Character,
		pointOfOrigin: PointOfOrigin,
		type: AbilityType,
		abilityLevel: number,
		globalTime: number,
		comboCast: number,
		abilityData?: AbilityData
	) => void
) => {
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
	if (abilityData.useExactTargetVector && usedPointOfOrigin.exactTargetXFactor !== undefined) {
		xMultiplier = usedPointOfOrigin.exactTargetXFactor;
	}
	if (abilityData.useExactTargetVector && usedPointOfOrigin.exactTargetYFactor !== undefined) {
		yMultiplier = usedPointOfOrigin.exactTargetYFactor;
	}
	const effect = new (projectileData!.effect || TrailingParticleProjectileEffect)(
		scene,
		usedPointOfOrigin.x +
			(usedPointOfOrigin.width || 0) / 2 +
			xMultiplier * projectileData!.xOffset,
		usedPointOfOrigin.y +
			(usedPointOfOrigin.height || 0) / 2 +
			yMultiplier * projectileData!.yOffset,
		abilityData.spriteName || '',
		getFacing8Dir(xMultiplier, yMultiplier),
		projectileData
	);
	if (projectileData?.targeting) {
		(effect as TargetingEffect).allowedTargets = projectileData.inverseAllowedTargets
			? caster.faction === Faction.PLAYER || caster.faction === Faction.ALLIES
				? PossibleTargets.PLAYER
				: PossibleTargets.ENEMIES
			: caster.faction === Faction.PLAYER || caster.faction === Faction.ALLIES
			? PossibleTargets.ENEMIES
			: PossibleTargets.PLAYER;
	}
	effect.setVelocity(xMultiplier * SCALE, yMultiplier * SCALE);
	effect.setMaxVelocity(projectileData!.velocity * SCALE);
	effect.body!.velocity.scale(projectileData!.velocity);

	effect.setDrag(
		(projectileData!.drag || 0) * SCALE * Math.abs(xMultiplier),
		(projectileData!.drag || 0) * SCALE * Math.abs(yMultiplier)
	);

	effect.setDebug(true, true, 0xffff00);

	scene.physics.add.collider(effect, scene.tileLayer!, () => {
		if (projectileData!.destroyOnWallContact) {
			effect.destroy();
		}
		if (projectileData?.collisionSound) {
			scene.sound.play(projectileData.collisionSound!, {
				volume: projectileData.sfxVolume!,
			});
		}
	});
	scene.physics.add.collider(effect, scene.decorationLayer!, () => {
		if (projectileData!.destroyOnWallContact) {
			effect.destroy();
		}
		if (projectileData?.collisionSound) {
			scene.sound.play(projectileData.collisionSound!, {
				volume: projectileData.sfxVolume!,
			});
		}
	});
	scene.physics.add.collider(effect, Object.values(scene.doorMap), () => {
		if (projectileData!.destroyOnWallContact) {
			effect.destroy();
		}
		if (projectileData?.collisionSound) {
			scene.sound.play(projectileData.collisionSound!, {
				volume: projectileData.sfxVolume!,
			});
		}
	});

	const enemyNpcs = Object.values(scene.npcMap).filter((npc) => npc.faction === Faction.ENEMIES);
	const friendlyNpcs: CharacterToken[] = [
		scene.mainCharacter!,
		...(scene.follower ? [scene.follower] : []),
	];
	const targetTokens: CharacterToken[] = projectileData?.inverseAllowedTargets
		? caster.faction === Faction.PLAYER || caster.faction === Faction.ALLIES
			? friendlyNpcs
			: enemyNpcs
		: caster.faction === Faction.PLAYER || caster.faction === Faction.ALLIES
		? enemyNpcs
		: friendlyNpcs;
	const collidingCallback = (collidingEffect: AbilityEffect, enemy: CharacterToken) => {
		if (collidingEffect.hitEnemyTokens.includes(enemy)) {
			return;
		}
		collidingEffect.onCollisionWithEnemy(enemy);
		if (projectileData!.destroyOnEnemyContact) {
			collidingEffect.destroy();
		}
		effect.hitEnemyTokens.push(enemy);
		const prevHealth = enemy.stateObject.health;

		if (abilityData.damageMultiplier) {
			const damage = caster.damage * abilityData.damageMultiplier * abilityLevel;
			enemy.takeDamage(damage);
			if (abilityData.castOnEnemyHit) {
				const enemyStateObject = { ...enemy.stateObject };
				triggerAbility(
					caster,
					enemyStateObject,
					abilityData.castOnEnemyHit!,
					caster.level,
					globalTime,
					1
				);
			}
		}
		if (abilityData.healingMultiplier) {
			const healing = caster.damage * abilityData.healingMultiplier * abilityLevel;
			enemy.healDamage(healing);
		}
		if (prevHealth > 0 && enemy.stateObject.health <= 0) {
			// Enemy died from this attack
			if (abilityData.castOnEnemyDestroyed) {
				const enemyStateObject = { ...enemy.stateObject };
				triggerAbility(
					caster,
					enemyStateObject,
					abilityData.castOnEnemyDestroyed!,
					caster.level,
					globalTime,
					1
				);
			}
		}
		if (abilityData.stun) {
			enemy.receiveStun(abilityData.stun!);
		}

		if (abilityData.damageMultiplier) {
			enemy.receiveHit();
		}
		if (abilityData.healingMultiplier) {
			enemy.receiveHealing();
		}
		if (abilityData.necroticStacks) {
			enemy.lastNecroticEffectTimestamp = globalTime;
			enemy.necroticEffectStacks += abilityData.necroticStacks!;
		}
		if (abilityData.iceStacks) {
			enemy.lastIceEffectTimestamp = globalTime;
			enemy.iceEffectStacks += abilityData.iceStacks!;
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
			scene.sound.play(projectileData.collisionSound!, {
				volume: projectileData.sfxVolume!,
			});
		}
	};
	if (!projectileData?.passThroughEnemies) {
		scene.physics.add.collider(effect, targetTokens!, collidingCallback as any);
	} else {
		scene.physics.add.overlap(effect, targetTokens!, collidingCallback as any);
	}

	abilityEffects.push(effect);
};
