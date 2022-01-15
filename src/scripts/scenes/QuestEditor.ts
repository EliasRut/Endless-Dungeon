import firebase from 'firebase';

export default class QuestEditor extends Phaser.Scene {
	database: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
	questGiverDropdownElement: HTMLSelectElement;

	constructor() {
		super({ key: 'QuestEditor' });
		this.questGiverDropdownElement = document.getElementById('questGiver') as HTMLSelectElement;
	}

	preload() {
		this.load.image('body-1', 'assets/npcSets/bodies/body1.png');
	}

	async loadNpcList() {
		while (this.questGiverDropdownElement.hasChildNodes()) {
			this.questGiverDropdownElement.removeChild(this.questGiverDropdownElement.childNodes[0]);
		}

		const query = await this.database.get();
		const defaultOption = document.createElement('option');
		defaultOption.value = 'new';
		defaultOption.innerText = '-';
		this.questGiverDropdownElement.appendChild(defaultOption);

		query.docs.forEach((doc) => {
			const newOption = document.createElement('option');
			newOption.value = doc.id;
			newOption.innerText = doc.get('name');
			this.questGiverDropdownElement.appendChild(newOption);
		});
	}

	create() {
		while (this.questGiverDropdownElement.firstChild) {
			this.questGiverDropdownElement.remove(0);
		}

		this.loadNpcList();
	}
}
