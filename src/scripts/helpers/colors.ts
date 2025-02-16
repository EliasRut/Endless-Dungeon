import { CHARACTER_SPRITE_HEIGHT, CHARACTER_SPRITE_WIDTH } from './constants';

const RGB_MAX_VALUE = 255;

export const rgbToHex = (rgb: string | number) => {
	let hex = Number(rgb).toString(16);
	if (hex.length < 2) {
		hex = '0' + hex;
	}
	return hex;
};

export interface RGBColor {
	r: number;
	g: number;
	b: number;
}

export const fullColorHex = (r: string | number, g: string | number, b: string | number) => {
	const red = rgbToHex(r);
	const green = rgbToHex(g);
	const blue = rgbToHex(b);
	return red + green + blue;
};

export const hexToRgb: (hex: string) => RGBColor | null = (hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
};

export const hexToSourceRgb = (hex: string) => {
	const rgb = hexToRgb(hex);
	if (!rgb) return null;
	return { sr: rgb.r, sg: rgb.g, sb: rgb.b };
};

export const hexToTargetRgb = (hex: string) => {
	const rgb = hexToRgb(hex);
	if (!rgb) return null;
	return { tr: rgb.r, tg: rgb.g, tb: rgb.b };
};

export const rgbToTargetRgb = (rgb: RGBColor) => {
	return { tr: rgb.r, tg: rgb.g, tb: rgb.b };
};

export interface BodyPalleteData {
	baseColor1: string;
	baseColor2: string;
	outlineColor: string;
	eyeColor: string;
}

export type BodyPalleteColor = 'baseColor1' | 'baseColor2' | 'outlineColor' | 'eyeColor';

export interface HairPalleteData {
	color1: string;
	color2: string;
	color3: string;
	color4: string;
}

export type HairPalleteColor = 'color1' | 'color2' | 'color3' | 'color4';

export interface ShirtPalleteData {
	color1: string;
	color2: string;
	color3: string;
}

export interface PantsPalleteData {
	color1: string;
	color2: string;
	color3: string;
}

export interface PalleteLookupEntry {
	sr: number;
	sg: number;
	sb: number;
	tr?: number;
	tg?: number;
	tb?: number;
}

export interface BodyPalleteLookupData {
	baseColor1: PalleteLookupEntry;
	baseColor2: PalleteLookupEntry;
	outlineColor: PalleteLookupEntry;
	eyeColor: PalleteLookupEntry;
}

export interface FourColorPalleteLookupData {
	color1: PalleteLookupEntry;
	color2: PalleteLookupEntry;
	color3: PalleteLookupEntry;
	color4: PalleteLookupEntry;
}

export const bodyPalleteColors = {
	'body-1': {
		baseColor1: '9e8255',
		baseColor2: '67513d',
		outlineColor: '211c12',
		eyeColor: '000000',
	},
};

export const hairPalleteColors = {
	'hair-1': {
		color1: 'b4b4b4',
		color2: '6e6e6e',
		color3: '4b4b4b',
		color4: '1a1a1a',
	},
	'hair-2': {
		color1: 'f37436',
		color2: 'bf470b',
		color3: '75210f',
		color4: '401209',
	},
};

export const shirtPalleteColors = {
	'shirt-1': {
		color1: '407c50',
		color2: '204b30',
		color3: '001b10',
		color4: 'ffffff',
	},
};

export const pantsPalleteColors = {
	'pants-1': {
		color1: '4e416b',
		color2: '201c30',
		color3: '473022',
		color4: '0c0f14',
	},
};

export const hexRegex = /^[0-9a-f]{6}$/i;

export interface ColorPallete {
	[name: string]: PalleteLookupEntry;
}

export const replaceColors = (
	canvasTexture: Phaser.Textures.CanvasTexture,
	sourceImage: CanvasImageSource,
	pallete: ColorPallete
) => {
	const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
	const context = canvas.getContext('2d')!;

	context.drawImage(sourceImage, 0, 0);

	const imageData = context.getImageData(0, 0, CHARACTER_SPRITE_WIDTH, CHARACTER_SPRITE_HEIGHT);

	const pixelArray = imageData.data;

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

		Object.keys(pallete).forEach((palleteName) => {
			const { sr, sg, sb, tr, tg, tb } = pallete[palleteName];
			if (tr === undefined || tg === undefined || tb === undefined) {
				return;
			}
			if (r === sr && g === sg && b === sb && alpha === RGB_MAX_VALUE) {
				pixelArray[--index] = tb;
				pixelArray[--index] = tg;
				pixelArray[--index] = tr;
			}
		});
	}

	context.putImageData(imageData, 0, 0);
	return canvasTexture.getSourceImage() as HTMLCanvasElement;
};

export const darkenColor: (color: RGBColor, factor: number) => RGBColor = (color, factor) => {
	const newLightness = 1 - factor;
	return {
		r: Math.round(color.r * newLightness),
		g: Math.round(color.g * newLightness),
		b: Math.round(color.b * newLightness),
	};
};

