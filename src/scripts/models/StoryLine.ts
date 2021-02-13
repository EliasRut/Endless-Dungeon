import { Quest } from './Quest';

const MAIN_QUEST_PATH = '../../assets/variableMainQuests';
const STORY_LINE_PATH = '../../assets/storyLines';

// import firstQuest from '../../assets/variableMainQuests/firstVarMainQuest.json';
// import secondQuest from '../../assets/variableMainQuests/secondVarMainQuest.json';
// import thirdQuest from '../../assets/variableMainQuests/thirdVarMainQuest.json';
import StoryLineData from './StoryLineData';

// import lichKingStoryLineData from '../../assets/storyLines/lichking.json';
// import lichQueenStoryLineData from '../../assets/storyLines/lichqueen.json';
import { VariableMainQuest } from './VariableMainQuest';

import storyLines from '../../assets/storyLines/storyLines.json';

const loadedVariableMainQuests: VariableMainQuest[] = [];
// [
// 	firstQuest,
// 	secondQuest,
// 	thirdQuest
// ];

for(const varMainQuest of storyLines.variableMainQuests) {
	// We "require" json files to allow for non-static, main quest based lookup
	// tslint:disable-next-line: no-var-requires
	const varMainQuestObject: VariableMainQuest =
		require('../../assets/variableMainQuests/'+ varMainQuest +'.json');

	loadedVariableMainQuests.push(varMainQuestObject);
}

const loadedStorylineData: StoryLineData[] = [];
// [
// 	lichKingStoryLineData,
// 	lichQueenStoryLineData
// ];

for(const storyLine of storyLines.storyLines) {
	// We "require" json files to allow for non-static, story line based lookup
	// tslint:disable-next-line: no-var-requires
	const storyLineObject: StoryLineData =
		require('../../assets/storyLines/' + storyLine + '.json');
	loadedStorylineData.push(storyLineObject);
}

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