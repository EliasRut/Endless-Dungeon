export const getUrlParam = (param: string) => {
	const params = (new URL(`${document.location}`)).searchParams;
	return params.get(param) || undefined;
};