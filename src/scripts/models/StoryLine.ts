import { Quest } from './Quest';

import firstQuest from '../../assets/variableMainQuests/firstVarMainQuest.json';
import secondQuest from '../../assets/variableMainQuests/secondVarMainQuest.json';
import thirdQuest from '../../assets/variableMainQuests/thirdVarMainQuest.json';
import StoryLineData from './StoryLineData';

import lichKingStoryLineData from '../../assets/storyLines/lichking.json';
import lichQueenStoryLineData from '../../assets/storyLines/lichqueen.json';
import { VariableMainQuest } from './VariableMainQuest';

const loadedVariableMainQuests: VariableMainQuest[] = [
	firstQuest,
	secondQuest,
	thirdQuest
];

const loadedStorylineData: StoryLineData[] = [
	lichKingStoryLineData,
	lichQueenStoryLineData
];

export default class StoryLine {
	storyLineData: StoryLineData;

	constructor() {
		this.drawRndStoryLine();
		this.drawVariableMainQuests();
	}

	drawRndStoryLine() {
		this.storyLineData =
			loadedStorylineData[Math.floor(Math.random() * loadedStorylineData.length)];
	}

	drawVariableMainQuests() {
		const qualifiedSideQuests: Quest[] = [];
		for (const sideQuest of loadedVariableMainQuests) {
			if (this.storyLineData.themes.find(theme => {
				return theme === sideQuest.theme;
			}) !== null) {
				qualifiedSideQuests.push(sideQuest);
			}
		}

		for (const i in this.storyLineData.mainQuests) {
			if (this.storyLineData.mainQuests[i].title === 'variableMainQuest') {
				const randomNumber = Math.floor(Math.random() * qualifiedSideQuests.length);
				this.storyLineData.mainQuests[i] = qualifiedSideQuests.splice(randomNumber, 1)[0];
			}
		}
	}
}