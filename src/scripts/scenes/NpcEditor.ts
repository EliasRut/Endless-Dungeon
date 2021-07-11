import 'phaser';
import { BodyPalleteColor, bodyPalleteColors, BodyPalleteLookupData, hexRegex, hexToRgb, hexToSourceRgb, hexToTargetRgb, HairPalleteLookupData, hairPalleteColors, HairPalleteColor } from '../helpers/colors';

const DEPTHS = {
	figureLayer: 1,
	trouserLayer: 2,
	shirtLayer: 3,
	hairLayer: 4,
};

const npcs = {
	'vanya': {
		name: 'Vanya',
		figure: 'male',
		hair: 'buzzcut',
		shirt: 'shirt',
		trousers: 'shorts',
	}
};

export default class NpcEditor extends Phaser.Scene {
	palleteLookup: {
		body: BodyPalleteLookupData,
		hair: HairPalleteLookupData
	} = {
		body: {
			baseColor1: {...hexToSourceRgb(bodyPalleteColors['body-1'].baseColor1)!},
			baseColor2: {...hexToSourceRgb(bodyPalleteColors['body-1'].baseColor2)!},
			outlineColor: {...hexToSourceRgb(bodyPalleteColors['body-1'].outlineColor)!},
			eyeColor: {...hexToSourceRgb(bodyPalleteColors['body-1'].eyeColor)!},
		},
		hair: {
			color1: {...hexToSourceRgb(hairPalleteColors['hair-1'].color1)!},
			color2: {...hexToSourceRgb(hairPalleteColors['hair-1'].color2)!},
			color3: {...hexToSourceRgb(hairPalleteColors['hair-1'].color3)!},
			color4: {...hexToSourceRgb(hairPalleteColors['hair-1'].color4)!}
		}
	};

	npcDropdownElement: HTMLSelectElement;
	bodyDropdownElement: HTMLSelectElement;
	hairDropdownElement: HTMLSelectElement;
	shirtDropdownElement: HTMLSelectElement;
	pantsDropdownElement: HTMLSelectElement;

	// Body colors
	bodyColor1InputElement: HTMLInputElement;
	bodyColor2InputElement: HTMLInputElement;
	bodyOutlineInputElement: HTMLInputElement;
	eyeColorInputElement: HTMLInputElement;

	// Hair colors
	hairColor1InputElement: HTMLInputElement;
	hairColor2InputElement: HTMLInputElement;
	hairColor3InputElement: HTMLInputElement;
	hairColor4InputElement: HTMLInputElement;

	bodyLayer: Phaser.GameObjects.Image;
	hairLayer: Phaser.GameObjects.Image;
	shirtLayer: Phaser.GameObjects.Image;
	pantsLayer: Phaser.GameObjects.Image;

