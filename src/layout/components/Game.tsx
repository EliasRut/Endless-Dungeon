import 'phaser';
import React, { useEffect, useRef } from 'react';
import { startAudioGeneration } from '../../game/phaser/audiogen/app';
import { getGameConfig } from '../../game/phaser';
import { MODE, setActiveMode } from '../../game/phaser/helpers/constants';

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
