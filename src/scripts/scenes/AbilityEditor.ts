import 'phaser';
import firebase from 'firebase';

const SCALE = 2;

export default class AbilityEditor extends Phaser.Scene {
	database: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;

	constructor() {
		super({ key: 'AbilityEditor' });
		this.database = firebase.firestore().collection('abilities');
	}

	preload() {}

	create() {}
}
