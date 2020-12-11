import { Quest } from './Quest';

export class MainQuest extends Quest {
	constructor(
			title: string,
			description: string,
			task: string,
			enemyType: string,
			rooms: string[]
		) {
		super(title, description, task, enemyType, rooms);
	}
}
