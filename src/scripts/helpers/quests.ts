import { ScriptEntry } from '../../../typings/custom';
import globalState from '../worldstate';

export interface Quest {
	questGiverId?: string;
	preconditions?: {
		previousQuests?: string[];
		hasItems?: string[];
		dungeonLevelReached?: number;
	};
	name: string;
}

export const Quests: {[name: string]: Quest} = {
	'hildaTalks': {
		questGiverId: 'hilda',
		name: 'Hilda needs Help'
	}
};

export const areQuestPreconditionsMet: (quest: Quest) => boolean = (quest) => {
	// ToDo: Check whether preconditions are actually met.
	return !quest.preconditions;
}

export const getOpenQuestIds: (questGiverId: string) => string[] = (questGiverId) => {
	return Object.entries(Quests).filter(([key, quest]) => {
		return quest.questGiverId === questGiverId &&
			!globalState.quests[key] &&
			areQuestPreconditionsMet(quest);
	}).map(([key]) => key);
};

export const getNextQuestId: (questGiverId: string) => string | undefined = (questGiverId) => {
	const nextQuestParts = Object.entries(Quests).find(([key, quest]) => {
		return quest.questGiverId === questGiverId && areQuestPreconditionsMet(quest);
	});
	return nextQuestParts ? nextQuestParts[0] : undefined;
};

export const hasAnyOpenQuests: (questGiverId: string) => boolean = (questGiverId) => {
	return getOpenQuestIds(questGiverId).length > 0;
};

const questScripts: {[name: string]: ScriptEntry[]} = {
	'hildaTalks': [{
		type: 'dialog',
		portrait: 'player_happy',
		text: ['Finally, today is the day I\'ve waited for so long!']
	}]
};

export const loadQuestScript: (questId: string) => ScriptEntry[] = (questId) => {
	return questScripts[questId];
};