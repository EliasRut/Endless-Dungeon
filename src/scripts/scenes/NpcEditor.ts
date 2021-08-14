import 'phaser';
import {
	bodyPalleteColors,
	hexRegex,
	hexToSourceRgb,
	hexToTargetRgb,
	hairPalleteColors,
	shirtPalleteColors,
	pantsPalleteColors,
	replaceColors,
	hexToRgb,
	rgbToTargetRgb,
	darkenColor,
	brightenColor,
	ColorPallete,
	generatePalleteLookup,
	PalleteLookup,
	generateColorConversionTable
} from '../helpers/colors';
import firebase from 'firebase';
import { NpcData } from '../../../typings/custom';
import { generateColorReplacedTextures } from '../helpers/colors';

const LAYER_WIDTH = 320;
const LAYER_HEIGHT = 240;

const LAYER_X_OFFSET = LAYER_WIDTH / 2;
const LAYER_Y_OFFSET = LAYER_HEIGHT / 2;


const DEPTHS = {
	figureLayer: 1,
	trouserLayer: 2,
	shirtLayer: 3,
	hairLayer: 4,
};

export default class NpcEditor extends Phaser.Scene {
	database: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
	palleteLookup: PalleteLookup;

	npcDropdownElement: HTMLSelectElement;
	loadButton: HTMLButtonElement;

	bodyDropdownElement: HTMLSelectElement;
	hairDropdownElement: HTMLSelectElement;
	shirtDropdownElement: HTMLSelectElement;
	pantsDropdownElement: HTMLSelectElement;

	exportButton: HTMLButtonElement;

	npcIdInputElement: HTMLInputElement;
	npcNameInputElement: HTMLInputElement;

	// Body colors
	bodyColorInputElement: HTMLInputElement;
	eyeColorInputElement: HTMLInputElement;

	// Hair colors
	hairColorInputElement: HTMLInputElement;

	// Shirt colors
	shirtColor1InputElement: HTMLInputElement;
	shirtColor2InputElement: HTMLInputElement;

	// Pants colors
	pantsColorInputElement: HTMLInputElement;
	shoesColorInputElement: HTMLInputElement;

	bodyLayer: Phaser.GameObjects.Image;
	hairLayer: Phaser.GameObjects.Image;
	shirtLayer: Phaser.GameObjects.Image;
	pantsLayer: Phaser.GameObjects.Image;