	constructor() {
		super({ key: 'NpcEditor' });
		this.npcDropdownElement = document.getElementById('npcDropdown') as HTMLSelectElement;
		this.bodyDropdownElement = document.getElementById('bodyDropdown') as HTMLSelectElement;
		this.hairDropdownElement = document.getElementById('hairDropdown') as HTMLSelectElement;
		this.shirtDropdownElement = document.getElementById('shirtDropdown') as HTMLSelectElement;
		this.pantsDropdownElement = document.getElementById('pantsDropdown') as HTMLSelectElement;

		this.bodyColor1InputElement = document.getElementById('bodyColor1') as HTMLInputElement;
		this.bodyColor2InputElement = document.getElementById('bodyColor2') as HTMLInputElement;
		this.eyeColorInputElement = document.getElementById('eyeColor') as HTMLInputElement;
		this.bodyOutlineInputElement = document.getElementById('bodyOutlineColor') as HTMLInputElement;

		this.bodyColor1InputElement.value = '#' + bodyPalleteColors['body-1'].baseColor1;
		this.bodyColor2InputElement.value = '#' + bodyPalleteColors['body-1'].baseColor2;
		this.eyeColorInputElement.value = '#' + bodyPalleteColors['body-1'].outlineColor;
		this.bodyOutlineInputElement.value = '#' + bodyPalleteColors['body-1'].eyeColor;

		this.bodyColor1InputElement.onchange = () => this.updateImage();
		this.bodyColor2InputElement.onchange = () => this.updateImage();
		this.eyeColorInputElement.onchange = () => this.updateImage();
		this.bodyOutlineInputElement.onchange = () => this.updateImage();

		this.hairColor1InputElement = document.getElementById('hairColor1') as HTMLInputElement;
		this.hairColor2InputElement = document.getElementById('hairColor2') as HTMLInputElement;
		this.hairColor3InputElement = document.getElementById('hairColor3') as HTMLInputElement;
		this.hairColor4InputElement = document.getElementById('hairColor4') as HTMLInputElement;

		this.hairColor1InputElement.value = '#' + hairPalleteColors['hair-1'].color1;
		this.hairColor2InputElement.value = '#' + hairPalleteColors['hair-1'].color2;
		this.hairColor3InputElement.value = '#' + hairPalleteColors['hair-1'].color3;
		this.hairColor4InputElement.value = '#' + hairPalleteColors['hair-1'].color4;

		this.hairColor1InputElement.onchange = () => this.updateImage();
		this.hairColor2InputElement.onchange = () => this.updateImage();
		this.hairColor3InputElement.onchange = () => this.updateImage();
		this.hairColor4InputElement.onchange = () => this.updateImage();


	}

	preload() {
		// Bodies
		this.load.image('body-1', 'assets/npcSets/bodies/body1.png');

		// Hair
		this.load.image('hair-1', 'assets/npcSets/hair/hair1.png');

		// Shirts
		this.load.image('shirt-1', 'assets/npcSets/shirt/shirt1.png');

		// Pants
		this.load.image('pants-1', 'assets/npcSets/pants/pants1.png');
	}

	create() {
		while (this.npcDropdownElement.firstChild) {
			this.npcDropdownElement.remove(0);
		}

		Object.entries(npcs).forEach(([npcId, npc]) => {
			const newOption = document.createElement('option');
			newOption.value = npcId;
			newOption.innerText = npc.name;
			this.npcDropdownElement.appendChild(newOption);
		});

		this.bodyLayer = this.add.image(160, 120, 'body-1');
		this.pantsLayer = this.add.image(160, 120, 'pants-1');
		this.shirtLayer = this.add.image(160, 120, 'shirt-1');
		this.hairLayer = this.add.image(160, 120, 'hair-1');

		this.updateImage();
	}

