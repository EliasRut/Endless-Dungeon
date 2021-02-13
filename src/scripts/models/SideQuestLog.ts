// import firstSideQuest from '../../assets/sideQuests/firstSideQuest.json';
// import secondSideQuest from '../../assets/sideQuests/secondSideQuest.json';
// import thirdSideQuest from '../../assets/sideQuests/thirdSideQuest.json';
import { QuestTheme } from './StoryLineData';
import { SideQuest } from './SideQuest';
import storyLines from '../../assets/storyLines/storyLines.json';
// import fs from 'fs';

const SIDE_QUEST_PATH = 'assets/sideQuests';

const loadedSideQuests: SideQuest[] = [];
// fs.readdir('../../assets/sideQuests/', 'utf-8', (err, files) => {
// 	if (err) throw err;

// 	files.forEach(file => {
// 		const sideQuest: SideQuest = JSON.parse(file);
// 		loadedSideQuests.push(sideQuest);
// 	});

// });

for(const sideQuest of storyLines.sideQuests) {
	try{
	// tslint:disable-next-line: no-var-requires
	const sideQuestObject: SideQuest = require('../../assets/sideQuests/' + sideQuest + '.json');

	// We "require" json files to allow for non-static, story line based lookup
	// tslint:disable-next-line: no-var-requires
	loadedSideQuests.push(sideQuestObject);
	} catch(e) {
		console.error(`Sidequest json file not found in path:  ../../${SIDE_QUEST_PATH}/${sideQuest}.json`);
	}
}

export default class SideQuestLog {
	sideQuests: SideQuest[] = [];

	constructor(count: number, themes: QuestTheme[]) {
		this.drawSideQuests(count,themes);
	}

	drawSideQuests(count: number, themes: QuestTheme[]) {
		const qualifiedSideQuests: SideQuest[] = [];
		for (const sideQuest of loadedSideQuests) {
			if (themes.find(theme => {
				return theme === sideQuest.theme;
			})) {
				qualifiedSideQuests.push(sideQuest);
			}
		}

		for (let i = 0; i < count; i++) {
			if (qualifiedSideQuests.length > 0) {
				const rndNumber = Math.floor(Math.random() * qualifiedSideQuests.length);
				const sideQuest = qualifiedSideQuests.splice(rndNumber, 1)[0];
				sideQuest.level = i;
				this.sideQuests.push(sideQuest);
			}
		}
	}
}