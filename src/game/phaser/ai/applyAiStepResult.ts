import {
	AiStepResult,
	CharacterTokenUpdateEffect,
} from '../../../types/CharacterTokenUpdateEffect';
import { EnemyTokenData } from '../../../types/EnemyTokenData';
import CharacterToken from '../drawables/tokens/CharacterToken';

const applyAiStepResultToToken = (token: CharacterToken, result: CharacterTokenUpdateEffect) => {
	if (result.playAnimation) {
		const anim = token.play({
			key: result.playAnimation.key,
			frameRate: result.playAnimation.frameRate,
			repeat: result.playAnimation.repeat,
		});
		if (result.playAnimation.chain) {
			anim.chain({
				key: result.playAnimation.chain.key,
				repeat: result.playAnimation.chain.repeat,
			});
		}
	}
	if (result.setVelocity) {
		token.setVelocity(result.setVelocity[0], result.setVelocity[1]);
	}
	if (result.setAcceleration) {
		token.setAcceleration(result.setAcceleration[0], result.setAcceleration[1]);
	}
	if (result.receiveStunMs) {
		token.receiveStun(result.receiveStunMs);
	}
	if (result.takeDamage) {
		token.takeDamage(result.takeDamage);
	}
	if (result.receiveHit) {
		token.receiveHit();
	}
};

export const applyAiStepResult = (self: CharacterToken, combinedResult: AiStepResult) => {
	if (combinedResult.self) {
		applyAiStepResultToToken(self, combinedResult.self);
	}
	if (combinedResult.target) {
		const targetStateObject = (self.tokenData as EnemyTokenData).targetStateObject;
		if (targetStateObject) {
			const target = self.scene.getTokenForStateObject(targetStateObject);
			if (target) {
				applyAiStepResultToToken(target, combinedResult.target);
			}
		}
	}
};
