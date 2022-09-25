import { Abilities, AbilityType, getRelevantAbilityVersion } from '../abilities/abilityData';
import globalState from '../worldstate';
import { AbilityKey } from './constants';
import MainScene, { CASTING_SPEED_MS } from '../scenes/MainScene';

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
	inventoryKey: Phaser.Input.Keyboard.Key;
	settingsKey: Phaser.Input.Keyboard.Key;
	questsKey: Phaser.Input.Keyboard.Key;
	enterKey: Phaser.Input.Keyboard.Key;
	spaceKey: Phaser.Input.Keyboard.Key;
	enchantKey: Phaser.Input.Keyboard.Key;

	wasEnterKeyPressed: boolean;

	abilityKeyPressed: { [key: number]: boolean } = {
		[AbilityKey.ONE]: false,
		[AbilityKey.TWO]: false,
		[AbilityKey.THREE]: false,
		[AbilityKey.FOUR]: false,
		[AbilityKey.FIVE]: false,
		[AbilityKey.SPACE]: false,
	};

	gamepad: Phaser.Input.Gamepad.Gamepad | undefined;

	lastCastingDuration: number = CASTING_SPEED_MS;

	isMoveUpPressed: () => boolean;
	isMoveDownPressed: () => boolean;
	isMoveLeftPressed: () => boolean;
	isMoveRightPressed: () => boolean;
	isAbility1Pressed: () => boolean;
	isAbility2Pressed: () => boolean;
	isAbility3Pressed: () => boolean;
	isAbility4Pressed: () => boolean;
	isInventoryPressed: () => boolean;
	isSettingsPressed: (overlayOpen: boolean) => boolean; // <= bool for gamepad: if overlay is open, B button is also classified as "settings pressed", i.e. modify button assignment based on Mainscene info
	isQuestsPressed: () => boolean;
	isEnterPressed: () => boolean;
	isSpacePressed: () => boolean;
	isEnchantPressed: () => boolean;

	scene: Phaser.Scene;

	constructor(scene: Phaser.Scene) {
		this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
		this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.kKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
		this.inventoryKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
		this.settingsKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
		this.questsKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		this.enterKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
		this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		this.enchantKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
		this.wasEnterKeyPressed = false;

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
		this.isEnterPressed = () => {
			if (this.enterKey.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.A;
			} catch (err) {
				return false;
			}
		};
		this.isInventoryPressed = () => {
			if (this.inventoryKey.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.isButtonDown(9);
			} catch (err) {
				return false;
			}
		};
		this.isSettingsPressed = (overlayOpen: boolean) => {
			if (this.settingsKey.isDown) {
				return true;
			}
			try {
				if (overlayOpen) {
					const eitherPressed = !!this.gamepad?.isButtonDown(8) || !!this.gamepad?.B;
					return eitherPressed;
				} else return !!this.gamepad?.isButtonDown(8);
			} catch (err) {
				return false;
			}
		};
		this.isQuestsPressed = () => {
			if (this.questsKey.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.isButtonDown(10);
			} catch (err) {
				return false;
			}
		};
		this.isEnchantPressed = () => {
			if (this.enchantKey.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.isButtonDown(11);
			} catch (err) {
				return false;
			}
		};

		this.abilityKey1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
		this.abilityKey2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		this.abilityKey3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
		this.abilityKey4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
		this.inventoryKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
		this.settingsKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
		this.questsKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
		this.enterKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
		this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		this.enchantKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

		this.isAbility1Pressed = () => {
			if (this.abilityKeyPressed[AbilityKey.ONE]) {
				this.abilityKeyPressed[AbilityKey.ONE] = false;
				return true;
			}
			if (this.abilityKey1.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.A;
			} catch (err) {
				return false;
			}
		};

		this.isAbility2Pressed = () => {
			if (this.abilityKeyPressed[AbilityKey.TWO]) {
				this.abilityKeyPressed[AbilityKey.TWO] = false;
				return true;
			}
			if (this.abilityKey2.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.X;
			} catch (err) {
				return false;
			}
		};

		this.isAbility3Pressed = () => {
			if (this.abilityKeyPressed[AbilityKey.THREE]) {
				this.abilityKeyPressed[AbilityKey.THREE] = false;
				return true;
			}
			if (this.abilityKey3.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.B;
			} catch (err) {
				return false;
			}
		};

		this.isAbility4Pressed = () => {
			if (this.abilityKeyPressed[AbilityKey.FOUR]) {
				this.abilityKeyPressed[AbilityKey.FOUR] = false;
				return true;
			}
			if (this.abilityKey4.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.Y;
			} catch (err) {
				return false;
			}
		};

		this.isSpacePressed = () => {
			if (this.abilityKeyPressed[AbilityKey.SPACE]) {
				this.abilityKeyPressed[AbilityKey.SPACE] = false;
				return true;
			}
			if (this.spaceKey.isDown) {
				return true;
			}
			try {
				return !!this.gamepad?.A;
			} catch (err) {
				return false;
			}
		};
	}

	getInventoryKeyPress() {
		const keysPressed = [];
		const isEnterPressed = this.isEnterPressed();
		if (!this.wasEnterKeyPressed && isEnterPressed) {
			this.wasEnterKeyPressed = true;
			return ['enter'];
		} else if (!isEnterPressed) {
			this.wasEnterKeyPressed = false;
		}
		if (this.isMoveDownPressed()) keysPressed.push('down');
		else if (this.isMoveUpPressed()) keysPressed.push('up');
		if (this.isMoveLeftPressed()) keysPressed.push('left');
		else if (this.isMoveRightPressed()) keysPressed.push('right');

		if (keysPressed.length === 0) return ['nothing'];
		return keysPressed;
	}
	updateGamepad() {
		this.gamepad = this.scene.input.gamepad?.getPad(0);
	}
	getCharacterFacing(stickDeltaX: number, stickDeltaY: number) {
		let yFacing = 0;
		let xFacing = 0;

		if (stickDeltaY < -20 || this.isMoveUpPressed()) {
			yFacing = -1;
		} else if (stickDeltaY > 20 || this.isMoveDownPressed()) {
			yFacing = 1;
		}

		if (stickDeltaX < -20 || this.isMoveLeftPressed()) {
			xFacing = -1;
		} else if (stickDeltaX > 20 || this.isMoveRightPressed()) {
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
			case AbilityKey.ONE:
				return this.isAbility1Pressed;
			case AbilityKey.TWO:
				return this.isAbility2Pressed;
			case AbilityKey.THREE:
				return this.isAbility3Pressed;
			case AbilityKey.FOUR:
				return this.isAbility4Pressed;
			case AbilityKey.SPACE:
				return this.isSpacePressed;
			default:
				throw new Error(`No Ability Key mapping for key ${abilityKey}.`);
		}
	}

	getAbilityLevelForAbilityKey(abilityKey: AbilityKey) {
		const inventory = globalState.inventory;
		switch (abilityKey) {
			case AbilityKey.ONE:
				return inventory.equippedSource ? inventory.sources[inventory.equippedSource].level : 0;
			case AbilityKey.TWO:
				return inventory.equippedCatalyst
					? inventory.catalysts[inventory.equippedCatalyst].level
					: 0;
			case AbilityKey.THREE:
				return inventory.equippedLeftRing ? inventory.rings[inventory.equippedLeftRing].level : 0;
			case AbilityKey.FOUR:
				return inventory.equippedRightRing ? inventory.rings[inventory.equippedRightRing].level : 0;
			default:
				return 0;
		}
	}

	getCastedAbilities(gameTime: number) {
		return [
			[
				this.castIfPressed(AbilityKey.ONE, gameTime),
				this.getAbilityLevelForAbilityKey(AbilityKey.ONE),
			],
			[
				this.castIfPressed(AbilityKey.TWO, gameTime),
				this.getAbilityLevelForAbilityKey(AbilityKey.TWO),
			],
			[
				this.castIfPressed(AbilityKey.THREE, gameTime),
				this.getAbilityLevelForAbilityKey(AbilityKey.THREE),
			],
			[
				this.castIfPressed(AbilityKey.FOUR, gameTime),
				this.getAbilityLevelForAbilityKey(AbilityKey.FOUR),
			],
			[this.castIfPressed(AbilityKey.SPACE, gameTime), 1],
		].filter(([ability]) => !!ability) as [AbilityType, number][];
	}

	getAbilityCooldown(abilityKey: AbilityKey, gameTime: number) {
		const ability = globalState.playerCharacter.abilityKeyMapping[abilityKey] as AbilityType;
		const abilityData = getRelevantAbilityVersion(
			ability,
			this.getAbilityLevelForAbilityKey(abilityKey),
			globalState.playerCharacter.lastComboCast || 0
		);
		// console.log(`Using ${abilityData.abilityName} with ${abilityData.cooldownMs}ms cooldown`);
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
			globalState.playerCharacter.abilityCastTime[AbilityKey.FOUR],
			globalState.playerCharacter.abilityCastTime[AbilityKey.SPACE],
		].reduce((max, value) => Math.max(max, value), -Infinity);

		return gameTime - lastCast;
	}

	getLastCastingDuration() {
		return this.lastCastingDuration;
	}

	getAbilityCooldowns(gameTime: number) {
		return [
			this.getAbilityCooldown(AbilityKey.ONE, gameTime),
			this.getAbilityCooldown(AbilityKey.TWO, gameTime),
			this.getAbilityCooldown(AbilityKey.THREE, gameTime),
			this.getAbilityCooldown(AbilityKey.FOUR, gameTime),
			this.getAbilityCooldown(AbilityKey.SPACE, gameTime),
		];
	}

	castIfPressed(abilityKey: AbilityKey, gameTime: number) {
		const relevantFunction = this.getRelevantEvalFunctionForEnum(abilityKey);
		if (!relevantFunction()) {
			return false;
		}
		const ability = globalState.playerCharacter.abilityKeyMapping[abilityKey] as AbilityType;
		const abilityData = getRelevantAbilityVersion(
			ability,
			this.getAbilityLevelForAbilityKey(abilityKey),
			globalState.playerCharacter.lastComboCast || 0
		);
		const lastCasted = globalState.playerCharacter.abilityCastTime[abilityKey];
		const readyAt = lastCasted + (abilityData.cooldownMs || 0);
		if (readyAt > gameTime) {
			return false;
		}
		globalState.playerCharacter.abilityCastTime[abilityKey] = gameTime;
		return ability;
	}
}
