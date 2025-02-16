import {
	AiStepResult,
	CharacterTokenUpdateEffect,
} from '../../../types/CharacterTokenUpdateEffect';
import { EnemyTokenData } from '../../../types/EnemyTokenData';
import CharacterToken from '../drawables/tokens/CharacterToken';

const applyAiStepResultToToken = (token: CharacterToken, result: CharacterTokenUpdateEffect) => {
	if (result.playAnimation) {
		if (!token.scene.game.anims.exists(result.playAnimation.key)) {
			console.error(`Animation ${result.playAnimation.key} does not exist.`);
		}
		const anim = token.play({
			key: result.playAnimation.key,
			frameRate: result.playAnimation.frameRate,
			repeat: result.playAnimation.repeat,
			...(result.playAnimation.startFrame !== undefined
				? { startFrame: result.playAnimation.startFrame }
				: {}),
		});
		if (result.playAnimation.chain) {
			anim.chain({
				key: result.playAnimation.chain.key,
				repeat: result.playAnimation.chain.repeat,
			});
		}
		if (result.playAnimation.progress) {
			token.anims.setProgress(result.playAnimation.progress);
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
	if (result.addFadingLabel) {
		token.scene.addFadingLabel(
			result.addFadingLabel.text,
			result.addFadingLabel.size,
			result.addFadingLabel.color,
			token.x,
			token.y,
			result.addFadingLabel.timeMs
		);
	}
	if (result.triggerAbility) {
		token.scene.abilityHelper?.triggerAbility(
			result.triggerAbility.caster,
			result.triggerAbility.pointOfOrigin,
			result.triggerAbility.type,
			result.triggerAbility.abilityLevel,
			result.triggerAbility.globalTime,
			result.triggerAbility.comboCast,
			result.triggerAbility.abilityData
		);
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
