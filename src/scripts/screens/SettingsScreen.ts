import { Scene } from 'phaser';
import { isJSON } from 'validator';
import { UiDepths, UI_SCALE } from '../helpers/constants';
import MainScene from '../scenes/MainScene';
import RoomPreloaderScene from '../scenes/RoomPreloaderScene';
import globalState, { WorldState } from '../worldstate';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import OverlayScreen from './OverlayScreen';
import * as data from '../../assets/newgame.json';

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;
const SCALED_WINDOW_HEIGHT = window.innerHeight / UI_SCALE;

const SETTINGS_WIDTH = 120;
const SETTINGS_HEIGHT = 144;
const SETTINGS_START_X = (SCALED_WINDOW_WIDTH - SETTINGS_WIDTH) / 2;
const SETTINGS_START_Y = (SCALED_WINDOW_HEIGHT - SETTINGS_HEIGHT) / 2;
export default class SettingsScreen extends OverlayScreen {
	saveText: Phaser.GameObjects.Text;
	loadText: Phaser.GameObjects.Text;
	newGameText: Phaser.GameObjects.Text;
	manageContentText: Phaser.GameObjects.Text;
	scene: MainScene;

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

		this.saveText = new Phaser.GameObjects.Text(
			scene,
			(SETTINGS_START_X + 12) * UI_SCALE,
			(SETTINGS_START_Y + 18) * UI_SCALE,
			'Save',
			{
				color: 'white',
				// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
				fixedWidth: (SETTINGS_WIDTH - 28) * UI_SCALE,
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.saveText.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.saveText.setScrollFactor(0);
		this.saveText.setInteractive();
		this.saveText.setShadow(0, 1 * UI_SCALE, 'black');
		this.saveText.on('pointerdown', () => {
			// scene.overlayScreens.settingsScreen.save();
			// tslint:disable-next-line: no-console
			console.log('save game');
			this.save();
		});
		this.add(this.saveText, true);

		const fileInput: HTMLInputElement = document.createElement('input');
		// const sc: Phaser.Scene = this.scene;
		fileInput.type = 'file';
		fileInput.setAttribute('style', 'display:none');

		fileInput.addEventListener(
			'change',
			() => {
				const json = this.loadJSONFile(fileInput);
				json.then((value) => {
					this.load(value);
				});
			},
			false
		);
		document.body.appendChild(fileInput);

		this.loadText = new Phaser.GameObjects.Text(
			scene,
			(SETTINGS_START_X + 12) * UI_SCALE,
			(SETTINGS_START_Y + 46) * UI_SCALE,
			'Load',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
				fixedWidth: (SETTINGS_WIDTH - 28) * UI_SCALE,
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.loadText.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.loadText.setScrollFactor(0);
		this.loadText.setInteractive();
		this.loadText.setShadow(0, 1 * UI_SCALE, 'black');
		this.loadText.on('pointerdown', () => {
			// tslint:disable-next-line: no-console
			console.log('load game');
			fileInput.click();
		});
		this.add(this.loadText, true);

		this.newGameText = new Phaser.GameObjects.Text(
			scene,
			(SETTINGS_START_X + 12) * UI_SCALE,
			(SETTINGS_START_Y + 74) * UI_SCALE,
			'New Game',
			{
				color: 'white',
				// wordWrap: { width: SCREEN_X - 40, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
				fixedWidth: (SETTINGS_WIDTH - 28) * UI_SCALE,
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.newGameText.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.newGameText.setScrollFactor(0);
		this.newGameText.setInteractive();
		this.newGameText.setShadow(0, 1 * UI_SCALE, 'black');
		this.newGameText.on('pointerdown', () => {
			globalState.clearState();
			location.reload();
		});
		this.add(this.newGameText, true);

		this.manageContentText = new Phaser.GameObjects.Text(
			scene,
			(SETTINGS_START_X + 12) * UI_SCALE,
			(SETTINGS_START_Y + 102) * UI_SCALE,
			'Manage Content',
			{
				color: 'white',
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
				align: 'center',
				fixedWidth: (SETTINGS_WIDTH - 28) * UI_SCALE,
			}
		);
		// this.dialogText.setOrigin(0, 0);
		this.manageContentText.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.manageContentText.setScrollFactor(0);
		this.manageContentText.setInteractive();
		this.manageContentText.setShadow(0, 1 * UI_SCALE, 'black');
		this.manageContentText.on('pointerdown', () => {
			this.setVisible(false);
			(scene as MainScene).overlayScreens.contentManagementScreen.setVisible(true);
		});
		this.add(this.manageContentText, true);

		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visibility = false;
	}

	save() {
		globalState.storeState();

		let jsonData: string = '{';

		for (let i = 0; i < localStorage.length; i++) {
			const key: string | null = localStorage.key(i);
			const value: string | null = localStorage.getItem(key || '');

			if (!key || !value) continue;
			if (key === 'loglevel:webpack-dev-server') {
				continue;
			}

			jsonData += '"' + key + '": ' + value + ',\n';
		}
		jsonData = jsonData.trimEnd();
		jsonData = jsonData.substring(0, jsonData.length - 1) + '}';

		this.download(jsonData, 'savegame.json', 'text/plain');
	}

	async loadJSONFile(element: HTMLInputElement): Promise<any> {
		let savegame: File;
		let savegameJSON: any;
		if (!element.files) {
			return new Promise<any>((reject) => {
				reject('element.files is undefined');
			});
		}

		savegame = element.files[0];
		// tslint:disable-next-line: no-console
		console.log('loading file ' + element.files[0].name);

		const savegameStr: string = await savegame.text();

		if (isJSON(savegameStr)) {
			savegameJSON = JSON.parse(savegameStr);
			// console.log(saveStr);
			// console.log(savegameJSON)
			return new Promise<any>((resolve) => {
				resolve(savegameJSON);
			});
		}

		// tslint:disable-next-line: no-console
		console.log(element.files[0].name + ' is not a json file.');
		// tslint:disable-next-line: no-console
		console.log(savegameStr);
		return new Promise<any>((reject) => {
			reject('File is not a json file.');
		});
	}

	async load(savegame: any): Promise<any> {
		globalState.clearState();

		Object.keys(savegame).forEach((key) => {
			localStorage.setItem(key, JSON.stringify(savegame[key]));
		});

		// globalState.loadState();
		globalState.loadGame = true;
		this.scene.scene.start('AbilitiesPreloaderScene');
		(this.scene as MainScene).resume();

		return '';
	}

	download(content: string, fileName: string, contentType: string) {
		const a = document.createElement('a');
		const file = new Blob([content], { type: contentType });
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	}

	setVisible(value: boolean, index?: number | undefined, direction?: number | undefined) {
		super.setVisible(value, index, direction);
		if (value) {
			this.scene.overlayScreens?.contentManagementScreen?.setVisible(false);
		}
		return this;
	}
}

// function signal() {
// 	globalState.loadGame = true;
// }
