export const rgbToHex = (rgb: string | number) => {
	let hex = Number(rgb).toString(16);
	if (hex.length < 2) {
		hex = '0' + hex;
	}
	return hex;
};

export const fullColorHex = (r: string | number, g: string | number, b: string | number) => {
	const red = rgbToHex(r);
	const green = rgbToHex(g);
	const blue = rgbToHex(b);
	return red + green + blue;
};

export const hexToRgb = (hex: string) => {
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

export interface HairPalleteLookupData {
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

export const hexRegex = /^[0-9a-f]{6}$/i;