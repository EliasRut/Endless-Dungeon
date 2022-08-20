import { Scene } from 'phaser';
import { isJSON } from 'validator';
import { UiDepths, UI_SCALE } from '../helpers/constants';
import MainScene from '../scenes/MainScene';
import RoomPreloaderScene from '../scenes/RoomPreloaderScene';
import globalState, { WorldState } from '../worldstate';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import OverlayScreen from './OverlayScreen';
import * as data from '../../assets/newgame.json';
import ContentDataLibrary, { loadContentPackagesFromDatabase } from '../helpers/ContentDataLibrary';

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;
const SCALED_WINDOW_HEIGHT = window.innerHeight / UI_SCALE;

const SETTINGS_WIDTH = 220;
const SETTINGS_HEIGHT = 240;
const SETTINGS_START_X = (SCALED_WINDOW_WIDTH - SETTINGS_WIDTH) / 2;
const SETTINGS_START_Y = (SCALED_WINDOW_HEIGHT - SETTINGS_HEIGHT) / 2;
export default class ContentManagementScreen extends OverlayScreen {
	scene: MainScene;

	contentBlockTitles: Phaser.GameObjects.Text[] = [];
	checkBoxes: Phaser.GameObjects.Image[] = [];

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers

		super(
			scene,
			SETTINGS_START_X * UI_SCALE,
			SETTINGS_START_Y * UI_SCALE,
			SETTINGS_WIDTH * UI_SCALE,
			SETTINGS_HEIGHT * UI_SCALE
		);

		this.scene = scene as MainScene;

		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
	}

	updateContent() {
		for (const contentBlockTitle of this.contentBlockTitles) {
			contentBlockTitle.destroy();
		}
		this.contentBlockTitles = [];
		this.checkBoxes.forEach((checkBox) => {
			checkBox.destroy(true);
		});
		this.checkBoxes = [];

		ContentDataLibrary.contentPackages.forEach((contentPackage, packageIndex) => {
			const isPackageActive = globalState.contentPackages.includes(contentPackage.id);
			const questBox = new Phaser.GameObjects.Image(
				this.scene,
				(SETTINGS_START_X + 16) * UI_SCALE,
				(SETTINGS_START_Y + 18 + packageIndex * 20) * UI_SCALE,
				isPackageActive ? 'checkbox-filled' : 'checkbox-empty'
			);
			questBox.setOrigin(0);
			questBox.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			questBox.setScrollFactor(0);
			questBox.setInteractive();
			questBox.setScale(UI_SCALE);
			questBox.on('pointerdown', () => {
				const existingIndex = globalState.contentPackages.findIndex(
					(packageId) => contentPackage.id === packageId
				);
				if (existingIndex >= 0) {
					globalState.contentPackages = [
						...globalState.contentPackages.slice(0, existingIndex),
						...globalState.contentPackages.slice(existingIndex + 1),
					];
				} else {
					globalState.contentPackages.push(contentPackage.id);
				}
				this.updateContent();
			});
			questBox.setVisible(this.visibility);
			this.add(questBox, true);
			this.checkBoxes.push(questBox);

			const contentPackageTitle = new Phaser.GameObjects.Text(
				this.scene,
				(SETTINGS_START_X + 38) * UI_SCALE,
				(SETTINGS_START_Y + 19 + packageIndex * 20) * UI_SCALE,
				contentPackage.title,
				{
					color: 'white',
					// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
					fontSize: `${12 * UI_SCALE}pt`,
					fontFamily: 'endlessDungeon',
					align: 'left',
					fixedWidth: (SETTINGS_WIDTH - 60) * UI_SCALE,
				}
			);

			contentPackageTitle.setDepth(UiDepths.UI_FOREGROUND_LAYER);
			contentPackageTitle.setScrollFactor(0);
			contentPackageTitle.setShadow(0, 1 * UI_SCALE, 'black');
			contentPackageTitle.setInteractive();
			contentPackageTitle.on('pointerdown', () => {
				const existingIndex = globalState.contentPackages.findIndex(
					(packageId) => contentPackage.id === packageId
				);
				if (existingIndex >= 0) {
					globalState.contentPackages = [
						...globalState.contentPackages.slice(0, existingIndex),
						...globalState.contentPackages.slice(existingIndex + 1),
					];
				} else {
					globalState.contentPackages.push(contentPackage.id);
				}
				this.updateContent();
			});
			contentPackageTitle.setVisible(this.visibility);
			this.add(contentPackageTitle, true);
			this.contentBlockTitles.push(contentPackageTitle);
		});
	}

	async reloadDataAndUpdateContent() {
		await loadContentPackagesFromDatabase();
		this.updateContent();
	}

	setVisible(value: boolean, index?: number | undefined, direction?: number | undefined) {
		super.setVisible(value, index, direction);
		this.visibility = value;
		if (value === true) {
			this.reloadDataAndUpdateContent();
		}
		return this;
	}
}
