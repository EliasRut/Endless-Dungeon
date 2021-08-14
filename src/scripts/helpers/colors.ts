import {
	CHARACTER_SPRITE_HEIGHT,
	CHARACTER_SPRITE_WIDTH
} from './constants';

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
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
};

export const hexToSourceRgb = (hex: string) => {
	const rgb = hexToRgb(hex);
	if (!rgb) return null;
	return {sr: rgb.r, sg: rgb.g, sb: rgb.b};
};

export const hexToTargetRgb = (hex: string) => {
	const rgb = hexToRgb(hex);
	if (!rgb) return null;
	return {tr: rgb.r, tg: rgb.g, tb: rgb.b};
};

export const rgbToTargetRgb = (rgb: RGBColor) => {
	return {tr: rgb.r, tg: rgb.g, tb: rgb.b};
}

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
		eyeColor: '000000'
	}
};

export const hairPalleteColors = {
	'hair-1': {
		color1: 'b4b4b4',
		color2: '6e6e6e',
		color3: '4b4b4b',
		color4: '1a1a1a'
	}
};

export const shirtPalleteColors = {
	'shirt-1': {
		color1: '407c50',
		color2: '204b30',
		color3: '001b10',
		color4: 'ffffff'
	}
};

export const pantsPalleteColors = {
	'pants-1': {
		color1: '4e416b',
		color2: '201c30',
		color3: '473022',
		color4: '0c0f14'
	}
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
				const {sr, sg, sb, tr, tg, tb} = pallete[palleteName];
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