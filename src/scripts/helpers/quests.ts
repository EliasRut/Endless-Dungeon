import { ScriptEntry } from '../../../typings/custom';
import { Source } from '../../items/itemData';
import globalState from '../worldstate';

export interface Quest {
	questGiverId?: string;
	questGiverName: string;
	preconditions?: {
		previousQuests?: string[];
		hasItems?: string[];
		dungeonLevelReached?: number;
	};
	completionCriterias?: {
		previousQuests?: string[];
		hasItems?: string[];
		dungeonLevelReached?: number;
	};
	name: string;
	goal: string;
}

export interface QuestScripts {
	intro: ScriptEntry[];
	end?: ScriptEntry[];
}

export const Quests: { [name: string]: Quest } = {
	theRescue: {
		questGiverId: 'agnes',
		questGiverName: 'Agnes',
		name: 'The Rescue',
		goal: 'Rescue Erwin from the zombies',
	},
	hildaTalks: {
		questGiverId: 'hilda',
		questGiverName: 'Hilda',
		name: 'Hilda needs Help',
		goal: 'Help Hila, immediately',
		preconditions: {
			// previousQuests: ['theRescue'],
		},
	},
	vanyaWantsBooks: {
		questGiverId: 'vanya',
		questGiverName: 'Vanya',
		name: 'Vanya wants books',
		goal: 'Bring Vanya some very special books',
		preconditions: {
			previousQuests: ['hildaTalks'],
		},
		completionCriterias: {
			hasItems: ['book'],
		},
	},
	theHunt: {
		questGiverId: 'agnes',
		questGiverName: 'Agnes',
		name: 'The Hunt',
		goal: 'Get 10 wild plantling roots, find Euraliae seeds',
		preconditions: {
			previousQuests: ['theRescue'],
			hasItems: ['Wild Rune', 'Death Rune'],
			dungeonLevelReached: 1,
		},
	},
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
	return Object.entries(Quests)
		.filter(([key, quest]) => {
			return (
				quest.questGiverId === questGiverId &&
				!globalState.quests[key] &&
				areQuestPreconditionsMet(quest)
			);
		})
		.map(([key]) => key);
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

const questScripts: { [name: string]: QuestScripts } = {
	hildaTalks: {
		intro: [
			{
				type: 'dialog',
				speaker: 'Player',
				text: ['Go visit Vanya in her book shop!'],
			},
			{
				type: 'pauseUntilCondition',
				roomName: 'bookshop',
			},
			{
				type: 'dialog',
				speaker: 'Player',
				text: ["This must be the book shop I've heard about.", 'Then this must be Vanya.'],
			},
			{
				type: 'setQuestState',
				questId: 'hildaTalks',
				questState: 'finished',
			},
		],
	},
	vanyaWantsBooks: {
		intro: [
			{
				type: 'dialog',
				speaker: 'Player',
				text: ['Get me some books, yo!'],
			},
			{
				type: 'pauseUntilCondition',
				roomName: 'bookshop',
				itemIds: ['book'],
			},
			{
				type: 'takeItem',
				itemId: 'book',
				amount: 1,
			},
			{
				type: 'dialog',
				speaker: 'Player',
				text: ['Thanks for the book, yo!'],
			},
			{
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
				},
			},
			{
				type: 'dialog',
				speaker: 'Player',
				text: ["Take this Force Source, it'll come in handy!"],
			},
		],
	},
	theRescue: {
		intro: [
			{
				type: 'dialog',
				speaker: 'Player',
				text: ['Young wizard, what a relief. I need your help!'],
			},
			{
				type: 'pauseUntilCondition',
				scriptIds: ['.*_chapter-1-zombie-room_onClear'],
				scriptStates: ['finished'],
			},
			{
				type: 'sceneChange',
				target: 'tavern_new',
			},
			{
				type: 'dialog',
				speaker: 'Player',
				text: ["Finally, we're back together!"],
			},
			{
				type: 'setQuestState',
				questId: 'theRescue',
				questState: 'finished',
			},
		],
	},
};

export const loadQuestScript: (questId: string) => ScriptEntry[] = (questId) => {
	if (globalState.quests[questId]?.questOngoing) {
		return questScripts[questId].end || [];
	}
	return questScripts[questId].intro;
};
