const firebase = require('firebase');
const fs = require('fs');

const firebaseConfig = {
	apiKey: 'AIzaSyBwHFZ7A9t8rHi4p6r-D2wr5WDrt9O7Yow',
	authDomain: 'project-endless-dungeon.firebaseapp.com',
	projectId: 'project-endless-dungeon',
	storageBucket: 'project-endless-dungeon.appspot.com',
	messagingSenderId: '300065738789',
	appId: '1:300065738789:web:e0a00f15878d7679226fcc',
};

const COLS_PER_ROW_BEFORE = 40;
const COLS_PER_ROW_AFTER = 44;

const transformCell = (cellIndex) => {
	const row = Math.floor(cellIndex / COLS_PER_ROW_BEFORE);
	const colBefore = cellIndex % COLS_PER_ROW_BEFORE;

	const newIndex = row * COLS_PER_ROW_AFTER + colBefore;
	return newIndex;
};

const transformRowLayout = (layout) => {
	const newLayout = layout
		.filter((cell) => cell !== null)
		.map((cellIndex) => transformCell(cellIndex));
	return newLayout;
};

const transformLayout = (layout) => {
	const newLayout = layout.map((rowLayout) => transformRowLayout(rowLayout));
	return newLayout;
};

// Initialize Firebase
const updateRooms = async () => {
	firebase.initializeApp(firebaseConfig);
	const roomDb = firebase.firestore().collection('rooms');
	const roomQuery = await roomDb.get();

	roomQuery.forEach(async (roomDoc) => {
		console.log(`Looking at room doc ${roomDoc.id}`);

		const room = roomDoc.data();

		fs.writeFileSync(`scripts/backup/${roomDoc.id}.json`, JSON.stringify(room, null, 2));

		await roomDoc.ref.update({
			// console.log(
			// `Would update. ${JSON.stringify({
			layout: JSON.stringify(transformLayout(JSON.parse(room.layout))),
			decorations: JSON.stringify(transformLayout(JSON.parse(room.decorations))),
			overlays: JSON.stringify(transformLayout(JSON.parse(room.overlays))),
			// })}`
		});
	});
};

updateRooms();
