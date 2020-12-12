import { Quest } from './Quest';

export enum QuestTheme {
	Fire,
	Frost,
	Darkness,
	Christmas,
	Swamp
}

export default class StoryLineData {
	title: string;
	mainQuests: Quest[];
	themes: QuestTheme[];

	constructor(title: string, mainQuests: Quest[], themes: QuestTheme[]) {
		this.title = title;
		this.mainQuests = mainQuests;
		this.themes = themes;
	}
}