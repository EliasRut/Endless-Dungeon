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
	};
}

export interface AiStepResult {
	self?: CharacterTokenUpdateEffect;
	target?: CharacterTokenUpdateEffect;
}
