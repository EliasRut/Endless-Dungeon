import { Scene } from 'phaser';
import { isJSON } from 'validator';
import { UiDepths } from '../helpers/constants';
import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import OverlayScreen from './OverlayScreen';

export default class SettingsScreen extends OverlayScreen {
	saveIcon: Phaser.GameObjects.BitmapText;
	loadIcon: Phaser.GameObjects.BitmapText;
	newGameIcon: Phaser.GameObjects.BitmapText;
	scene: Phaser.Scene;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		const height = scene.sys.game.canvas.height;
		const width = scene.sys.game.canvas.width;
		const SETTINGS_START_X = width/3;
		const SETTINGS_START_Y = height/3;
		const SETTINGS_WIDTH = width/3;
		const SETTINGS_HEIGHT = height/3;

		super(scene, SETTINGS_START_X, SETTINGS_START_Y , SETTINGS_WIDTH, SETTINGS_HEIGHT);

		this.scene = scene;

		this.saveIcon = new Phaser.GameObjects.BitmapText(
			scene, SETTINGS_START_X+SETTINGS_WIDTH/2-100, SETTINGS_START_Y+5, 'pixelfont', 'Save', 12); //{ color: 'black', fontSize: '14px' }
		// this.dialogText.setOrigin(0, 0);
		this.saveIcon.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.saveIcon.setScrollFactor(0);
		this.saveIcon.setInteractive();
		this.saveIcon.on('pointerdown', () => {
			// scene.overlayScreens.settingsScreen.save();
			console.log('save game');
			this.save();
		});
		this.add(this.saveIcon, true);


		const fileInput: HTMLInputElement = document.createElement('input');
		const sc: Phaser.Scene = this.scene;
		fileInput.type = 'file';
		fileInput.setAttribute('style','display:none');
		fileInput.addEventListener('change', () => {this.load(fileInput);}, false);
		document.body.appendChild(fileInput);


		this.loadIcon = new Phaser.GameObjects.BitmapText(
			scene, SETTINGS_START_X+SETTINGS_WIDTH/2-10, SETTINGS_START_Y+5, 'pixelfont', 'Load', 12);
		// this.dialogText.setOrigin(0, 0);
		this.loadIcon.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.loadIcon.setScrollFactor(0);
		this.loadIcon.setInteractive();
		this.loadIcon.on('pointerdown', () => {
			// scene.overlayScreens.settingsScreen.save();
			console.log('load game')
			// this.load(fileInput);
			fileInput.click();
			// this.add(this.refreshIcon, true);
		});
		this.add(this.loadIcon, true);


