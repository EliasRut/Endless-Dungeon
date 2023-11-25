import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Client, Room } from 'colyseus.js';

ReactDOM.render(<App />, document.getElementById('root'));

const connectToServer = async () => {
	const endpoint = 'ws://localhost:2567';
	const options = {
		roomName: 'world',
	};

	const client = new Client(endpoint);
	const room: Room = await client.joinOrCreate(options.roomName, {
		// your join options here...
	});

	console.log('joined successfully!');

	room.onMessage('message-type', (payload) => {
		// logic
	});

	room.onStateChange((state) => {
		console.log('state change:', state);
	});

	room.onLeave((code) => {
		console.log('left');
	});

	// setInterval(() => {
	//     const updates: any[] = [];
	//     room.state.entities.forEach((entity) => {
	//         if (Math.random() > 0.25) {
	//             return;
	//         }

	//         const x = Math.floor(Math.random() * 640);
	//         const y = Math.floor(Math.random() * 640);
	//         const velocityX = Math.floor(Math.random() * 10) - 5;
	//         const velocityY = Math.floor(Math.random() * 10) - 5;
	//         const facing = Math.floor(Math.random() * 4);

	//         updates.push([entity.id, x, y, velocityX, velocityY, facing]);
	//     });
	//     room.send('updatePositions', updates);
	// }, 1000 / 12);
};

connectToServer();
