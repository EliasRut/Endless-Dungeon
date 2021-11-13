import 'phaser';
import React, { useState } from 'react';
import { Game } from './components/Game';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { StartScreen } from './screens/StartScreen';
import { MapEditorScreen } from './screens/MapEditorScreen';
import { NPCEditorScreen } from './screens/NPCEditorScreen';
import { Login } from './screens/Login'
import firebase from "firebase";
import './App.css';


const provider = new firebase.auth.GoogleAuthProvider();

export default function App() {
	const [user, setUser] = useState<firebase.User | null>()

	const auth = () => {
		firebase.auth()
		.signInWithPopup(provider)
		.then((result) => {
			/** @type {firebase.auth.OAuthCredential} */
			const credential = result.credential as firebase.auth.OAuthCredential;
	
			// This gives you a Google Access Token. You can use it to access the Google API.
			const token = credential.accessToken;
			// The signed-in user info.
			const user = result.user;
			setUser(user)

		}).catch((error) => {
			// Handle Errors here.
			const errorCode = error.code;
			const errorMessage = error.message;
			// The email of the user's account used.
			const email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			const credential = error.credential;
			// ...
		});
	}
	
	return (
		<Router>
			{/* A <Switch> looks through its children <Route>s and
			renders the first one that matches the current URL. */}
			{user ?
				<Switch>
					<Route path="/game">
						<Game />
					</Route>
					<Route path="/mapEditor">
						<MapEditorScreen />
					</Route>
					<Route path="/npcEditor">
						<NPCEditorScreen />
					</Route>
					<Route path="/">
						<StartScreen />
					</Route>
				</Switch>
			: 
				<Route path="/">
					<Login auth={auth} />
				</Route>}
		</Router>
	);
}