export const brightenColor: (color: RGBColor, factor: number) => RGBColor = (color, factor) => {
	const newLightness = 1 + factor;
	return {
		r: Math.min(RGB_MAX_VALUE, Math.round(color.r * newLightness)),
		g: Math.min(RGB_MAX_VALUE, Math.round(color.g * newLightness)),
		b: Math.min(RGB_MAX_VALUE, Math.round(color.b * newLightness)),
	};
};

export interface PalleteLookup {
	body: ColorPallete;
	hair: ColorPallete;
	shirt: ColorPallete;
	pants: ColorPallete;
}

const DARKENING_FACTORS = {
	bodyDarker: 0.35,
	bodyOutline: 0.8,
	hairDarker: 0.3,
	hairDarkest: 0.6,
	shirtDarker: 0.35,
	shirtOutline: 0.8,
	pantsOutline: 0.8,
	shoesOutline: 0.8,
};

const LIGHTNING_FACTORS = {
	hairLighter: 0.4,
};

export const generatePalleteLookup: (
	bodyTemplate: 'body-1',
	hairTemplate: 'hair-1' | 'hair-2',
	shirtTemplate: 'shirt-1',
	pantsTemplate: 'pants-1'
) => PalleteLookup = (bodyTemplate, hairTemplate, shirtTemplate, pantsTemplate) => {
	const bodyPallete = bodyPalleteColors[bodyTemplate];
	const hairPallete = hairPalleteColors[hairTemplate];
	const shirtPallete = shirtPalleteColors[shirtTemplate];
	const pantsPallete = pantsPalleteColors[pantsTemplate];
	return {
		body: {
			baseColor1: { ...hexToSourceRgb(bodyPallete.baseColor1)! },
			baseColor2: { ...hexToSourceRgb(bodyPallete.baseColor2)! },
			outlineColor: { ...hexToSourceRgb(bodyPallete.outlineColor)! },
			eyeColor: { ...hexToSourceRgb(bodyPallete.eyeColor)! },
		},
		hair: {
			color1: { ...hexToSourceRgb(hairPallete.color1)! },
			color2: { ...hexToSourceRgb(hairPallete.color2)! },
			color3: { ...hexToSourceRgb(hairPallete.color3)! },
			color4: { ...hexToSourceRgb(hairPallete.color4)! },
			bodyColor: { ...hexToSourceRgb(bodyPallete.baseColor2)! },
		},
		shirt: {
			color1: { ...hexToSourceRgb(shirtPallete.color1)! },
			color2: { ...hexToSourceRgb(shirtPallete.color2)! },
			color3: { ...hexToSourceRgb(shirtPallete.color3)! },
			color4: { ...hexToSourceRgb(shirtPallete.color4)! },
		},
		pants: {
			color1: { ...hexToSourceRgb(pantsPallete.color1)! },
			color2: { ...hexToSourceRgb(pantsPallete.color2)! },
			color3: { ...hexToSourceRgb(pantsPallete.color3)! },
			color4: { ...hexToSourceRgb(pantsPallete.color4)! },
		},
	};
};

export interface ColorConfig {
	bodyColor: string;
	eyeColor: string;
	hairColor: string;
	shirtColor1: string;
	shirtColor2: string;
	pantsColor: string;
	shoesColor: string;
}

export interface ColorAndTemplateConfig extends ColorConfig {
	bodyTemplate: string;
	hairTemplate: string;
	shirtTemplate: string;
	pantsTemplate: string;
}

