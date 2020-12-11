import { QuestTheme } from './StoryLineData';

export abstract class Quest {
	title: string;
	description: string;
	task: string; // SHOULD BE A TASK CLASS
	enemyType: string;
	rooms: string[];

	constructor(
			title: string,
			description: string,
			task: string,
			enemyType: string,
			rooms: string[]
		) {
		this.title = title;
		this.description = description;
		this.task = task;
		this.enemyType = enemyType;
		this.rooms = rooms;
	}
}