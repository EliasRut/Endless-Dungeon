import firstSideQuest from '../../assets/sideQuests/firstSideQuest.json';
import secondSideQuest from '../../assets/sideQuests/secondSideQuest.json';
import thirdSideQuest from '../../assets/sideQuests/thirdSideQuest.json';
import { QuestTheme } from './StoryLineData';
import { SideQuest } from './SideQuest';

const loadedSideQuests: SideQuest[] = [
	firstSideQuest,
	secondSideQuest,
	thirdSideQuest
];

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