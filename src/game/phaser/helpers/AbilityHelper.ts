import { getRelevantAbilityVersion } from './getRelevantAbilityVersion';
import AbilityEffect from '../drawables/effects/AbilityEffect';
import MainScene from '../scenes/MainScene';
import worldState from '../worldState';
import Character from '../../../types/Character';
import { getRotationInRadiansForFacing } from './movement';
import { CASTING_SPEED_MS } from '../scenes/MainScene';
import { AbilityType } from '../../../types/AbilityType';
import { AbilityData } from '../../../types/AbilityData';
import { ProjectileData } from '../../../types/ProjectileData';
import { PointOfOrigin } from '../../../types/SimplePointOfOrigin';
import { shootProjectile } from './shootProjectile';
import { handleDash } from './handleDash';

export default class AbilityHelper {
	scene: MainScene;
	abilityEffects: AbilityEffect[] = [];
	abilities: AbilityEffect[] = [];

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
		const usedAbilityData: AbilityData =
			abilityData || getRelevantAbilityVersion(type, abilityLevel, comboCast);
		const projectileData: ProjectileData | undefined = usedAbilityData.projectileData;
		// Since we're allowing projectiles to have a spread, we'll be using radians for easier math
		const facingRotation = getRotationInRadiansForFacing(pointOfOrigin.currentFacing);
		const numProjectiles = usedAbilityData.projectiles || 0;

		// Go through all projectiles the ability should launch
		for (let i = 0; i < numProjectiles; i++) {
			// If the ability uses time delayed casting, use a timeout for each of them
			if (usedAbilityData.delayProjectiles || projectileData?.delay) {
				setTimeout(
					() =>
						shootProjectile(
							usedAbilityData,
							pointOfOrigin,
							projectileData,
							i,
							numProjectiles,
							facingRotation,
							this.scene,
							caster,
							abilityLevel,
							globalTime,
							this.abilityEffects,
							this.triggerAbility.bind(this)
						),
					(usedAbilityData.delayProjectiles || 0) + i * (projectileData?.delay || 0)
				);
			} else {
				// If not, we can cast them immediately
				shootProjectile(
					usedAbilityData,
					pointOfOrigin,
					projectileData,
					i,
					numProjectiles,
					facingRotation,
					this.scene,
					caster,
					abilityLevel,
					globalTime,
					this.abilityEffects,
					this.triggerAbility.bind(this)
				);
			}
		}

		// If the ability has a dash, handle it
		if (usedAbilityData.dashSpeed && usedAbilityData.dashDuration) {
			handleDash(this.scene, caster, usedAbilityData);
		}

		// If the ability has a reverse dash, handle it
		if (usedAbilityData.reverseDash) {
			worldState.playerCharacter.reverseDashDirectionTime = globalTime;
		}

		// If the ability has a cast effect, create it
		if (usedAbilityData.castEffect) {
			const effect = new usedAbilityData.castEffect(
				this.scene,
				pointOfOrigin.x,
				pointOfOrigin.y,
				usedAbilityData.spriteName || '',
				pointOfOrigin.currentFacing,
				projectileData,
				{
					damage: caster.damage * (usedAbilityData.damageMultiplier || 0) * abilityLevel,
					caster,
					abilityLevel,
				}
			);
			this.abilityEffects.push(effect);
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
				worldState.playerCharacter.comboCast
			);
			const castingTime = relevantAbility?.castingTime || CASTING_SPEED_MS;
			worldState.playerCharacter.lastComboCast = worldState.playerCharacter.comboCast;
			setTimeout(() => {
				this.triggerAbility(
					worldState.playerCharacter,
					{
						...worldState.playerCharacter,
						getUpdatedData: () => worldState.playerCharacter,
					},
					ability,
					abilityLevel,
					time,
					worldState.playerCharacter.comboCast
				);
				if (relevantAbility.resetComboCast) {
					worldState.playerCharacter.comboCast = 1;
				} else if (relevantAbility.increaseComboCast) {
					worldState.playerCharacter.comboCast++;
					worldState.playerCharacter.lastComboCastTime = time;
				}
			}, castingTime * 0.67);
			this.scene.keyboardHelper!.lastCastingDuration = castingTime;
		});

		this.abilityEffects = this.abilityEffects.filter((effect) => !effect.destroyed);
		this.abilityEffects.forEach((effect) => {
			effect.update(time);
		});
	}
}
