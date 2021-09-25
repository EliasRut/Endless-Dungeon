import { ScriptEntry } from '../../../typings/custom';
import { Source } from '../../items/itemData';
import globalState from '../worldstate';

export interface Quest {
	questGiverId?: string;
	preconditions?: {
		previousQuests?: string[];
		hasItems?: string[];
		dungeonLevelReached?: number;
	};
	goals?: {
		previousQuests?: string[];
		hasItems?: string[];
		dungeonLevelReached?: number;
	};
	name: string;
}

export interface QuestScripts {
	intro:  ScriptEntry[];
	end?:  ScriptEntry[];
}

export const Quests: {[name: string]: Quest} = {
	'hildaTalks': {
		questGiverId: 'hilda',
		name: 'Hilda needs Help'
	},
	'vanyaWantsBooks': {
		questGiverId: 'vanya',
		name: 'Vanya wants books',
		preconditions: {
			previousQuests: ['hildaTalks']
		},
		goals: {
			hasItems: ['book']
		}
	}
};

export const areQuestPreconditionsMet: (quest: Quest) => boolean = (quest) => {
	if (!quest.preconditions) {
		return true;
	}
	let areAllConditionsMet = true;
	(quest.preconditions.previousQuests || []).forEach((questName) => {
		if (!(globalState.quests || {})[questName]?.questFinished) {
			areAllConditionsMet = false;
		}
	});
	return areAllConditionsMet;
};

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

const questScripts: {[name: string]: QuestScripts} = {
	'hildaTalks': {
		intro: [{
			type: 'dialog',
			portrait: 'player_happy',
			text: ['Go visit Vanya in her book shop!']
		}, {
			type: 'pauseUntilCondition',
			roomName: 'bookshop'
		}, {
			type: 'dialog',
			portrait: 'player_happy',
			text: [
				'This must be the book shop I\'ve heard about.',
				'Then this must be Vanya.'
			]
		}, {
			type: 'setQuestState',
			questId: 'hildaTalks',
			questState: 'finished'
		}
	]
	},
	'vanyaWantsBooks': {
		intro: [{
			type: 'dialog',
			portrait: 'player_happy',
			text: ['Get me some books, yo!']
		}, {
			type: 'pauseUntilCondition',
			roomName: 'bookshop',
			itemIds: ['book']
		}, {
			type: 'takeItem',
			itemId: 'book',
			amount: 1
		}, {
			type: 'dialog',
			portrait: 'player_happy',
			text: ['Thanks for the book, yo!']
		}, {
			type: 'spawnItem',
			atPlayerPosition: true,
			itemOptions: {
				sourceTypes: [Source.FORCE],
				level: 5,
				sourceWeight: 1,
				catalystWeight: 0,
				armorWeight: 0,
				ringWeight: 0,
				amuletWeight: 0,
			}
		}, {
			type: 'dialog',
			portrait: 'player_happy',
			text: ['Take this Force Source, it\'ll come in handy!']
		}]
	}
};

export const loadQuestScript: (questId: string) => ScriptEntry[] = (questId) => {
	if (globalState.quests[questId]?.questOngoing) {
		return questScripts[questId].end || [];
	}
	return questScripts[questId].intro;
};