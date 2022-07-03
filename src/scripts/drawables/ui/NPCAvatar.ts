import { UI_SCALE, UiDepths } from '../../helpers/constants';
import globalState from '../../worldstate';
import MainScene from '../../scenes/MainScene';
const SCREEN_OFFSET_X = 8;
const SCREEN_OFFSET_Y = 84;

const HEALTH_BAR_START_X = SCREEN_OFFSET_X + 50;
const HEALTH_BAR_START_Y = SCREEN_OFFSET_Y + 24;
const HEALTH_BAR_WIDTH = 98;

export default class NPCAvatar extends Phaser.GameObjects.Group {
	healthBar: Phaser.GameObjects.Image;
	avatarIconName: string;
	followerId: string;

	constructor(scene: MainScene, followerId: string, avatarIconName: string) {
		super(scene);
		this.setDepth(UiDepths.UI_MAIN_LAYER);

		this.avatarIconName = avatarIconName;
		this.followerId = followerId;

		// tslint:disable: no-magic-numbers
		const avatarIcon = scene.add.image(
			SCREEN_OFFSET_X * UI_SCALE,
			SCREEN_OFFSET_Y * UI_SCALE,
			avatarIconName
		);
		avatarIcon.setScrollFactor(0);
		avatarIcon.setScale(UI_SCALE);
		avatarIcon.setDepth(UiDepths.UI_MAIN_LAYER);
		avatarIcon.setOrigin(0);

		const guiBaseIcon = scene.add.image(
			HEALTH_BAR_START_X * UI_SCALE,
			HEALTH_BAR_START_Y * UI_SCALE,
			'icon-healthbar-background'
		);
		guiBaseIcon.setScrollFactor(0);
		guiBaseIcon.setScale(UI_SCALE);
		guiBaseIcon.setDepth(UiDepths.UI_MAIN_LAYER);
		guiBaseIcon.setOrigin(0);

		this.healthBar = scene.add.image(
			(HEALTH_BAR_START_X + 4) * UI_SCALE,
			(HEALTH_BAR_START_Y + 4) * UI_SCALE,
			'icon-healthbar'
		);
		this.healthBar.setScrollFactor(0);
		this.healthBar.setScale(UI_SCALE);
		this.healthBar.setOrigin(0);
		this.healthBar.setDepth(UiDepths.UI_MAIN_LAYER);
	}

	update() {
		const healthRatio =
			globalState.followers[this.followerId].health /
			globalState.followers[this.followerId].maxHealth;
		this.healthBar.scaleX = Math.max(0, healthRatio * HEALTH_BAR_WIDTH * UI_SCALE);
	}
}
