import { AbilityKey, UiDepths } from '../../helpers/constants';
import globalState from '../../worldstate';
import {ABILITY_TO_ICON} from '../../screens/InventoryScreen'
import { AbilityType } from '../../abilities/abilityData';
import MainScene from '../../scenes/MainScene';

const HEALTH_BAR_WIDTH = 98;

const ABILITY_COORDINATES_DESKTOP = {
	[AbilityKey.ONE]: [72, 62.5],
	[AbilityKey.TWO]: [101, 62.5],
	[AbilityKey.THREE]: [130, 62.5],
	[AbilityKey.FOUR]: [159, 62.5],
	[AbilityKey.FIVE]: [159, 62.5],
};

const ABILITY_COORDINATES_MOBILE = {
	[AbilityKey.ONE]: [32, 106],
	[AbilityKey.TWO]: [32, 164],
	[AbilityKey.THREE]: [32, 222],
	[AbilityKey.FOUR]: [32, 280],
	[AbilityKey.FIVE]: [32, 280],
};

export default class Avatar extends Phaser.GameObjects.Group {
	healthBar: Phaser.GameObjects.Image;
	abilityIcons: Map<AbilityKey, Phaser.GameObjects.Image>;

	constructor(scene: MainScene) {
		super(scene);
		this.setDepth(UiDepths.UI_MAIN_LAYER);

		// tslint:disable: no-magic-numbers
		const heroIcon = scene.add.image(32, 40, 'icon-hero');
		heroIcon.setScrollFactor(0);
		heroIcon.setDepth(UiDepths.UI_MAIN_LAYER);

		const guiBaseIcon = scene.add.image(116, 50, 'icon-healthbar-background');
		guiBaseIcon.setScrollFactor(0);
		guiBaseIcon.setDepth(UiDepths.UI_MAIN_LAYER);

		let abilityBackground: Phaser.GameObjects.Image;
		if (scene.isMobile) {
			abilityBackground = scene.add.image(32, 194, 'ability-background-mobile');
		} else {
			abilityBackground = scene.add.image(116, 62, 'ability-background-desktop');
		}
		abilityBackground.setScrollFactor(0);
		abilityBackground.setDepth(UiDepths.UI_MAIN_LAYER);

		this.healthBar = scene.add.image(62, 35, 'icon-healthbar');
		this.healthBar.setScrollFactor(0);
		this.healthBar.setOrigin(0, 0.5);
		this.healthBar.setDepth(UiDepths.UI_MAIN_LAYER);
		this.abilityIcons = new Map();
	}

	update([cooldown1, cooldown2, cooldown3, cooldown4]: number[]) {
		const healthRatio = globalState.playerCharacter.health / globalState.playerCharacter.maxHealth;
		this.healthBar.scaleX = Math.max(0, healthRatio * HEALTH_BAR_WIDTH);

		if(this.abilityIcons.has(AbilityKey.ONE)) {
			this.abilityIcons.get(AbilityKey.ONE)!.setAlpha(cooldown1);
		}
		if(this.abilityIcons.has(AbilityKey.TWO)) {
			this.abilityIcons.get(AbilityKey.TWO)!.setAlpha(cooldown2);
		}
		if(this.abilityIcons.has(AbilityKey.THREE)) {
			this.abilityIcons.get(AbilityKey.THREE)!.setAlpha(cooldown3);
		}
		if(this.abilityIcons.has(AbilityKey.FOUR)) {
			this.abilityIcons.get(AbilityKey.FOUR)!.setAlpha(cooldown4);
		}
	}

	updateAbility(abilityKey: AbilityKey, ability: AbilityType) {
		if(this.abilityIcons.has(abilityKey)) {
			this.abilityIcons.get(abilityKey)!.destroy(true);
			this.abilityIcons.delete(abilityKey);
		}
		if (ability !== AbilityType.NOTHING) {
			const mainScene = (this.scene as MainScene);
			const coordinate = mainScene.isMobile ?
				ABILITY_COORDINATES_MOBILE[abilityKey] :
				ABILITY_COORDINATES_DESKTOP[abilityKey];
			const abilityIcon = this.scene.add.image(
				coordinate[0],
				coordinate[1],
				ABILITY_TO_ICON[ability][0] as string, ABILITY_TO_ICON[ability][1]
			);
			if (mainScene.isMobile) {
				abilityIcon.setScale(2);
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
			abilityIcon.setDepth(UiDepths.UI_MAIN_LAYER);
			this.abilityIcons.set(abilityKey, abilityIcon);
		}
	}
}