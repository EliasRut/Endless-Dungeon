export const getBaseUrl = () => {
	return process.env.NODE_ENV === 'development'
		? 'http://localhost:5173'
		: 'https://your-deployed-url.com';
};
