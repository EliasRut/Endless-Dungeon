import 'phaser';
import React, { useEffect, useRef } from 'react';
import { startAudioGeneration } from '../../scripts/audiogen/app';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import styled from 'styled-components';
import { OverlayScreen } from './OverlayScreen';
import { Provider } from 'react-redux';
import { uiStore } from '../uiStore/uiStore';
import { activeScreenSlice, UIScreen } from '../uiStore/activeScrenSlice';
import '../App.css';

const showGame = true;

export const Game = () => {
	const phaserRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveMode(MODE.GAME);
		const config = getGameConfig(phaserRef.current!, MODE.GAME);
		const game = new Phaser.Game(config);
		uiStore.dispatch(activeScreenSlice.actions.setActiveScreen(UIScreen.DIALOG));
		startAudioGeneration();

		// setTimeout(() => {
		// 	uiStore.dispatch(activeScreenSlice.actions.setActiveScreen(UIScreen.DIALOG));
		// }, 5000);
	}, [showGame]);

	return (
		<UIContainer id="ui">
			<Provider store={uiStore}>
				<OverlayScreen />
			</Provider>
			<GameContainer id="game" ref={phaserRef} />
		</UIContainer>
	);
};

const UIContainer = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
`;

const GameContainer = styled.div`
	display: flex;
	width: 100%;
	height: 100%;
`;
