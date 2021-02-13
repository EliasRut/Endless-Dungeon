import { SideQuest } from './SideQuest';

export class StoryLines {
	storyLines: string[];
	variableMainQuests: string[];
	sideQuests: string[];

	constructor(
		storyLines: string[],
		variableMainQuests: string[],
		sideQuests: string[]
	) {
		this.storyLines = storyLines;
		this.variableMainQuests = variableMainQuests;
		this.sideQuests = sideQuests;
	}
}