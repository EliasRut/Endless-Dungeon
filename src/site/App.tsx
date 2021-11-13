import 'phaser';
import React from 'react';
import { Game } from './components/Game';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { StartScreen } from './screens/StartScreen';
import { MapEditorScreen } from './screens/MapEditorScreen';
import { NPCEditorScreen } from './screens/NPCEditorScreen';
import './App.css';

export default function App() {
	return (
		<Router>
			{/* A <Switch> looks through its children <Route>s and
			renders the first one that matches the current URL. */}
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
		</Router>
	);
}