export const generateColorConversionTable: (
	palleteLookup: PalleteLookup,
	config: ColorConfig
) => PalleteLookup = (palleteLookup, config) => {
	const conversionTable = { ...palleteLookup };

	const bodyBaseRgb = hexToRgb(config.bodyColor)!;
	const eyeBaseRgb = hexToRgb(config.eyeColor)!;
	const hairBaseRgb = hexToRgb(config.hairColor)!;
	const shirt1BaseRgb = hexToRgb(config.shirtColor1)!;
	const shirt2BaseRgb = hexToRgb(config.shirtColor2)!;
	const pantsBaseRgb = hexToRgb(config.pantsColor)!;
	const shoesBaseRgb = hexToRgb(config.shoesColor)!;

	// Body styling
	conversionTable.body.baseColor1 = {
		...conversionTable.body.baseColor1,
		...rgbToTargetRgb(bodyBaseRgb),
	};
	conversionTable.body.baseColor2 = {
		...conversionTable.body.baseColor2,
		...rgbToTargetRgb(darkenColor(bodyBaseRgb, DARKENING_FACTORS.bodyDarker)),
	};
	conversionTable.body.eyeColor = {
		...conversionTable.body.eyeColor,
		...rgbToTargetRgb(eyeBaseRgb),
	};
	conversionTable.body.outlineColor = {
		...conversionTable.body.outlineColor,
		...rgbToTargetRgb(darkenColor(bodyBaseRgb, DARKENING_FACTORS.bodyOutline)),
	};

	// Hair styling
	conversionTable.hair.color1 = {
		...conversionTable.hair.color1,
		...rgbToTargetRgb(brightenColor(hairBaseRgb, LIGHTNING_FACTORS.hairLighter)),
	};
	conversionTable.hair.color2 = {
		...conversionTable.hair.color2,
		...rgbToTargetRgb(hairBaseRgb),
	};
	conversionTable.hair.color3 = {
		...conversionTable.hair.color3,
		...rgbToTargetRgb(darkenColor(hairBaseRgb, DARKENING_FACTORS.hairDarker)),
	};
	conversionTable.hair.color4 = {
		...conversionTable.hair.color4,
		...rgbToTargetRgb(darkenColor(hairBaseRgb, DARKENING_FACTORS.hairDarkest)),
	};
	conversionTable.hair.bodyColor = {
		...conversionTable.body.baseColor2,
		...rgbToTargetRgb(darkenColor(bodyBaseRgb, DARKENING_FACTORS.bodyDarker)),
	};

	// Shirt styling
	conversionTable.shirt.color1 = {
		...conversionTable.shirt.color1,
		...rgbToTargetRgb(shirt1BaseRgb),
	};
	conversionTable.shirt.color2 = {
		...conversionTable.shirt.color2,
		...rgbToTargetRgb(darkenColor(shirt1BaseRgb, DARKENING_FACTORS.shirtDarker)),
	};
	conversionTable.shirt.color3 = {
		...conversionTable.shirt.color3,
		...rgbToTargetRgb(darkenColor(shirt1BaseRgb, DARKENING_FACTORS.shirtOutline)),
	};
	conversionTable.shirt.color4 = {
		...conversionTable.shirt.color4,
		...rgbToTargetRgb(shirt2BaseRgb),
	};

	// Pants styling
	conversionTable.pants.color1 = {
		...conversionTable.pants.color1,
		...rgbToTargetRgb(pantsBaseRgb),
	};
	conversionTable.pants.color2 = {
		...conversionTable.pants.color2,
		...rgbToTargetRgb(darkenColor(pantsBaseRgb, DARKENING_FACTORS.pantsOutline)),
	};

	// Shoes styling
	conversionTable.pants.color3 = {
		...conversionTable.pants.color3,
		...rgbToTargetRgb(shoesBaseRgb),
	};
	conversionTable.pants.color4 = {
		...conversionTable.pants.color4,
		...rgbToTargetRgb(darkenColor(shoesBaseRgb, DARKENING_FACTORS.shoesOutline)),
	};

	return conversionTable;
};

export const generateColorReplacedTextures = (
	textures: Phaser.Textures.TextureManager,
	palleteLookup: PalleteLookup,
	config: ColorAndTemplateConfig
) => {
	['body', 'hair', 'shirt', 'pants'].forEach((texture) => {
		textures.get(`${texture}-temp`)?.destroy();
		textures.get(`${texture}-canvas`)?.destroy();
	});

	textures.addCanvas(
		'body-temp',
		replaceColors(
			textures.createCanvas('body-canvas', CHARACTER_SPRITE_WIDTH, CHARACTER_SPRITE_HEIGHT)!,
			textures.get(config.bodyTemplate).getSourceImage() as any,
			palleteLookup.body as any
		)
	);
	textures.addCanvas(
		'hair-temp',
		replaceColors(
			textures.createCanvas('hair-canvas', CHARACTER_SPRITE_WIDTH, CHARACTER_SPRITE_HEIGHT)!,
			textures.get(config.hairTemplate).getSourceImage() as any,
			palleteLookup.hair as any
		)
	);
	textures.addCanvas(
		'shirt-temp',
		replaceColors(
			textures.createCanvas('shirt-canvas', CHARACTER_SPRITE_WIDTH, CHARACTER_SPRITE_HEIGHT)!,
			textures.get(config.shirtTemplate).getSourceImage() as any,
			palleteLookup.shirt as any
		)
	);
	textures.addCanvas(
		'pants-temp',
		replaceColors(
			textures.createCanvas('pants-canvas', CHARACTER_SPRITE_WIDTH, CHARACTER_SPRITE_HEIGHT)!,
			textures.get(config.pantsTemplate).getSourceImage() as any,
			palleteLookup.pants as any
		)
	);
};

export const getColorReplacedImageSource = (textures: Phaser.Textures.TextureManager) => {
	textures.get(`npc-canvas`)?.destroy();
	textures.get(`npc-temp`)?.destroy();

	const canvasTexture = textures.createCanvas(
		'npc-canvas',
		CHARACTER_SPRITE_WIDTH,
		CHARACTER_SPRITE_HEIGHT
	);
	const canvas = canvasTexture!.getSourceImage() as HTMLCanvasElement;
	const context = canvas.getContext('2d')!;
	context.drawImage(textures.get('body-temp').getSourceImage() as any, 0, 0);
	context.drawImage(textures.get('hair-temp').getSourceImage() as any, 0, 0);
	context.drawImage(textures.get('shirt-temp').getSourceImage() as any, 0, 0);
	context.drawImage(textures.get('pants-temp').getSourceImage() as any, 0, 0);

	return canvasTexture!.getSourceImage() as HTMLImageElement;
};
