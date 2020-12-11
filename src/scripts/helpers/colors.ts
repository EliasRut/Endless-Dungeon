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