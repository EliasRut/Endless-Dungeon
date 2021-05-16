import { AbilityKey, UiDepths } from '../../helpers/constants';
import globalState from '../../worldstate';
import {ABILITY_TO_ICON} from '../../screens/InventoryScreen'
import { AbilityType } from '../../abilities/abilityData';

const HEALTH_BAR_WIDTH = 98;

const ABILITY_COORDINATES = {
	[AbilityKey.ONE]: [72, 62.5],
	[AbilityKey.TWO]: [101, 62.5],
	[AbilityKey.THREE]: [130, 62.5],
	[AbilityKey.FOUR]: [159, 62.5],
	[AbilityKey.FIVE]: [159, 62.5],	
};

export default class Avatar extends Phaser.GameObjects.Group {
	healthBar: Phaser.GameObjects.Image;
	abilityIcons: Map<AbilityKey, Phaser.GameObjects.Image>;

	constructor(scene: Phaser.Scene) {
		super(scene);
		this.setDepth(UiDepths.UI_MAIN_LAYER);		

		// tslint:disable: no-magic-numbers
		const heroIcon = scene.add.image(32, 40, 'icon-hero');
		heroIcon.setScrollFactor(0);
		heroIcon.setDepth(UiDepths.UI_MAIN_LAYER);

		const guiBaseIcon = scene.add.image(116, 50, 'icon-guibase');
		guiBaseIcon.setScrollFactor(0);
		guiBaseIcon.setDepth(UiDepths.UI_MAIN_LAYER);

		this.healthBar = scene.add.image(62, 35, 'icon-healthbar');
		this.healthBar.setScrollFactor(0);
		this.healthBar.setOrigin(0, 0.5);
		this.healthBar.setDepth(UiDepths.UI_MAIN_LAYER);
		this.abilityIcons = new Map();
	}

	update([cooldown1, cooldown2, cooldown3, cooldown4]: number[]) {
		const healthRatio = globalState.playerCharacter.health / globalState.playerCharacter.maxHealth;
		this.healthBar.scaleX = Math.max(0, healthRatio * HEALTH_BAR_WIDTH);

		if(this.abilityIcons.has(AbilityKey.ONE)) this.abilityIcons.get(AbilityKey.ONE)!.setAlpha(cooldown1);
		if(this.abilityIcons.has(AbilityKey.TWO)) this.abilityIcons.get(AbilityKey.TWO)!.setAlpha(cooldown2);
		if(this.abilityIcons.has(AbilityKey.THREE)) this.abilityIcons.get(AbilityKey.THREE)!.setAlpha(cooldown3);
		if(this.abilityIcons.has(AbilityKey.FOUR)) this.abilityIcons.get(AbilityKey.FOUR)!.setAlpha(cooldown4);
	}

	updateAbility(abilityKey: AbilityKey, ability: AbilityType) {
		if(this.abilityIcons.has(abilityKey)) {			
			this.abilityIcons.get(abilityKey)!.destroy(true);
			this.abilityIcons.delete(abilityKey);
		}
		if (ability !== AbilityType.NOTHING) {
			const abilityIcon = this.scene.add.image(ABILITY_COORDINATES[abilityKey][0], ABILITY_COORDINATES[abilityKey][1], ABILITY_TO_ICON[ability][0] as string, ABILITY_TO_ICON[ability][1]);
			abilityIcon.setScrollFactor(0);
			abilityIcon.setDepth(UiDepths.UI_MAIN_LAYER);
			this.abilityIcons.set(abilityKey, abilityIcon);
		}
	}
}