	constructor() {
		super({ key: 'NpcEditor' });
		this.database = firebase.firestore().collection('npcs');

		this.npcIdInputElement = document.getElementById('npcId') as HTMLInputElement;
		this.npcNameInputElement = document.getElementById('npcName') as HTMLInputElement;

		this.npcDropdownElement = document.getElementById('npcDropdown') as HTMLSelectElement;
		this.bodyDropdownElement = document.getElementById('bodyDropdown') as HTMLSelectElement;
		this.bodyDropdownElement.onchange = () => {
			this.updatePalleteData();
			this.updateImage();
		};
		this.hairDropdownElement = document.getElementById('hairDropdown') as HTMLSelectElement;
		this.hairDropdownElement.onchange = () => {
			this.updatePalleteData();
			this.updateImage();
		};
		this.shirtDropdownElement = document.getElementById('shirtDropdown') as HTMLSelectElement;
		this.shirtDropdownElement.onchange = () => {
			this.updatePalleteData();
			this.updateImage();
		};
		this.pantsDropdownElement = document.getElementById('pantsDropdown') as HTMLSelectElement;
		this.pantsDropdownElement.onchange = () => {
			this.updatePalleteData();
			this.updateImage();
		};

		this.loadButton = document.getElementById('loadNpcButton') as HTMLButtonElement;
		this.loadButton.onclick = () => this.loadNpc();

		this.exportButton = document.getElementById('exportButton') as HTMLButtonElement;
		this.exportButton.onclick = () => this.exportNpc();

		// Body Inputs
		this.bodyColorInputElement = document.getElementById('bodyColor') as HTMLInputElement;
		this.eyeColorInputElement = document.getElementById('eyeColor') as HTMLInputElement;

		this.bodyColorInputElement.value = '#' + bodyPalleteColors['body-1'].baseColor1;
		this.eyeColorInputElement.value = '#' + bodyPalleteColors['body-1'].eyeColor;

		this.bodyColorInputElement.onchange = () => this.updateImage();
		this.eyeColorInputElement.onchange = () => this.updateImage();

		// Hair Inputs
		this.hairColorInputElement = document.getElementById('hairColor') as HTMLInputElement;

		this.hairColorInputElement.value = '#' + hairPalleteColors['hair-1'].color2;

		this.hairColorInputElement.onchange = () => this.updateImage();

		// Shirt Inputs
		this.shirtColor1InputElement = document.getElementById('shirtColor1') as HTMLInputElement;
		this.shirtColor2InputElement = document.getElementById('shirtColor2') as HTMLInputElement;

		this.shirtColor1InputElement.value = '#' + shirtPalleteColors['shirt-1'].color1;
		this.shirtColor2InputElement.value = '#' + shirtPalleteColors['shirt-1'].color4;

		this.shirtColor1InputElement.onchange = () => this.updateImage();
		this.shirtColor2InputElement.onchange = () => this.updateImage();

		// Pants Inputs
		this.pantsColorInputElement = document.getElementById('pantsColor') as HTMLInputElement;
		this.shoesColorInputElement = document.getElementById('shoesColor') as HTMLInputElement;

		this.pantsColorInputElement.value = '#' + pantsPalleteColors['pants-1'].color1;
		this.shoesColorInputElement.value = '#' + pantsPalleteColors['pants-1'].color3;

		this.pantsColorInputElement.onchange = () => this.updateImage();
		this.shoesColorInputElement.onchange = () => this.updateImage();

		this.updatePalleteData();
	}

	updatePalleteData() {
		this.palleteLookup = generatePalleteLookup(
			this.bodyDropdownElement.value! as any,
			this.hairDropdownElement.value! as any,
			this.shirtDropdownElement.value! as any,
			this.pantsDropdownElement.value! as any,
		);
	}

	preload() {
		// Bodies
		this.load.image('body-1', 'assets/npcSets/bodies/body1.png');

		// Hair
		this.load.image('hair-1', 'assets/npcSets/hair/hair1.png');
		this.load.image('hair-2', 'assets/npcSets/hair/hair2.png');

		// Shirts
		this.load.image('shirt-1', 'assets/npcSets/shirt/shirt1.png');

		// Pants
		this.load.image('pants-1', 'assets/npcSets/pants/pants1.png');
	}

	async loadNpcList() {
		while (this.npcDropdownElement.hasChildNodes()) {
			this.npcDropdownElement.removeChild(this.npcDropdownElement.childNodes[0]);
		}

		const query = await this.database.get();
		const defaultOption = document.createElement('option');
		defaultOption.value = 'new';
		defaultOption.innerText = 'New Npc';
		this.npcDropdownElement.appendChild(defaultOption);

		query.docs.forEach((doc) => {
			const newOption = document.createElement('option');
			newOption.value = doc.id;
			newOption.innerText = doc.get('name');
			this.npcDropdownElement.appendChild(newOption);
		});
	}

	async loadNpc() {
		const npcId = this.npcDropdownElement.value;
		if (!npcId || npcId === 'new') {
			return;
		}
		const npcDoc = await this.database.doc(npcId).get();
		const npc = npcDoc.data() as NpcData;

		this.npcIdInputElement.value = npcDoc.id;
		this.npcNameInputElement.value = npc.name;
		this.bodyColorInputElement.value = '#' + npc.bodyColor;
		this.eyeColorInputElement.value = '#' + npc.eyeColor;
		this.hairColorInputElement.value = '#' + npc.hairColor;
		this.shirtColor1InputElement.value = '#' + npc.shirtColor1;
		this.shirtColor2InputElement.value = '#' + npc.shirtColor2;
		this.pantsColorInputElement.value = '#' + npc.pantsColor;
		this.shoesColorInputElement.value = '#' + npc.shoesColor;
		this.bodyDropdownElement.value = npc.bodyTemplate;
		this.hairDropdownElement.value = npc.hairTemplate;
		this.shirtDropdownElement.value = npc.shirtTemplate;
		this.pantsDropdownElement.value = npc.pantsTemplate;

		this.updateImage();
	}

