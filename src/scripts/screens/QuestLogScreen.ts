import { UiDepths } from '../helpers/constants';
import { Quests } from '../helpers/quests';
import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import OverlayScreen from './OverlayScreen';

const HEADER_FIRST_CHECKBOX_OFFSET = 12;
const HEADER_FIRST_QUEST_TEXT_OFFSET = 11;
const OFFSET_BETWEEN_QUESTS = 20;

const QUEST_SCREEN_X = 250;
const QUEST_SCREEN_Y = 95;
const SCREEN_WIDTH = 200;

export default class QuestLogScreen extends OverlayScreen {
	checkBoxes: Phaser.GameObjects.Image[] = [];
	questNames: Phaser.GameObjects.Text[] = [];

	constructor(scene: MainScene) {
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

		this.setVisible(false);
	}

	update() {
		const quests = Object.entries(globalState.quests).map(([questId, questState]) => {
			return [questState.questFinished, questId];
		}) as [boolean, string][];

		this.checkBoxes.forEach((checkBox) => {
			checkBox.destroy(true);
		});
		this.checkBoxes = [];
		this.questNames.forEach((questName) => {
			questName.destroy(true);
		});
		this.questNames = [];

		quests.forEach((quest, index) => {
			const questBox = new Phaser.GameObjects.Image(
				this.scene,
				QUEST_SCREEN_X - 10,
				QUEST_SCREEN_Y + HEADER_FIRST_CHECKBOX_OFFSET + OFFSET_BETWEEN_QUESTS * index,
				quest[0] === true ? 'checkbox-filled' : 'checkbox-empty'
			);
			questBox.setOrigin(0);
			questBox.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			questBox.setScrollFactor(0);
			this.add(questBox, true);
			this.checkBoxes.push(questBox);

			const questName = new Phaser.GameObjects.Text(
				this.scene,
				QUEST_SCREEN_X + 12,
				QUEST_SCREEN_Y + HEADER_FIRST_QUEST_TEXT_OFFSET + OFFSET_BETWEEN_QUESTS * index,
				Quests[quest[1]].name,
				{
					color: 'black',
					wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
					fontFamily: 'munro',
				}
			);
			questBox.setOrigin(0);
			questName.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			questName.setScrollFactor(0);
			questName.on('pointerdown', () => {
				(this.scene as MainScene).overlayScreens.questDetailsScreen.setActiveQuestId(quest[1]);
				this.questNames.forEach((textField) => textField.setColor('black'));
				questName.setColor('#004e96');
			});
			questName.setInteractive();
			this.add(questName, true);
			this.questNames.push(questName);
		});
	}
}
