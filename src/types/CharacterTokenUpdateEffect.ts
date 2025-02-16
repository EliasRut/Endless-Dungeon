import { FadingLabelSize } from '../game/phaser/helpers/constants';
import { AbilityData } from './AbilityData';
import { AbilityType } from './AbilityType';
import Character from './Character';
import { PointOfOrigin } from './SimplePointOfOrigin';

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
	triggerAbility?: {
		caster: Character;
		pointOfOrigin: PointOfOrigin;
		type: AbilityType;
		abilityLevel: number;
		globalTime: number;
		comboCast: number;
		abilityData?: AbilityData;
	};
}

export interface AiStepResult {
	self?: CharacterTokenUpdateEffect;
	target?: CharacterTokenUpdateEffect;
}
