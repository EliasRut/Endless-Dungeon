import { FadingLabelSize } from '../game/phaser/helpers/constants';

export interface CharacterTokenUpdateEffect {
	receiveStunMs?: number;
	takeDamage?: number;
	receiveHit?: boolean;
	setVelocity?: [number, number];
	setAcceleration?: [number, number];
	playAnimation?: {
		key: string;
		frameRate: number;
		repeat?: number;
		chain?: {
			key: string;
			repeat: number;
		};
		progress?: number;
		startFrame?: number;
	};
	addFadingLabel?: {
		text: string;
		size: FadingLabelSize;
		color: string;
		x: number;
		y: number;
		timeMs: number;
	};
}

export interface AiStepResult {
	self?: CharacterTokenUpdateEffect;
	target?: CharacterTokenUpdateEffect;
}
