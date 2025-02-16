import 'phaser';
import React, { useEffect, useState } from 'react';
import { Game } from './components/Game';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { StartScreen } from './screens/StartScreen';
import { MapEditorScreen } from '../editors/react/screens/MapEditorScreen';
import { NPCEditorScreen } from '../editors/react/screens/NPCEditorScreen';
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { QuestEditorScreen } from '../editors/react/screens/QuestEditorScreen';
import { loadUserData } from '../game/phaser/helpers/userHelpers';
import { UserInformation } from '../game/phaser/helpers/UserInformation';
import { AbilityEditorScreen } from '../editors/react/screens/AbilityEditorScreen';
import { MusicEditorScreen } from '../editors/react/screens/MusicEditorScreen';
import { app } from '../game/phaser/helpers/initializeApp';
import './App.css';

export default function App() {
	const [user, setUser] = useState<UserInformation | undefined>(undefined);

	useEffect(() => {
		const auth = getAuth(app);
		onAuthStateChanged(auth, (authData) => {
			if (authData) {
				loadUserData(authData.uid).then((userData) => setUser(userData));
			} else {
				setUser(undefined);
			}
		});
	}, [setUser]);

	const authenticate = () => {
		const auth = getAuth(app);
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
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

	if (user) {
		return (
			<Router>
				<Routes>
					<Route path="/game" element={<Game />} />
					<Route path="/mapEditor" element={<MapEditorScreen user={user} />} />
					<Route path="/npcEditor" element={<NPCEditorScreen user={user} />} />
					<Route path="/questEditor" element={<QuestEditorScreen user={user} />} />
					<Route path="/abilityEditor" element={<AbilityEditorScreen user={user} />} />
					<Route path="/musicEditor" element={<MusicEditorScreen />} />
					<Route path="/" element={<StartScreen auth={authenticate} user={user} />} />
				</Routes>
			</Router>
		);
	}

	return (
		<Router>
			<Routes>
				<Route path="/game" element={<Game />} />
				<Route path="/" element={<StartScreen auth={authenticate} user={undefined} />} />
			</Routes>
		</Router>
	);
}
