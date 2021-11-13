import { UiDepths } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';

const HEADER_FIRST_CHECKBOX_OFFSET = 12;
const HEADER_FIRST_QUEST_TEXT_OFFSET = 11;
const OFFSET_BETWEEN_QUESTS = 20;

const QUEST_SCREEN_X = 250;
const QUEST_SCREEN_Y = 95;
const SCREEN_WIDTH = 200;

const quests: [boolean, string][] = [
	[true, 'The Rescue'],
	[false, 'The Hunt'],
];

export default class QuestLogScreen extends OverlayScreen {
	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, QUEST_SCREEN_X, QUEST_SCREEN_Y, SCREEN_WIDTH, 280);

		const questHeader = new Phaser.GameObjects.Text(
			scene,
			QUEST_SCREEN_X - 15,
			QUEST_SCREEN_Y - 15,
			'QUEST LOG',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontSize: '20px',
				fontStyle: 'bold',
				fontFamily: 'munro',
			}
		);
		questHeader.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		questHeader.setScrollFactor(0);
		this.add(questHeader, true);

		quests.forEach((quest, index) => {
			const questBox = new Phaser.GameObjects.Image(
				scene,
				QUEST_SCREEN_X - 10,
				QUEST_SCREEN_Y + HEADER_FIRST_CHECKBOX_OFFSET + OFFSET_BETWEEN_QUESTS * index,
				quest[0] === true ? 'checkbox-filled' : 'checkbox-empty'
			);
			questBox.setOrigin(0);
			questBox.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			questBox.setScrollFactor(0);
			this.add(questBox, true);

			const questName = new Phaser.GameObjects.Text(
				scene,
				QUEST_SCREEN_X + 12,
				QUEST_SCREEN_Y + HEADER_FIRST_QUEST_TEXT_OFFSET + OFFSET_BETWEEN_QUESTS * index,
				quest[1],
				{
					color: 'black',
					wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
					fontFamily: 'munro',
				}
			);
			questBox.setOrigin(0);
			questName.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			questName.setScrollFactor(0);
			this.add(questName, true);
		});
	}
}
