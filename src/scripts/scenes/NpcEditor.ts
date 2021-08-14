import 'phaser';
import {
	bodyPalleteColors,
	BodyPalleteLookupData,
	hexRegex,
	hexToSourceRgb,
	hexToTargetRgb,
	FourColorPalleteLookupData,
	hairPalleteColors,
	shirtPalleteColors,
	pantsPalleteColors,
	replaceColors,
	hexToRgb,
	rgbToTargetRgb,
	darkenColor,
	brightenColor,
	ColorPallete
} from '../helpers/colors';

const LAYER_WIDTH = 320;
const LAYER_HEIGHT = 240;

const LAYER_X_OFFSET = LAYER_WIDTH / 2;
const LAYER_Y_OFFSET = LAYER_HEIGHT / 2;

const DARKENING_FACTORS = {
	bodyDarker: 0.35,
	bodyOutline: 0.8,
	hairDarker: 0.3,
	hairDarkest: 0.6,
	shirtDarker: 0.35,
	shirtOutline: 0.8,
	pantsOutline: 0.8,
	shoesOutline: 0.8
};

const LIGHTNING_FACTORS = {
	hairLighter: 0.4
};

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
		body: ColorPallete,
		hair: ColorPallete,
		shirt: ColorPallete,
		pants: ColorPallete
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
			color4: {...hexToSourceRgb(hairPalleteColors['hair-1'].color4)!},
			bodyColor: {...hexToSourceRgb(bodyPalleteColors['body-1'].baseColor2)!}
		},
		shirt: {
			color1: {...hexToSourceRgb(shirtPalleteColors['shirt-1'].color1)!},
			color2: {...hexToSourceRgb(shirtPalleteColors['shirt-1'].color2)!},
			color3: {...hexToSourceRgb(shirtPalleteColors['shirt-1'].color3)!},
			color4: {...hexToSourceRgb(shirtPalleteColors['shirt-1'].color4)!}
		},
		pants: {
			color1: {...hexToSourceRgb(pantsPalleteColors['pants-1'].color1)!},
			color2: {...hexToSourceRgb(pantsPalleteColors['pants-1'].color2)!},
			color3: {...hexToSourceRgb(pantsPalleteColors['pants-1'].color3)!},
			color4: {...hexToSourceRgb(pantsPalleteColors['pants-1'].color4)!}
		}
	};

	npcDropdownElement: HTMLSelectElement;
	bodyDropdownElement: HTMLSelectElement;
	hairDropdownElement: HTMLSelectElement;
	shirtDropdownElement: HTMLSelectElement;
	pantsDropdownElement: HTMLSelectElement;

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
		this.npcDropdownElement = document.getElementById('npcDropdown') as HTMLSelectElement;
		this.bodyDropdownElement = document.getElementById('bodyDropdown') as HTMLSelectElement;
		this.hairDropdownElement = document.getElementById('hairDropdown') as HTMLSelectElement;
		this.shirtDropdownElement = document.getElementById('shirtDropdown') as HTMLSelectElement;
		this.pantsDropdownElement = document.getElementById('pantsDropdown') as HTMLSelectElement;

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

		const bodyBaseRgb = hexToRgb(this.bodyColorInputElement.value.substr(1))!;

		this.palleteLookup.body.baseColor1 = {
			...this.palleteLookup.body.baseColor1,
			...rgbToTargetRgb(bodyBaseRgb)
		};
		this.palleteLookup.body.baseColor2 = {
			...this.palleteLookup.body.baseColor2,
			...rgbToTargetRgb(darkenColor(bodyBaseRgb, DARKENING_FACTORS.bodyDarker))
		};
		this.palleteLookup.body.eyeColor = {
			...this.palleteLookup.body.eyeColor,
			...hexToTargetRgb(this.eyeColorInputElement.value.substr(1))
		};
		this.palleteLookup.body.outlineColor = {
			...this.palleteLookup.body.outlineColor,
			...rgbToTargetRgb(darkenColor(bodyBaseRgb, DARKENING_FACTORS.bodyOutline))
		};

		this.textures.get('body-temp')?.destroy();
		this.textures.get('body-canvas')?.destroy();

		this.textures.addCanvas('body-temp', replaceColors(
				this.textures.createCanvas('body-canvas', LAYER_WIDTH, LAYER_HEIGHT),
				this.textures.get('body-1').getSourceImage() as any,
				this.palleteLookup.body as any
		));
		this.bodyLayer.setTexture('body-temp');

		const hairBaseRgb = hexToRgb(this.hairColorInputElement.value.substr(1))!;

		// Hair styling
		this.palleteLookup.hair.color1 = {
			...this.palleteLookup.hair.color1,
			...rgbToTargetRgb(brightenColor(hairBaseRgb, LIGHTNING_FACTORS.hairLighter))
		};
		this.palleteLookup.hair.color2 = {
			...this.palleteLookup.hair.color2,
			...rgbToTargetRgb(hairBaseRgb)
		};
		this.palleteLookup.hair.color3 = {
			...this.palleteLookup.hair.color3,
			...rgbToTargetRgb(darkenColor(hairBaseRgb, DARKENING_FACTORS.hairDarker))
		};
		this.palleteLookup.hair.color4 = {
			...this.palleteLookup.hair.color4,
			...rgbToTargetRgb(darkenColor(hairBaseRgb, DARKENING_FACTORS.hairDarkest))
		};
		this.palleteLookup.hair.bodyColor = {
			...this.palleteLookup.body.baseColor2,
			...rgbToTargetRgb(darkenColor(bodyBaseRgb, DARKENING_FACTORS.bodyDarker))
		};

		this.textures.get('hair-temp')?.destroy();
		this.textures.get('hair-canvas')?.destroy();

		this.textures.addCanvas('hair-temp', replaceColors(
				this.textures.createCanvas('hair-canvas', LAYER_WIDTH, LAYER_HEIGHT),
				this.textures.get('hair-1').getSourceImage() as any,
				this.palleteLookup.hair as any
		));
		this.hairLayer.setTexture('hair-temp');

		const shirt1BaseRgb = hexToRgb(this.shirtColor1InputElement.value.substr(1))!;
		const shirt2BaseRgb = hexToRgb(this.shirtColor2InputElement.value.substr(1))!;

		// Shirt styling
		this.palleteLookup.shirt.color1 = {
			...this.palleteLookup.shirt.color1,
			...rgbToTargetRgb(shirt1BaseRgb)
		};
		this.palleteLookup.shirt.color2 = {
			...this.palleteLookup.shirt.color2,
			...rgbToTargetRgb(darkenColor(shirt1BaseRgb, DARKENING_FACTORS.shirtDarker))
		};
		this.palleteLookup.shirt.color3 = {
			...this.palleteLookup.shirt.color3,
			...rgbToTargetRgb(darkenColor(shirt1BaseRgb, DARKENING_FACTORS.shirtOutline))
		};
		this.palleteLookup.shirt.color4 = {
			...this.palleteLookup.shirt.color4,
			...rgbToTargetRgb(shirt2BaseRgb)
		};

		this.textures.get('shirt-temp')?.destroy();
		this.textures.get('shirt-canvas')?.destroy();

		this.textures.addCanvas('shirt-temp', replaceColors(
				this.textures.createCanvas('shirt-canvas', LAYER_WIDTH, LAYER_HEIGHT),
				this.textures.get('shirt-1').getSourceImage() as any,
				this.palleteLookup.shirt as any
		));
		this.shirtLayer.setTexture('shirt-temp');

		const pantsBaseRgb = hexToRgb(this.pantsColorInputElement.value.substr(1))!;
		const shoesBaseRgb = hexToRgb(this.shoesColorInputElement.value.substr(1))!;

		// Pants styling
		this.palleteLookup.pants.color1 = {
			...this.palleteLookup.pants.color1,
			...rgbToTargetRgb(pantsBaseRgb)
		};
		this.palleteLookup.pants.color2 = {
			...this.palleteLookup.pants.color2,
			...rgbToTargetRgb(darkenColor(pantsBaseRgb, DARKENING_FACTORS.pantsOutline))
		};
		this.palleteLookup.pants.color3 = {
			...this.palleteLookup.pants.color3,
			...rgbToTargetRgb(shoesBaseRgb)
		};
		this.palleteLookup.pants.color4 = {
			...this.palleteLookup.pants.color4,
			...rgbToTargetRgb(darkenColor(shoesBaseRgb, DARKENING_FACTORS.shoesOutline))
		};

		this.textures.get('pants-temp')?.destroy();
		this.textures.get('pants-canvas')?.destroy();

		this.textures.addCanvas('pants-temp', replaceColors(
				this.textures.createCanvas('pants-canvas', LAYER_WIDTH, LAYER_HEIGHT),
				this.textures.get('pants-1').getSourceImage() as any,
				this.palleteLookup.pants as any
		));
		this.pantsLayer.setTexture('pants-temp');
	}
}