		// this.newGameIcon = new Phaser.GameObjects.BitmapText(
		// 	scene, SETTINGS_START_X+SETTINGS_WIDTH/2-72, SETTINGS_START_Y+50, 'pixelfont', 'New Game', 12);
		// // this.dialogText.setOrigin(0, 0);
		// this.newGameIcon.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		// this.newGameIcon.setScrollFactor(0);
		// this.newGameIcon.setInteractive();
		// // this.refreshIcon.on('pointerdown', () => {
		// // 	this.refresh();
		// // });

		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
	}

	save() {
		let jsonData: string = '{';
		jsonData += '"playerCharacter": '      + JSON.stringify(globalState.playerCharacter) +',\n';
		jsonData += '"gameTime": '             + `${globalState.gameTime}` + ',\n';
		jsonData += '"npcs": '                 + JSON.stringify(globalState.npcs) +',\n';
		jsonData += '"doors": '                + JSON.stringify(globalState.doors) +',\n';
		jsonData += '"scripts": '              + JSON.stringify(globalState.scripts) +',\n';
		jsonData += '"quests": '               + JSON.stringify(globalState.quests) +',\n';
		jsonData += '"dungeon": '              + JSON.stringify(globalState.dungeon) +',\n';
		jsonData += '"transitionStack": '      + JSON.stringify(globalState.transitionStack) +',\n';
		jsonData += '"availableRooms": '       + JSON.stringify(globalState.availableRooms) +',\n';
		jsonData += '"availableTilesets": '    + JSON.stringify(globalState.availableTilesets) +',\n';
		jsonData += '"currentLevel": '         + JSON.stringify(globalState.currentLevel) +',\n';
		jsonData += '"roomAssignment": '       + JSON.stringify(globalState.roomAssignment) +',\n';
		jsonData += '"inventory": '            + JSON.stringify(globalState.inventory) +',\n';
		jsonData += '"saveGameName": '			+ '"test-save"';
		jsonData += '}';

		console.log(this.scene.scene);

		this.download(jsonData, 'json.txt', 'text/plain');
	}

	async load(element: HTMLInputElement): Promise<any> {
		let savegame: File;
		let savegameJSON: any;
		if(element.files === null) {
			return;
		}

		savegame = element.files[0];
		console.log( 'loading file '+element.files[0].name);

		const saveStr: string = await savegame.text();

		if(isJSON(saveStr)) {
			console.log('parse json');
			savegameJSON = JSON.parse(saveStr);
			// console.log(saveStr);
		} else {
			console.log('not a json file.');
			console.log(saveStr);
			return;
		}


		/* tslint:disable: max-line-length */
		if (savegameJSON.playerCharacter) 	localStorage.setItem('playerCharacter', JSON.stringify(savegameJSON.playerCharacter));
		if (savegameJSON.gameTime) 					localStorage.setItem('gameTime', `${savegameJSON.gameTime}`);
		if (savegameJSON.npcs) 							localStorage.setItem('npcs', JSON.stringify(savegameJSON.npcs));
		if (savegameJSON.doors) 						localStorage.setItem('doors', JSON.stringify(savegameJSON.doors));
		if (savegameJSON.scripts) 					localStorage.setItem('scripts', JSON.stringify(savegameJSON.scripts));
		if (savegameJSON.quests) 						localStorage.setItem('quests', JSON.stringify(savegameJSON.quests));
		if (savegameJSON.dungeon) 					localStorage.setItem('dungeon', JSON.stringify(savegameJSON.dungeon));
		if (savegameJSON.transitionStack) 	localStorage.setItem('transitionStack', JSON.stringify(savegameJSON.transitionStack));
		if (savegameJSON.availableRooms)	 	localStorage.setItem('availableRooms', JSON.stringify(savegameJSON.availableRooms));
		if (savegameJSON.availableTilesets)	localStorage.setItem('availableTilesets', JSON.stringify(savegameJSON.availableTilesets));
		if (savegameJSON.currentLevel) 			localStorage.setItem('currentLevel', JSON.stringify(savegameJSON.currentLevel));
		if (savegameJSON.roomAssignment) 		localStorage.setItem('roomAssignment', JSON.stringify(savegameJSON.roomAssignment));
		if (savegameJSON.inventory) 				localStorage.setItem('inventory', JSON.stringify(savegameJSON.inventory));
		if (savegameJSON.saveGameName) 			localStorage.setItem('saveGameName',JSON.stringify(savegameJSON.saveGameName));
		/* tslint:enable: max-line-length */

		// globalState.loadState();
		globalState.loadGame = true;
		this.scene.scene.start('RoomPreloaderScene');
		(this.scene as MainScene).resume();

		return '';
	}

	// async refresh() {
	// 	await(globalState.loadGame === true);
	// 	// this.scene.registry.destroy();
	// 	// this.scene.events.off;
	// 	// this.scene.scene.restart();
	// 	// globalState.loadGame = false;
	// }

	// handleFileLoad(event: Event){
	// 	console.log(event);
	// 	if(event.target !== null)
	// 	document.getElementById('fileContent').textContent = event.target.result;
	// }

	download(content: string, fileName: string, contentType: string) {
		const a = document.createElement("a");
		const file = new Blob([content], {type: contentType});
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	}
}

// function signal() {
// 	globalState.loadGame = true;
// }