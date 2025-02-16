import { AiStepResult } from '../../../types/CharacterTokenUpdateEffect';

export const combineAiStepResults = (results: AiStepResult[]): AiStepResult => {
	const combinedResult: AiStepResult = {
		self: {},
		target: {},
	};

	for (const result of results) {
		if (result.self) {
			Object.assign(combinedResult.self!, result.self);
		}
		if (result.target) {
			Object.assign(combinedResult.target!, result.target);
		}
	}

	if (Object.keys(combinedResult.self!).length === 0) {
		delete combinedResult.self;
	}
	if (Object.keys(combinedResult.target!).length === 0) {
		delete combinedResult.target;
	}

	return combinedResult;
};
