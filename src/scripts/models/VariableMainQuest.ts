import { Quest } from './Quest';
import { QuestTheme } from './StoryLineData';

export class VariableMainQuest extends Quest {
	theme: QuestTheme;

	constructor(
			title: string,
			description: string,
			task: string,
			enemyType: string,
			rooms: string[],
			theme: QuestTheme
		) {
		super(title, description, task, enemyType, rooms);
		this.theme = theme;
	}
}
