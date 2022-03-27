import { Scene } from 'phaser';
import { isJSON } from 'validator';
import { UiDepths } from '../helpers/constants';
import MainScene from '../scenes/MainScene';
import RoomPreloaderScene from '../scenes/RoomPreloaderScene';
import globalState, { WorldState } from '../worldstate';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import OverlayScreen from './OverlayScreen';
import * as data from '../../assets/newgame.json';

export default class SettingsScreen extends OverlayScreen {
	saveIcon: Phaser.GameObjects.BitmapText;
	loadIcon: Phaser.GameObjects.BitmapText;
	newGameIcon: Phaser.GameObjects.BitmapText;
	scene: MainScene;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		const height = scene.sys.game.canvas.height;
		const width = scene.sys.game.canvas.width;
		const SETTINGS_START_X = width/3+30;
		const SETTINGS_START_Y = height/3;
		const SETTINGS_WIDTH = width/3;
		const SETTINGS_HEIGHT = height/3;

		super(scene, SETTINGS_START_X, SETTINGS_START_Y , SETTINGS_WIDTH, SETTINGS_HEIGHT);

		this.scene = (scene as MainScene);

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
		// const sc: Phaser.Scene = this.scene;
		fileInput.type = 'file';
		fileInput.setAttribute('style','display:none');
		
		fileInput.addEventListener('change', () => {
			const json = this.loadJSONFile(fileInput); 
			console.log(json);
			json.then (( value ) => {
			this.load(value);
			});
		}, false);
		document.body.appendChild(fileInput);


		this.loadIcon = new Phaser.GameObjects.BitmapText(
			scene, SETTINGS_START_X+SETTINGS_WIDTH/2-10, SETTINGS_START_Y+5, 'pixelfont', 'Load', 12);
		// this.dialogText.setOrigin(0, 0);
		this.loadIcon.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.loadIcon.setScrollFactor(0);
		this.loadIcon.setInteractive();
		this.loadIcon.on('pointerdown', () => {
			// scene.overlayScreens.settingsScreen.save();
			console.log('load game');
			// this.load(fileInput);
			fileInput.click();
		});
		this.add(this.loadIcon, true);


		this.newGameIcon = new Phaser.GameObjects.BitmapText(
			scene, SETTINGS_START_X+SETTINGS_WIDTH/2-80, SETTINGS_START_Y+50, 'pixelfont', 'New Game', 12);
		// this.dialogText.setOrigin(0, 0);
		this.newGameIcon.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		this.newGameIcon.setScrollFactor(0);
		this.newGameIcon.setInteractive();
		this.newGameIcon.on('pointerdown', () => {
			this.load(data);
			this.scene.scene.start('RoomPreloaderScene');
			(this.scene as MainScene).resume();
		});
		this.add(this.newGameIcon, true);