	updateImage() {
		if (!hexRegex.test(this.bodyColor1InputElement.value.substr(1))) return;
		if (!hexRegex.test(this.bodyColor2InputElement.value.substr(1))) return;
		if (!hexRegex.test(this.eyeColorInputElement.value.substr(1))) return;
		if (!hexRegex.test(this.bodyOutlineInputElement.value.substr(1))) return;

		if (!hexRegex.test(this.hairColor1InputElement.value.substr(1))) return;
		if (!hexRegex.test(this.hairColor2InputElement.value.substr(1))) return;
		if (!hexRegex.test(this.hairColor3InputElement.value.substr(1))) return;
		if (!hexRegex.test(this.hairColor4InputElement.value.substr(1))) return;

		this.palleteLookup.body.baseColor1 = {
			...this.palleteLookup.body.baseColor1,
			...hexToTargetRgb(this.bodyColor1InputElement.value.substr(1))
		};
		this.palleteLookup.body.baseColor2 = {
			...this.palleteLookup.body.baseColor2,
			...hexToTargetRgb(this.bodyColor2InputElement.value.substr(1))
		};
		this.palleteLookup.body.eyeColor = {
			...this.palleteLookup.body.eyeColor,
			...hexToTargetRgb(this.eyeColorInputElement.value.substr(1))
		};
		this.palleteLookup.body.outlineColor = {
			...this.palleteLookup.body.outlineColor,
			...hexToTargetRgb(this.bodyOutlineInputElement.value.substr(1))
		};

		this.textures.get('body-temp')?.destroy();
		this.textures.get('body-canvas')?.destroy();
		// Create a canvas to draw new image data onto.
		let canvasTexture = this.textures.createCanvas('body-canvas', 320, 240);
		let canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
		let context = canvas.getContext('2d')!;

		let tmpImageData = this.textures.get('body-1').getSourceImage() as any;

		// Copy the sheet.
		context.drawImage(tmpImageData, 0, 0);

		// Get image data from the new sheet.
		let imageData = context.getImageData(0, 0, 320, 240);

		let pixelArray = imageData.data;

		// Iterate through every pixel in the image.
		for (let p = 0; p < pixelArray.length / 4; p++) {
				let index = 4 * p;

				const r = pixelArray[index];
				const g = pixelArray[++index];
				const b = pixelArray[++index];
				const alpha = pixelArray[++index];

				// If this is a transparent pixel, ignore, move on.
				if (alpha === 0) {
					continue;
				}

				Object.keys(this.palleteLookup.body).forEach((palleteName) => {
					const {sr, sg, sb, tr, tg, tb} = this.palleteLookup.body[palleteName as BodyPalleteColor];
					if (tr === undefined || tg === undefined || tb === undefined) {
						return;
					}
					if (r === sr && g === sg && b === sb && alpha === 255) {
						pixelArray[--index] = tb;
						pixelArray[--index] = tg;
						pixelArray[--index] = tr;
					}
				});
		}

		// Put our modified pixel data back into the context.
		context.putImageData(imageData, 0, 0);

		this.textures.addCanvas('body-temp', canvasTexture.getSourceImage() as HTMLCanvasElement);
		this.bodyLayer.setTexture('body-temp');

		this.palleteLookup.hair.color1 = {
			...this.palleteLookup.hair.color1,
			...hexToTargetRgb(this.hairColor1InputElement.value.substr(1))
		};
		this.palleteLookup.hair.color2 = {
			...this.palleteLookup.hair.color2,
			...hexToTargetRgb(this.hairColor2InputElement.value.substr(1))
		};
		this.palleteLookup.hair.color3 = {
			...this.palleteLookup.hair.color3,
			...hexToTargetRgb(this.hairColor3InputElement.value.substr(1))
		};
		this.palleteLookup.hair.color4 = {
			...this.palleteLookup.hair.color4,
			...hexToTargetRgb(this.hairColor4InputElement.value.substr(1))
		};

		this.textures.get('hair-temp')?.destroy();
		this.textures.get('hair-canvas')?.destroy();
		// Create a canvas to draw new image data onto.
		canvasTexture = this.textures.createCanvas('hair-canvas', 320, 240);
		canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
		context = canvas.getContext('2d')!;

		tmpImageData = this.textures.get('hair-1').getSourceImage() as any;

		// Copy the sheet.
		context.drawImage(tmpImageData, 0, 0);

		// Get image data from the new sheet.
		imageData = context.getImageData(0, 0, 320, 240);

		pixelArray = imageData.data;

		// Iterate through every pixel in the image.
		for (let p = 0; p < pixelArray.length / 4; p++) {
				let index = 4 * p;

				const r = pixelArray[index];
				const g = pixelArray[++index];
				const b = pixelArray[++index];
				const alpha = pixelArray[++index];

				// If this is a transparent pixel, ignore, move on.
				if (alpha === 0) {
					continue;
				}

				Object.keys(this.palleteLookup.hair).forEach((palleteName) => {
					const {sr, sg, sb, tr, tg, tb} = this.palleteLookup.hair[palleteName as HairPalleteColor];
					if (tr === undefined || tg === undefined || tb === undefined) {
						return;
					}
					if (r === sr && g === sg && b === sb && alpha === 255) {
						pixelArray[--index] = tb;
						pixelArray[--index] = tg;
						pixelArray[--index] = tr;
					}
				});
		}

		// Put our modified pixel data back into the context.
		context.putImageData(imageData, 0, 0);

		this.textures.addCanvas('hair-temp', canvasTexture.getSourceImage() as HTMLCanvasElement);
		this.hairLayer.setTexture('hair-temp');
	}
}
