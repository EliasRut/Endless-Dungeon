import React, { useEffect, useRef } from 'react';
import { startAudioGeneration } from '../../../game/phaser/audiogen/app';

import './MusicEditorScreen.css';

export const MusicEditorScreen = () => {
	const controlsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		startAudioGeneration(controlsRef.current || undefined);
	}, []);

	return <div ref={controlsRef} />;
};