		// tslint:enable
		scene.add.existing(this);
		this.setVisible(false);
		this.visiblity = false;
	}

	save() {
		globalState.storeState();

		/* tslint:disable: max-line-length */
		let jsonData: string = '{';
		jsonData += '"'+WorldState.PLAYERCHARACTER+'": '      + JSON.stringify(globalState.playerCharacter) +',\n';
		jsonData += '"'+WorldState.GAMETIME+'": '             + `${globalState.gameTime}` + ',\n';
		jsonData += '"'+WorldState.NPCS+'": '                 + JSON.stringify(globalState.npcs) +',\n';
		jsonData += '"'+WorldState.ENEMIES+'": '              + JSON.stringify(globalState.enemies) +',\n';
		jsonData += '"'+WorldState.DOORS+'": '                + JSON.stringify(globalState.doors) +',\n';
		jsonData += '"'+WorldState.SCRIPTS+'": '              + JSON.stringify(globalState.scripts) +',\n';
		jsonData += '"'+WorldState.QUESTS+'": '               + JSON.stringify(globalState.quests) +',\n';
		jsonData += '"'+WorldState.DUNGEON+'": '              + JSON.stringify(globalState.dungeon) +',\n';
		jsonData += '"'+WorldState.TRANSITIONSTACK+'": '      + JSON.stringify(globalState.transitionStack) +',\n';
		jsonData += '"'+WorldState.AVAILABLEROOMS+'": '       + JSON.stringify(globalState.availableRooms) +',\n';
		jsonData += '"'+WorldState.AVAILABLETILESETS+'": '    + JSON.stringify(globalState.availableTilesets) +',\n';
		jsonData += '"'+WorldState.CURRENTLEVEL+'": '         + JSON.stringify(globalState.currentLevel) +',\n';
		jsonData += '"'+WorldState.ROOMASSIGNMENT+'": '       + JSON.stringify(globalState.roomAssignment) +',\n';
		jsonData += '"'+WorldState.INVENTORY+'": '            + JSON.stringify(globalState.inventory) +',\n';
		jsonData += '"'+WorldState.SAVEGAMENAME+'": '			+ '"savegame-'+`${globalState.gameTime}`+'"';
		jsonData += '}';
		/* tslint:enable: max-line-length */

		console.log(this.scene.scene);

		this.download(jsonData, 'json.txt', 'text/plain');
	}

	async loadJSONFile(element: HTMLInputElement): Promise<any> {
		let savegame: File;
		let savegameJSON: any;
		if(!element.files) {
			return new Promise<any>((reject) => {reject("element.files is undefined")});
		}

		savegame = element.files[0];
		console.log( 'loading file '+element.files[0].name);

		const saveStr: string = await savegame.text();

		if(isJSON(saveStr)) {
			savegameJSON = JSON.parse(saveStr);
			// console.log(saveStr);
			// console.log(savegameJSON)
			return new Promise<any>((resolve) => {resolve(savegameJSON)});
		}

		console.log(element.files[0].name+' is not a json file.');
		console.log(saveStr);
		return new Promise<any>((reject) => {reject("File is not a json file.")});
	}

	async load(savegame: any): Promise<any> {


		/* tslint:disable: max-line-length */
		if (savegame.playerCharacter) 	localStorage.setItem(WorldState.PLAYERCHARACTER, JSON.stringify(savegame.playerCharacter));
		if (savegame.gameTime) 			localStorage.setItem(WorldState.GAMETIME, `${savegame.gameTime}`);
		if (savegame.npcs) 				localStorage.setItem(WorldState.NPCS, JSON.stringify(savegame.npcs));
		if (savegame.enemies) 			localStorage.setItem(WorldState.ENEMIES, JSON.stringify(savegame.enemies));
		if (savegame.doors) 			localStorage.setItem(WorldState.DOORS, JSON.stringify(savegame.doors));
		if (savegame.scripts)			localStorage.setItem(WorldState.SCRIPTS, JSON.stringify(savegame.scripts));
		if (savegame.quests) 			localStorage.setItem(WorldState.QUESTS, JSON.stringify(savegame.quests));
		if (savegame.dungeon)			localStorage.setItem(WorldState.DUNGEON, JSON.stringify(savegame.dungeon));
		if (savegame.transitionStack) 	localStorage.setItem(WorldState.TRANSITIONSTACK, JSON.stringify(savegame.transitionStack));
		if (savegame.availableRooms) 	localStorage.setItem(WorldState.AVAILABLEROOMS, JSON.stringify(savegame.availableRooms));
		if (savegame.availableTilesets)	localStorage.setItem(WorldState.AVAILABLETILESETS, JSON.stringify(savegame.availableTilesets));
		if (savegame.currentLevel)		localStorage.setItem(WorldState.CURRENTLEVEL, JSON.stringify(savegame.currentLevel));
		if (savegame.roomAssignment)	localStorage.setItem(WorldState.ROOMASSIGNMENT, JSON.stringify(savegame.roomAssignment));
		if (savegame.inventory)			localStorage.setItem(WorldState.INVENTORY, JSON.stringify(savegame.inventory));
		if (savegame.saveGameName)		localStorage.setItem(WorldState.SAVEGAMENAME,JSON.stringify(savegame.saveGameName));
		/* tslint:enable: max-line-length */

		// globalState.loadState();
		globalState.loadGame = true;
		this.scene.scene.start('RoomPreloaderScene');
		this.scene.resume();

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