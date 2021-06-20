import { Abilities, AbilityType } from '../abilities/abilityData';
import globalState from '../worldstate';
import { AbilityKey } from './constants';
import BackpackIcon from '../drawables/ui/BackpackIcon';

export default class KeyboardHelper {
	upKey: Phaser.Input.Keyboard.Key;
	downKey: Phaser.Input.Keyboard.Key;
	leftKey: Phaser.Input.Keyboard.Key;
	rightKey: Phaser.Input.Keyboard.Key;
	kKey: Phaser.Input.Keyboard.Key;
	abilityKey1: Phaser.Input.Keyboard.Key;
	abilityKey2: Phaser.Input.Keyboard.Key;
	abilityKey3: Phaser.Input.Keyboard.Key;
	abilityKey4: Phaser.Input.Keyboard.Key;

	constructor (scene: Phaser.Scene) {
		this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.kKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

		this.abilityKey1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
		this.abilityKey2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		this.abilityKey3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
		this.abilityKey4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
	}

	getCharacterFacing() {
		let yFacing = 0;
		let xFacing = 0;

		if (this.upKey.isDown) {
			yFacing = -1;
		} else if (this.downKey.isDown) {
			yFacing = 1;
		}

		if (this.leftKey.isDown) {
			xFacing = -1;
		} else if (this.rightKey.isDown) {
			xFacing = 1;
		}

		return [xFacing, yFacing];
	}

	isKKeyPressed() {
		if (this.kKey.isDown) {
			return true;
		}
		return false;
	}

	getRelevantKeyForEnum(abilityKey: AbilityKey) {
		switch (abilityKey) {
			case AbilityKey.ONE: return this.abilityKey1;
			case AbilityKey.TWO: return this.abilityKey2;
			case AbilityKey.THREE: return this.abilityKey3;
			case AbilityKey.FOUR: return this.abilityKey4;
			case AbilityKey.FIVE: return this.abilityKey4;
		}
	}

	getCastedAbilities(gameTime: number) {
		return [
			this.castIfPressed(AbilityKey.ONE, gameTime),
			this.castIfPressed(AbilityKey.TWO, gameTime),
			this.castIfPressed(AbilityKey.THREE, gameTime),
			this.castIfPressed(AbilityKey.FOUR, gameTime),
		].filter((ability) => !!ability) as AbilityType[];
	}

	getAbilityCooldown(abilityKey: AbilityKey, gameTime: number) {
		const ability = globalState.playerCharacter.abilityKeyMapping[abilityKey] as AbilityType;
		const abilityData = Abilities[ability];
		const lastCasted = globalState.playerCharacter.abilityCastTime[abilityKey];
		const readyAt = lastCasted + (abilityData.cooldownMs || 0);
		if (readyAt <= gameTime) {
			return 1;
		}
		const timeEllapsed = gameTime - lastCasted;
		return timeEllapsed / (abilityData.cooldownMs || Infinity);
	}

	getMsSinceLastCast(gameTime: number) {
		const lastCast = [
			globalState.playerCharacter.abilityCastTime[AbilityKey.ONE],
			globalState.playerCharacter.abilityCastTime[AbilityKey.TWO],
			globalState.playerCharacter.abilityCastTime[AbilityKey.THREE],
			globalState.playerCharacter.abilityCastTime[AbilityKey.FOUR]
		].reduce((max, value) => Math.max(max, value), 0);
		
		return gameTime - lastCast;
	}

	getAbilityCooldowns(gameTime: number) {
		return [
			this.getAbilityCooldown(AbilityKey.ONE, gameTime),
			this.getAbilityCooldown(AbilityKey.TWO, gameTime),
			this.getAbilityCooldown(AbilityKey.THREE, gameTime),
			this.getAbilityCooldown(AbilityKey.FOUR, gameTime),
		];
	}

	castIfPressed(abilityKey: AbilityKey, gameTime: number) {
		const relevantKey = this.getRelevantKeyForEnum(abilityKey);
		if (!relevantKey.isDown) {
			return false;
		}
		const ability = globalState.playerCharacter.abilityKeyMapping[abilityKey] as AbilityType;
		const abilityData = Abilities[ability];
		const lastCasted = globalState.playerCharacter.abilityCastTime[abilityKey];
		const readyAt = lastCasted + (abilityData.cooldownMs || 0);
		if (readyAt > gameTime) {
			return false;
		}
		globalState.playerCharacter.abilityCastTime[abilityKey] = gameTime;
		return ability;
	}
}