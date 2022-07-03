import { AbilityKey, UI_SCALE, UiDepths } from '../../helpers/constants';
import globalState from '../../worldstate';
import { AbilityType, Abilities } from '../../abilities/abilityData';
import MainScene from '../../scenes/MainScene';

const SCREEN_OFFSET_X = 8;
const SCREEN_OFFSET_Y = 8;

const HEALTH_BAR_START_X = SCREEN_OFFSET_X + 50;
const HEALTH_BAR_START_Y = SCREEN_OFFSET_Y + 24;
const HEALTH_BAR_WIDTH = 98;

const ABILITY_START_X = SCREEN_OFFSET_X + 50;
const ABILITY_START_Y = SCREEN_OFFSET_Y + 48;
const ABILITY_WIDTH = 29;

const ABILITY_COORDINATES_DESKTOP = {
	[AbilityKey.ONE]: [ABILITY_START_X + 4, ABILITY_START_Y + 3],
	[AbilityKey.TWO]: [ABILITY_START_X + 4 + ABILITY_WIDTH, ABILITY_START_Y + 3],
	[AbilityKey.THREE]: [ABILITY_START_X + 4 + ABILITY_WIDTH * 2, ABILITY_START_Y + 3],
	[AbilityKey.FOUR]: [ABILITY_START_X + 4 + ABILITY_WIDTH * 3, ABILITY_START_Y + 3],
	[AbilityKey.FIVE]: [ABILITY_START_X + 4 + ABILITY_WIDTH * 3, ABILITY_START_Y + 3],
	[AbilityKey.SPACE]: [ABILITY_START_X + 4 + ABILITY_WIDTH * 3, ABILITY_START_Y + 3],
};

const ABILITY_COORDINATES_MOBILE = {
	[AbilityKey.ONE]: [32, 106],
	[AbilityKey.TWO]: [32, 164],
	[AbilityKey.THREE]: [32, 222],
	[AbilityKey.FOUR]: [32, 280],
	[AbilityKey.FIVE]: [32, 280],
	[AbilityKey.SPACE]: [32, 280],
};

export default class Avatar extends Phaser.GameObjects.Group {
	healthBar: Phaser.GameObjects.Image;
	abilityIcons: Map<AbilityKey, Phaser.GameObjects.Image>;

	constructor(scene: MainScene) {
		super(scene);
		this.setDepth(UiDepths.UI_MAIN_LAYER);

		// tslint:disable: no-magic-numbers
		const heroIcon = scene.add.image(
			SCREEN_OFFSET_X * UI_SCALE,
			SCREEN_OFFSET_Y * UI_SCALE,
			'icon-hero'
		);
		heroIcon.setScrollFactor(0);
		heroIcon.setScale(UI_SCALE);
		heroIcon.setDepth(UiDepths.UI_MAIN_LAYER);
		heroIcon.setOrigin(0);

		const guiBaseIcon = scene.add.image(
			HEALTH_BAR_START_X * UI_SCALE,
			HEALTH_BAR_START_Y * UI_SCALE,
			'icon-healthbar-background'
		);
		guiBaseIcon.setScrollFactor(0);
		guiBaseIcon.setScale(UI_SCALE);
		guiBaseIcon.setDepth(UiDepths.UI_MAIN_LAYER);
		guiBaseIcon.setOrigin(0);

		let abilityBackground: Phaser.GameObjects.Image;
		if (scene.isMobile) {
			abilityBackground = scene.add.image(
				32 * UI_SCALE,
				194 * UI_SCALE,
				'ability-background-mobile'
			);
		} else {
			abilityBackground = scene.add.image(
				ABILITY_START_X * UI_SCALE,
				ABILITY_START_Y * UI_SCALE,
				'ability-background-desktop'
			);
		}
		abilityBackground.setScrollFactor(0);
		abilityBackground.setOrigin(0);
		abilityBackground.setScale(UI_SCALE);
		abilityBackground.setDepth(UiDepths.UI_MAIN_LAYER);

		this.healthBar = scene.add.image(
			(HEALTH_BAR_START_X + 4) * UI_SCALE,
			(HEALTH_BAR_START_Y + 4) * UI_SCALE,
			'icon-healthbar'
		);
		this.healthBar.setScrollFactor(0);
		this.healthBar.setScale(UI_SCALE);
		this.healthBar.setOrigin(0);
		this.healthBar.setDepth(UiDepths.UI_MAIN_LAYER);
		this.abilityIcons = new Map();
	}

	update([cooldown1, cooldown2, cooldown3, cooldown4]: number[]) {
		const healthRatio = globalState.playerCharacter.health / globalState.playerCharacter.maxHealth;
		this.healthBar.scaleX = Math.max(0, healthRatio * HEALTH_BAR_WIDTH * UI_SCALE);

		if (this.abilityIcons.has(AbilityKey.ONE)) {
			this.abilityIcons.get(AbilityKey.ONE)!.setAlpha(cooldown1);
		}
		if (this.abilityIcons.has(AbilityKey.TWO)) {
			this.abilityIcons.get(AbilityKey.TWO)!.setAlpha(cooldown2);
		}
		if (this.abilityIcons.has(AbilityKey.THREE)) {
			this.abilityIcons.get(AbilityKey.THREE)!.setAlpha(cooldown3);
		}
		if (this.abilityIcons.has(AbilityKey.FOUR)) {
			this.abilityIcons.get(AbilityKey.FOUR)!.setAlpha(cooldown4);
		}
	}

	updateAbility(abilityKey: AbilityKey, ability: AbilityType) {
		if (this.abilityIcons.has(abilityKey)) {
			this.abilityIcons.get(abilityKey)!.destroy(true);
			this.abilityIcons.delete(abilityKey);
		}
		if (ability !== AbilityType.NOTHING) {
			const mainScene = this.scene as MainScene;
			const coordinate = mainScene.isMobile
				? ABILITY_COORDINATES_MOBILE[abilityKey]
				: ABILITY_COORDINATES_DESKTOP[abilityKey];
			const abilityIcon = this.scene.add.image(
				coordinate[0] * UI_SCALE,
				coordinate[1] * UI_SCALE,
				Abilities[ability].icon![0],
				Abilities[ability].icon![1]
			);
			if (mainScene.isMobile) {
				const hitArea = new Phaser.Geom.Circle(10, 10, 14);
				abilityIcon.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
				abilityIcon.on('pointerdown', () => {
					mainScene.keyboardHelper.abilityKeyPressed[abilityKey] = true;
				});
				abilityIcon.on('pointerover', (_: any, pointer: any) => {
					if (pointer.isDown) {
						mainScene.keyboardHelper.abilityKeyPressed[abilityKey] = true;
					}
				});
			}
			abilityIcon.setScrollFactor(0);
			abilityIcon.setScale(UI_SCALE);
			abilityIcon.setOrigin(0);
			abilityIcon.setDepth(UiDepths.UI_MAIN_LAYER);
			this.abilityIcons.set(abilityKey, abilityIcon);
		}
	}
}
