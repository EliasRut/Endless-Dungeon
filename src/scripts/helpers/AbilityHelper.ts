import { Abilities, AbilityType } from '../abilities/abilityData';
import AbilityEffect from '../drawables/effects/AbilityEffect';
import CharacterToken from '../drawables/tokens/CharacterToken';
import EnemyToken from '../drawables/tokens/EnemyToken';
import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import Character from '../worldstate/Character';
import { Faction } from './constants';
import { getRotationInRadiansForFacing } from './orientation';

export default class AbilityHelper {
	scene: MainScene;
	abilityEffects: AbilityEffect[] = [];
	abilities: AbilityEffect[];

	constructor (scene: MainScene) {
		this.scene = scene;
	}

	triggerAbility(origin: Character, type: AbilityType) {
		// We allow for multiple projectiles per ability.
		// Let's get the data for ability projectiles first.
		const projectileData = Abilities[type].projectileData;
		// Since we're allowing projectiles to have a spread, we'll be using radians for easier math
		const facingRotation = getRotationInRadiansForFacing(origin.currentFacing);
		const numProjectiles =  (Abilities[type].projectiles || 0);
		const fireProjectile = (projectileIndex: number) => {
			// Spread multiple projectiles over an arc on a circle
			const spread = projectileData?.spread ? projectileData!.spread : [0, 0];
			// The total arc we want to cover
			const spreadDistance = spread[1] - spread[0];
			// The current point in the arc we are at
			const currentSpread = spread[0] + spreadDistance * (projectileIndex / numProjectiles);
			// We want to combine the arc position with the characters facing to allow cone-like effects
			const yMultiplier = -Math.cos(currentSpread * Math.PI + facingRotation);
			const xMultiplier = Math.sin(currentSpread * Math.PI + facingRotation);
			const effect = new projectileData!.effect(
				this.scene,
				origin.x + xMultiplier * projectileData!.xOffset,
				origin.y + yMultiplier * projectileData!.yOffset,
				'',
				origin.currentFacing
			);
			effect.setVelocity(xMultiplier, yMultiplier);
			effect.body.velocity.scale(projectileData!.velocity);

			effect.setDrag(projectileData!.drag || 0);

			this.scene.physics.add.collider(effect, this.scene.tileLayer, () => {
				effect.destroy();
				if (projectileData?.collisionSound) {
					this.scene.sound.play(projectileData.collisionSound!, {volume: projectileData.sfxVolume!});
				}
			});

			const targetTokens = origin.faction === Faction.PLAYER ?
				this.scene.enemy :
				this.scene.mainCharacter;
			this.scene.physics.add.collider(effect, targetTokens, (collidingEffect, target) => {
				collidingEffect.destroy();
				const enemy = target as CharacterToken;
				enemy.stateObject.health -= origin.damage;
				if (projectileData?.collisionSound) {
					this.scene.sound.play(projectileData.collisionSound!, {volume: projectileData.sfxVolume!});
				}
			});
			this.abilityEffects.push(effect);
		};
		// Go through all projectiles the ability should launch
		for (let i = 0; i < numProjectiles; i++) {
			// If the ability uses time delayed casting, use a timeout for each of them
			if (projectileData?.delay) {
				setTimeout(() => fireProjectile(i), i * projectileData.delay);
			} else { // If not, we can cast them immediately
				fireProjectile(i);
			}
		}
		// We just want to play the ability sound once, not once for each projectile
		if (Abilities[type].sound) {
			this.scene.sound.play(Abilities[type].sound!, {volume: Abilities[type].sfxVolume!});
		}
	}

	update(castAbilities: AbilityType[]) {
		castAbilities.forEach((ability) => {
			this.triggerAbility(globalState.playerCharacter, ability);
		});

		this.abilityEffects = this.abilityEffects.filter(
			(effect) => !effect.destroyed
		);
		this.abilityEffects.forEach((effect) => {
			effect.update();
		});
	}
}