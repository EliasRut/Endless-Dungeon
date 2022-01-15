import { MENU_ICON_LEFT_BORDER } from '../drawables/ui/MenuIcon';
import { UiDepths, UI_SCALE } from '../helpers/constants';
import { Quests } from '../helpers/quests';
import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import OverlayScreen from './OverlayScreen';
import { STAT_SCREEN_RIGHT_BORDER } from './StatScreen';

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;

const AVAILABLE_WINDOW_WIDTH =
	SCALED_WINDOW_WIDTH - STAT_SCREEN_RIGHT_BORDER - MENU_ICON_LEFT_BORDER;

const SCREEN_HEIGHT = 280;
const SCREEN_WIDTH = 200;

const QUEST_SCREEN_X = STAT_SCREEN_RIGHT_BORDER + AVAILABLE_WINDOW_WIDTH / 2 - SCREEN_WIDTH - 10;

const HEADER_FIRST_CHECKBOX_OFFSET = 40;
const HEADER_FIRST_QUEST_TEXT_OFFSET = 41;
const OFFSET_BETWEEN_QUESTS = 20;

const QUEST_SCREEN_Y = 24;

export default class QuestLogScreen extends OverlayScreen {
	checkBoxes: Phaser.GameObjects.Image[] = [];
	questNames: Phaser.GameObjects.Text[] = [];

	constructor(scene: MainScene) {
		// tslint:disable: no-magic-numbers
		super(
			scene,
			QUEST_SCREEN_X * UI_SCALE,
			QUEST_SCREEN_Y * UI_SCALE,
			SCREEN_WIDTH * UI_SCALE,
			SCREEN_HEIGHT * UI_SCALE
		);

		const questHeader = new Phaser.GameObjects.Text(
			scene,
			(QUEST_SCREEN_X + 16) * UI_SCALE,
			(QUEST_SCREEN_Y + 12) * UI_SCALE,
			'Quest log',
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${20 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		questHeader.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		questHeader.setScrollFactor(0);
		questHeader.setOrigin(0);
		questHeader.setShadow(0, 1 * UI_SCALE, 'black');
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
				(QUEST_SCREEN_X + 16) * UI_SCALE,
				(QUEST_SCREEN_Y + HEADER_FIRST_CHECKBOX_OFFSET + OFFSET_BETWEEN_QUESTS * index) * UI_SCALE,
				quest[0] === true ? 'checkbox-filled' : 'checkbox-empty'
			);
			questBox.setOrigin(0);
			questBox.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			questBox.setScrollFactor(0);
			questBox.setScale(UI_SCALE);
			this.add(questBox, true);
			this.checkBoxes.push(questBox);

			const questName = new Phaser.GameObjects.Text(
				this.scene,
				(QUEST_SCREEN_X + 36) * UI_SCALE,
				(QUEST_SCREEN_Y + HEADER_FIRST_QUEST_TEXT_OFFSET + OFFSET_BETWEEN_QUESTS * index) *
					UI_SCALE,
				Quests[quest[1]].name,
				{
					color: 'white',
					wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
					fontSize: `${12 * UI_SCALE}pt`,
					fontFamily: 'endlessDungeon',
				}
			);
			questBox.setOrigin(0);
			questName.setDepth(UiDepths.UI_BACKGROUND_LAYER);
			questName.setScrollFactor(0);
			questName.on('pointerdown', () => {
				(this.scene as MainScene).overlayScreens.questDetailsScreen.setActiveQuestId(quest[1]);
				this.questNames.forEach((textField) => textField.setColor('white'));
				questName.setColor('#ffae00');
			});
			questName.setInteractive();
			questName.setShadow(0, 1 * UI_SCALE, 'black');
			this.add(questName, true);
			this.questNames.push(questName);
		});
	}
}
