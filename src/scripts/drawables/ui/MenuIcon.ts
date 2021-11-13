import MainScene from '../../scenes/MainScene';
import { UiDepths } from '../../helpers/constants';
import { Icons } from './Icons';
import OverlayScreen from '../../screens/OverlayScreen';

export default abstract class MenuIcon extends Phaser.GameObjects.Image implements Icons {
	scene: MainScene;
	screens: OverlayScreen[];
	ICON: string;

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
		this.setInteractive();

		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.on('pointerdown', () => this.toggleScreen());

		scene.add.existing(this);
	}

	toggleScreen() {
		this.setScreens();

		Object.values(this.scene.icons)
			.filter((e) => e.name !== this.name)
			.forEach((value) => {
				value.setScreenVisibility(false);
				this.scene.resume();
			});

		let oneVisible: boolean = false;

		this.screens.forEach((screen) => {
			if (screen.visiblity) {
				// this.scene.pause();
				oneVisible = true;
				screen.setVisible(false);
				screen.visiblity = false;
			} else {
				// this.scene.resume();
				screen.update();
				screen.setVisible(true);
				screen.visiblity = true;
			}
		});

		if (oneVisible) {
			this.scene.resume();
		} else {
			this.scene.pause();
		}
	}

	setScreenVisibility(visible: boolean): void {
		this.setScreens();
		this.screens.forEach((screen) => screen.setVisible(visible));
	}

	abstract setScreens(): void;
}
