import firebase from 'firebase';
import { DatabaseRoom, ItemsPositioning, NpcPositioning, Quest } from '../../../typings/custom';

export default class QuestEditor extends Phaser.Scene {
	database: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;

	fileData: Partial<Quest> = {};
	questName: string = '';

	npcTokens: Phaser.GameObjects.Image[];
	npcs: NpcPositioning[];
	itemTokens: Phaser.GameObjects.Sprite[];
	items: ItemsPositioning[];

	// Details Dialog elements
	questsDropdownElement: HTMLSelectElement;
	loadButtonElement: HTMLButtonElement;
	questNameElement: HTMLInputElement;
	questGiverDropdownElement: HTMLSelectElement;

	constructor() {
		super({ key: 'QuestEditor' });
		this.database = firebase.firestore().collection('quests');

		this.questsDropdownElement = document.getElementById('questDropdown') as HTMLSelectElement;
		this.loadButtonElement = document.getElementById('loadQuestButton') as HTMLButtonElement;
		this.questNameElement = document.getElementById('questName') as HTMLInputElement;
		this.questGiverDropdownElement = document.getElementById('questGiver') as HTMLSelectElement;
	}

	populateFromDatabase(databaseSelectedQuest: Quest) {
		const selectedQuest = this.fileData;
		this.questNameElement.value = selectedQuest.name;

		this.npcs = selectedQuest.npcs || [];
		this.items = selectedQuest.items || [];

		this.npcTokens.forEach((token) => {
			token.destroy(true);
		});
		this.npcTokens = [];
	}

	async loadNpcList() {
		while (this.questGiverDropdownElement.hasChildNodes()) {
			this.questGiverDropdownElement.removeChild(this.questGiverDropdownElement.childNodes[0]);
		}

		const query = await this.database.get();
		const defaultOption = document.createElement('option');
		defaultOption.value = 'new';
		defaultOption.innerText = 'New Npc';
		this.questGiverDropdownElement.appendChild(defaultOption);

		query.docs.forEach((doc) => {
			const newOption = document.createElement('option');
			newOption.value = doc.id;
			newOption.innerText = doc.get('name');
			this.questGiverDropdownElement.appendChild(newOption);
		});
	}

	preload() {
		this.load.image('body-1', 'assets/npcSets/bodies/body1.png');
	}

	create() {
		while (this.questGiverDropdownElement.firstChild) {
			this.questGiverDropdownElement.remove(0);
		}

		// this.loadNpcList();

		this.database.get().then((query) => {
			query.forEach((questDoc) => {
				const newOption = document.createElement('option');
				newOption.value = questDoc.id;
				newOption.innerText = questDoc.id;
				this.questsDropdownElement.appendChild(newOption);
			});
		});

		this.loadButtonElement.onclick = async () => {
			const roomName = this.loadButtonElement.value;

			const selectedRoomDoc = await this.database.doc(roomName).get();
			const databaseSelectedRoom = selectedRoomDoc.data() as DatabaseRoom;
			this.populateFromDatabase(databaseSelectedRoom);
		};
	}
}
