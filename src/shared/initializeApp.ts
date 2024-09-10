import { initializeApp } from 'firebase/app';

const firebaseConfig = {
	apiKey: 'AIzaSyBwHFZ7A9t8rHi4p6r-D2wr5WDrt9O7Yow',
	authDomain: 'project-endless-dungeon.firebaseapp.com',
	projectId: 'project-endless-dungeon',
	storageBucket: 'project-endless-dungeon.appspot.com',
	messagingSenderId: '300065738789',
	appId: '1:300065738789:web:e0a00f15878d7679226fcc',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
