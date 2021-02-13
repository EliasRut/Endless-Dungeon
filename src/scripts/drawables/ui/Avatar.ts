import { UiDepths } from '../../helpers/constants';
import globalState from '../../worldstate';

const HEALTH_BAR_WIDTH = 98;

export default class Avatar extends Phaser.GameObjects.Group {
	healthBar: Phaser.GameObjects.Image;
	abilty1Icon: Phaser.GameObjects.Image;
	abilty2Icon: Phaser.GameObjects.Image;
	abilty3Icon: Phaser.GameObjects.Image;
	abilty4Icon: Phaser.GameObjects.Image;

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

		this.abilty1Icon = scene.add.image(72, 63, 'icon-abilities', 0);
		this.abilty1Icon.setScrollFactor(0);
		this.abilty1Icon.setDepth(UiDepths.UI_MAIN_LAYER);
		this.abilty2Icon = scene.add.image(101, 63, 'icon-abilities', 1);
		this.abilty2Icon.setScrollFactor(0);
		this.abilty2Icon.setDepth(UiDepths.UI_MAIN_LAYER);
		this.abilty3Icon = scene.add.image(130, 63, 'icon-abilities', 2);
		this.abilty3Icon.setScrollFactor(0);
		this.abilty3Icon.setDepth(UiDepths.UI_MAIN_LAYER);
		this.abilty4Icon = scene.add.image(159, 63, 'icon-abilities', 2);
		this.abilty4Icon.setScrollFactor(0);
		this.abilty4Icon.setDepth(UiDepths.UI_MAIN_LAYER);
		// tslint:enable: no-magic-numbers
	}

	update([cooldown1, cooldown2, cooldown3, cooldown4 ]: number[]) {
		const healthRatio = globalState.playerCharacter.health / globalState.playerCharacter.maxHealth;
		this.healthBar.scaleX = Math.max(0, healthRatio * HEALTH_BAR_WIDTH);

		this.abilty1Icon.setAlpha(cooldown1);
		this.abilty2Icon.setAlpha(cooldown2);
		this.abilty3Icon.setAlpha(cooldown3);
		this.abilty4Icon.setAlpha(cooldown4);
	}
}