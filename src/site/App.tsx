import 'phaser';
import React, { useEffect, useState } from 'react';
import { Game } from './components/Game';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { StartScreen } from './screens/StartScreen';
import { MapEditorScreen } from './screens/MapEditorScreen';
import { NPCEditorScreen } from './screens/NPCEditorScreen';
import { Login } from './screens/Login';
import firebase from 'firebase';
import './App.css';
import { QuestEditorScreen } from './screens/QuestEditorScreen';
import { loadUserData } from '../scripts/helpers/userHelpers';
import { UserInformation } from '../scripts/helpers/UserInformation';
import { loadContentFromDatabase } from '../scripts/helpers/ContentDataLibrary';

const provider = new firebase.auth.GoogleAuthProvider();

export default function App() {
	const [user, setUser] = useState<UserInformation | undefined>(undefined);

	useEffect(() => {
		loadContentFromDatabase();
		firebase.auth().onAuthStateChanged((authData) => {
			if (authData) {
				loadUserData(authData.uid).then((userData) => setUser(userData));
			} else {
				setUser(undefined);
			}
		});
	}, [setUser]);

	const auth = () => {
		firebase
			.auth()
			.signInWithPopup(provider)
			.then((result) => {
				if (result.user) {
					loadUserData(result.user.uid).then((userData) => setUser(userData));
				} else {
					setUser(undefined);
				}
			})
			.catch((error) => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				// The email of the user's account used.
				const email = error.email;
				// The firebase.auth.AuthCredential type that was used.
				const credential = error.credential;
				// ...
			});
	};

	return (
		<Router>
			{/* A <Switch> looks through its children <Route>s and
			renders the first one that matches the current URL. */}
			{user ? (
				<Switch>
					<Route path="/game">
						<Game />
					</Route>
					<Route path="/mapEditor">
						<MapEditorScreen user={user} />
					</Route>
					<Route path="/npcEditor">
						<NPCEditorScreen user={user} />
					</Route>
					<Route path="/questEditor">
						<QuestEditorScreen user={user} />
					</Route>
					<Route path="/">
						<StartScreen auth={auth} user={user} />
					</Route>
				</Switch>
			) : (
				<Switch>
					<Route path="/game">
						<Game />
					</Route>
					<Route path="/">
						<StartScreen auth={auth} user={undefined} />
					</Route>
				</Switch>
			)}
		</Router>
	);
}
