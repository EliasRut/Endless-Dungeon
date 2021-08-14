import 'phaser';
import firebase from 'firebase';
import DungeonDoorPreloadScene from './scenes/DungeonDoorPreloadScene';
import DungeonDoorScene from './scenes/DungeonDoorScene';
import MainScene from './scenes/MainScene';
import MapEditor from './scenes/MapEditor';
import PreloadScene from './scenes/PreloadScene';
import RoomPreloaderScene from './scenes/RoomPreloaderScene';
import NpcEditor from './scenes/NpcEditor';
import { activeMode, MODE } from './helpers/constants';

const firebaseConfig = {
	apiKey: 'AIzaSyBwHFZ7A9t8rHi4p6r-D2wr5WDrt9O7Yow',
	authDomain: 'project-endless-dungeon.firebaseapp.com',
	projectId: 'project-endless-dungeon',
	storageBucket: 'project-endless-dungeon.appspot.com',
	messagingSenderId: '300065738789',
	appId: '1:300065738789:web:e0a00f15878d7679226fcc'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 360;

const NPC_EDITOR_WIDTH = 320;
const NPC_EDITOR_HEIGHT = 240;

// This is the configuration for Phaser
const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	backgroundColor: '#020202',
	scale: {
		parent: 'phaser-game',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		// zoom: Phaser.Scale.ZOOM_4X,
		width: activeMode === MODE.NPC_EDITOR ? NPC_EDITOR_WIDTH : DEFAULT_WIDTH,
		height: activeMode === MODE.NPC_EDITOR ? NPC_EDITOR_HEIGHT : DEFAULT_HEIGHT
	},
	input: {
			gamepad: true
	},
	scene: activeMode === MODE.GAME ? [
		RoomPreloaderScene,
		PreloadScene,
		MainScene,
		DungeonDoorPreloadScene,
		DungeonDoorScene
	] : (activeMode === MODE.MAP_EDITOR ? [
		RoomPreloaderScene,
		PreloadScene,
		MapEditor
	] : [
		NpcEditor
	]),
	// We are using Phasers arcade physics library
	physics: {
		default: 'arcade',
		arcade: {
			debug: false,
		}
	},
	render: {
		antialias: false,
		pixelArt: true,
		roundPixels: false
	}
};

// This will create the phaser game object once the window finishes loading.
window.addEventListener('load', () => {
	const game = new Phaser.Game(config);
});