	async exportNpc() {
		if (!this.npcIdInputElement.value || !this.npcNameInputElement.value) {
			alert('Npc needs an ID and a name.');
		}

		await this.database.doc(this.npcIdInputElement.value!).set({
			name: this.npcNameInputElement.value,
			bodyColor: this.bodyColorInputElement.value.substr(1),
			eyeColor: this.eyeColorInputElement.value.substr(1),
			hairColor: this.hairColorInputElement.value.substr(1),
			shirtColor1: this.shirtColor1InputElement.value.substr(1),
			shirtColor2: this.shirtColor2InputElement.value.substr(1),
			pantsColor: this.pantsColorInputElement.value.substr(1),
			shoesColor: this.shoesColorInputElement.value.substr(1),
			bodyTemplate: this.bodyDropdownElement.value,
			hairTemplate: this.hairDropdownElement.value,
			shirtTemplate: this.shirtDropdownElement.value,
			pantsTemplate: this.pantsDropdownElement.value,
		});

		await this.loadNpcList();
		this.npcDropdownElement.value = this.npcIdInputElement.value;
	}

	create() {
		while (this.npcDropdownElement.firstChild) {
			this.npcDropdownElement.remove(0);
		}

		this.loadNpcList();

		this.bodyLayer = this.add.image(
			LAYER_X_OFFSET,
			LAYER_Y_OFFSET,
			'body-1'
		);
		this.pantsLayer = this.add.image(
			LAYER_X_OFFSET,
			LAYER_Y_OFFSET,
			'pants-1'
		);
		this.shirtLayer = this.add.image(
			LAYER_X_OFFSET,
			LAYER_Y_OFFSET,
			'shirt-1'
		);
		this.hairLayer = this.add.image(
			LAYER_X_OFFSET,
			LAYER_Y_OFFSET,
			'hair-1'
		);

		this.updateImage();
	}

	updateImage() {
		if (!hexRegex.test(this.bodyColorInputElement.value.substr(1))) return;
		if (!hexRegex.test(this.eyeColorInputElement.value.substr(1))) return;

		if (!hexRegex.test(this.hairColorInputElement.value.substr(1))) return;

		const colorConfig = {
			bodyColor: this.bodyColorInputElement.value.substr(1),
			eyeColor: this.eyeColorInputElement.value.substr(1),
			hairColor: this.hairColorInputElement.value.substr(1),
			shirtColor1: this.shirtColor1InputElement.value.substr(1),
			shirtColor2: this.shirtColor2InputElement.value.substr(1),
			pantsColor: this.pantsColorInputElement.value.substr(1),
			shoesColor: this.shoesColorInputElement.value.substr(1)
		};

		this.palleteLookup = generateColorConversionTable(this.palleteLookup, colorConfig);

		generateColorReplacedTextures(
			this.textures,
			this.palleteLookup,
			{
				...colorConfig,
				bodyTemplate: this.bodyDropdownElement.value!,
				hairTemplate: this.hairDropdownElement.value!,
				shirtTemplate: this.shirtDropdownElement.value!,
				pantsTemplate: this.pantsDropdownElement.value!
			}
		);

		this.bodyLayer.setTexture('body-temp');
		this.hairLayer.setTexture('hair-temp');
		this.shirtLayer.setTexture('shirt-temp');
		this.pantsLayer.setTexture('pants-temp');
	}
}