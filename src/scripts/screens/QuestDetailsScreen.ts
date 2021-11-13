import { UiDepths } from '../helpers/constants';
import OverlayScreen from './OverlayScreen';

const HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET = 11;
const OFFSET_BETWEEN_LINES = 20;

const QUEST_DETAILS_START_X = 500;
const QUEST_DETAILS_START_Y = 198;
const QUEST_DETAILS_BORDER_OFFSET_X = 53;
const QUEST_DETAILS_BORDER_OFFSET_Y = 103;
const QUEST_DETAILS_BORDER_X = QUEST_DETAILS_START_X - QUEST_DETAILS_BORDER_OFFSET_X;
const QUEST_DETAILS_BORDER_Y = QUEST_DETAILS_START_Y - QUEST_DETAILS_BORDER_OFFSET_Y;
const SCREEN_WIDTH = 175;

const questDetails: [string, string, string, string][] = [
	['The Rescue', 'Agnes', 'Rescue Erwin from the zombies', 'Wild Rune'],
];

export default class QuestDetailsScreen extends OverlayScreen {
	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, QUEST_DETAILS_BORDER_X, QUEST_DETAILS_BORDER_Y, SCREEN_WIDTH, 280);

		const questHeader = new Phaser.GameObjects.Text(
			scene,
			QUEST_DETAILS_BORDER_X - 15,
			QUEST_DETAILS_BORDER_Y - 15,
			'THE RESCUE',
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

		const questGiver = new Phaser.GameObjects.Text(
			scene,
			QUEST_DETAILS_BORDER_X - 15,
			QUEST_DETAILS_BORDER_Y + HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET,
			'QUEST GIVER: \n \t Agnes \n GOAL: \n \t Rescue Erwin from \n \t the zombies \n' +
				'REQUIREMENTS: \n \t Wild Rune \n',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'munro',
			}
		);
		questGiver.setOrigin(0);
		questGiver.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		questGiver.setScrollFactor(0);
		this.add(questGiver, true);

		const questGiverName = new Phaser.GameObjects.Text(
			scene,
			QUEST_DETAILS_BORDER_X - 5,
			QUEST_DETAILS_BORDER_Y + HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET + OFFSET_BETWEEN_LINES,
			'Agnes',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'munro',
			}
		);
		questGiverName.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		questGiverName.setScrollFactor(0);
		// this.add(questGiverName, true);

		const questDescription = new Phaser.GameObjects.Text(
			scene,
			QUEST_DETAILS_BORDER_X - 15,
			QUEST_DETAILS_BORDER_Y + HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET + OFFSET_BETWEEN_LINES * 2,
			'Goal:',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'munro',
			}
		);
		questDescription.setOrigin(0);
		questDescription.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		questDescription.setScrollFactor(0);
		// this.add(questDescription, true);

		const questDescriptionText = new Phaser.GameObjects.Text(
			scene,
			QUEST_DETAILS_BORDER_X - 5,
			QUEST_DETAILS_BORDER_Y + HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET + OFFSET_BETWEEN_LINES * 3,
			'Rescue Erwin from the zombies',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'munro',
			}
		);
		questDescriptionText.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		questDescriptionText.setScrollFactor(0);
		// this.add(questDescriptionText, true);

		const questRequirementsName = new Phaser.GameObjects.Text(
			scene,
			QUEST_DETAILS_BORDER_X - 15,
			QUEST_DETAILS_BORDER_Y + HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET + OFFSET_BETWEEN_LINES * 4,
			'Requirements:',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'munro',
			}
		);
		questRequirementsName.setOrigin(0);
		questRequirementsName.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		questRequirementsName.setScrollFactor(0);
		// this.add(questRequirementsName, true);

		const questRequirements = new Phaser.GameObjects.Text(
			scene,
			QUEST_DETAILS_BORDER_X - 5,
			QUEST_DETAILS_BORDER_Y + HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET + OFFSET_BETWEEN_LINES * 5,
			'Wild Rune',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'munro',
			}
		);
		questRequirements.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		questRequirements.setScrollFactor(0);
		// this.add(questRequirements, true);
	}
}
