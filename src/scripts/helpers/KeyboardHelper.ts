import { Abilities, AbilityType } from '../abilities/abilityData';
import globalState from '../worldstate';
import { AbilityKey } from './constants';
import BackpackIcon from '../drawables/ui/BackpackIcon';

const AXIS_MOVEMENT_THRESHOLD = 0.4;

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

	gamepad: Phaser.Input.Gamepad.Gamepad |undefined;

	isMoveUpPressed: () => boolean;
	isMoveDownPressed: () => boolean;
	isMoveLeftPressed: () => boolean;
	isMoveRightPressed: () => boolean;
	isAbility1Pressed: () => boolean;
	isAbility2Pressed: () => boolean;
	isAbility3Pressed: () => boolean;
	isAbility4Pressed: () => boolean;

	scene: Phaser.Scene;

	constructor (scene: Phaser.Scene) {
		this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.kKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

		this.scene = scene;
		this.isMoveUpPressed = () => {
			if (this.upKey.isDown) {
				return true;
			}
			const axis = this.gamepad?.axes[1];
			const axisValue = axis ? axis.getValue() : 0;
			return !!this.gamepad?.up || axisValue < -AXIS_MOVEMENT_THRESHOLD;
		};
		this.isMoveDownPressed = () => {
			if (this.downKey.isDown) {
				return true;
			}
			const axis = this.gamepad?.axes[1];
			const axisValue = axis ? axis.getValue() : 0;
			return !!this.gamepad?.down || axisValue > AXIS_MOVEMENT_THRESHOLD;
		};
		this.isMoveLeftPressed = () => {
			if (this.leftKey.isDown) {
				return true;
			}
			const axis = this.gamepad?.axes[0];
			const axisValue = axis ? axis.getValue() : 0;
			return !!this.gamepad?.left || axisValue < -AXIS_MOVEMENT_THRESHOLD;
		};
		this.isMoveRightPressed = () => {
			if (this.rightKey.isDown) {
				return true;
			}
			const axis = this.gamepad?.axes[0];
			const axisValue = axis ? axis.getValue() : 0;
			return !!this.gamepad?.right || axisValue > AXIS_MOVEMENT_THRESHOLD;
		};

		this.abilityKey1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
		this.abilityKey2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		this.abilityKey3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
		this.abilityKey4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);

		this.isAbility1Pressed = () => {
			if (this.abilityKey1.isDown) {
				return true;
			}
			return !!this.gamepad?.isButtonDown(0);
		};

		this.isAbility2Pressed = () => {
			if (this.abilityKey2.isDown) {
				return true;
			}
			return !!this.gamepad?.isButtonDown(1);
		};

		this.isAbility3Pressed = () => {
			if (this.abilityKey3.isDown) {
				return true;
			}
			return !!this.gamepad?.isButtonDown(2);
		};

		this.isAbility4Pressed = () => {
			if (this.abilityKey4.isDown) {
				return true;
			}
			return !!this.gamepad?.isButtonDown(3);
		};
	}

	getCharacterFacing() {
		let yFacing = 0;
		let xFacing = 0;

		this.gamepad = this.scene.input.gamepad?.getPad(0);

		if (this.isMoveUpPressed()) {
			yFacing = -1;
		} else if (this.isMoveDownPressed()) {
			yFacing = 1;
		}

		if (this.isMoveLeftPressed()) {
			xFacing = -1;
		} else if (this.isMoveRightPressed()) {
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

	getRelevantEvalFunctionForEnum(abilityKey: AbilityKey) {
		switch (abilityKey) {
			case AbilityKey.ONE: return this.isAbility1Pressed;
			case AbilityKey.TWO: return this.isAbility2Pressed;
			case AbilityKey.THREE: return this.isAbility3Pressed;
			case AbilityKey.FOUR: return this.isAbility4Pressed;
			default:
				throw new Error(`No Ability Key mapping for key ${abilityKey}.`);
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
		const relevantFunction = this.getRelevantEvalFunctionForEnum(abilityKey);
		if (!relevantFunction()) {
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