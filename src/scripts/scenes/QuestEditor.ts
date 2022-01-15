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
	questGiverDropdownElement: HTMLSelectElement;

	// Quest Data
	questNameElement: HTMLInputElement;
	questGiverElement: HTMLInputElement;
	questDescriptionElement: HTMLTextAreaElement;
	questPreconditionsElement: HTMLInputElement;
	// questPreconditionsElement: HTMLInputElement;

	constructor() {
		super({ key: 'QuestEditor' });
		this.database = firebase.firestore().collection('quests');

		this.questsDropdownElement = document.getElementById('questDropdown') as HTMLSelectElement;
		this.loadButtonElement = document.getElementById('loadQuestButton') as HTMLButtonElement;
		this.questGiverDropdownElement = document.getElementById('questGiver') as HTMLSelectElement;

		// Quest Data
		this.questNameElement = document.getElementById('questName') as HTMLInputElement;
		this.questGiverElement = document.getElementById('questGiver') as HTMLInputElement;
		this.questDescriptionElement = document.getElementById(
			'questDescription'
		) as HTMLTextAreaElement;
		this.questPreconditionsElement = document.getElementById(
			'questPreconditions'
		) as HTMLInputElement;
	}

	populateFromDatabase(databaseSelectedQuest: Quest) {
		this.questNameElement.value = databaseSelectedQuest.name;
		this.questNameElement.value = databaseSelectedQuest.name;
		this.questNameElement.value = databaseSelectedQuest.name;
		this.questNameElement.value = databaseSelectedQuest.name;
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
			const questName = this.loadButtonElement.value;

			const selectedQuestDoc = await this.database.doc(questName).get();
			const databaseSelectedQuest = selectedQuestDoc.data() as Quest;
			this.populateFromDatabase(databaseSelectedQuest);
		};
	}
}
