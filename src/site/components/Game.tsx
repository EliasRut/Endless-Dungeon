import 'phaser';
import React, { useEffect, useRef } from 'react';
import { startAudioGeneration } from '../../scripts/audiogen/app';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';

import '../App.css';

const showGame = true;

export const Game = () => {
	const phaserRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveMode(MODE.GAME);
		const config = getGameConfig(phaserRef.current!, MODE.GAME);
		const game = new Phaser.Game(config);
		try {
			startAudioGeneration();
		} catch (e) {
			console.log(e);
		}
	}, [showGame]);

	return <div className="game__container" ref={phaserRef} />;
};
