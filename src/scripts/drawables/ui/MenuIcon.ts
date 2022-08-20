import MainScene from '../../scenes/MainScene';
import { UI_SCALE, UiDepths } from '../../helpers/constants';
import { Icons } from './Icons';
import OverlayScreen from '../../screens/OverlayScreen';
import { EnchantmentName } from '../../../items/enchantmentData';

export const MENU_ICON_LEFT_BORDER = 32;

export default abstract class MenuIcon extends Phaser.GameObjects.Image implements Icons {
	scene: MainScene;
	screens: OverlayScreen[];
	ICON: string;
	open: boolean = false;

	constructor(
		scene: MainScene,
		x: number,
		y: number,
		texture: string | Phaser.Textures.Texture,
		frame?: string | number | undefined
	) {
		super(scene, x, y, texture, frame);
		this.scene = scene;

		this.setName(texture.toString());
		this.setScrollFactor(0);
		this.setScale(UI_SCALE);
		this.setInteractive();

		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.on('pointerdown', () => this.toggleScreen());

		scene.add.existing(this);
	}

	toggleScreen() {
		if (!this.scene.scriptHelper.isScriptRunning()) {
			if (this.open) this.closeScreen();
			else {
				this.scene.closeAllIconScreens();
				this.openScreen();
			}
		}
	}

	closeScreen() {
		this.setScreens();
		
		this.screens.forEach((screen) => {
			screen.modify();
			screen.setVisible(false);
			screen.visibility = false;
		});
		this.open = false;
	}

	openScreen(openingModifier?: any) {
		this.setScreens();

		this.screens.forEach((screen) => {
			screen.modify(openingModifier);
			screen.update();
			screen.setVisible(true);
			screen.visibility = true;
		});
		this.open = true;
		this.scene.pause();
	}

	setScreenVisibility(visible: boolean): void {
		this.setScreens();
		this.screens.forEach((screen) => screen.setVisible(visible));
	}

	abstract setScreens(): void;
}
