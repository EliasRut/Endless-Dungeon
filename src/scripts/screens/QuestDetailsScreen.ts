import { UiDepths } from '../helpers/constants';
import { Quests } from '../helpers/quests';
import OverlayScreen from './OverlayScreen';

const HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET = 11;
const OFFSET_BETWEEN_BLOCKS = 8;

const QUEST_DETAILS_START_X = 500;
const QUEST_DETAILS_START_Y = 198;
const QUEST_DETAILS_BORDER_OFFSET_X = 53;
const QUEST_DETAILS_BORDER_OFFSET_Y = 103;
const QUEST_DETAILS_BORDER_X = QUEST_DETAILS_START_X - QUEST_DETAILS_BORDER_OFFSET_X;
const QUEST_DETAILS_BORDER_Y = QUEST_DETAILS_START_Y - QUEST_DETAILS_BORDER_OFFSET_Y;
const SCREEN_WIDTH = 175;

export default class QuestDetailsScreen extends OverlayScreen {
	activeQuestId: string | undefined = undefined;
	questTitle: Phaser.GameObjects.Text | undefined;
	questGiverHeader: Phaser.GameObjects.Text | undefined;
	questGiver: Phaser.GameObjects.Text | undefined;
	questDescriptionHeader: Phaser.GameObjects.Text | undefined;
	questDescription: Phaser.GameObjects.Text | undefined;
	questRequirementsHeader: Phaser.GameObjects.Text | undefined;
	// questRequirements: Phaser.GameObjects.Text | undefined;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(scene, QUEST_DETAILS_BORDER_X, QUEST_DETAILS_BORDER_Y, SCREEN_WIDTH, 280);

		this.setVisible(false);
	}

	public setActiveQuestId(id: string | undefined) {
		this.activeQuestId = id;
		this.update();
	}

	update() {
		this.questTitle?.destroy(true);
		this.questGiverHeader?.destroy(true);
		this.questGiver?.destroy(true);
		this.questDescriptionHeader?.destroy(true);
		this.questDescription?.destroy(true);
		this.questRequirementsHeader?.destroy(true);
		// this.questRequirements?.destroy(true);

		if (!this.activeQuestId) {
			return;
		}
		const quest = Quests[this.activeQuestId];

		this.questTitle = new Phaser.GameObjects.Text(
			this.scene,
			QUEST_DETAILS_BORDER_X - 15,
			QUEST_DETAILS_BORDER_Y - 15,
			quest.name,
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontSize: '20px',
				fontStyle: 'bold',
				fontFamily: 'endlessDungeon',
			}
		);
		this.questTitle.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questTitle.setScrollFactor(0);
		this.add(this.questTitle, true);

		this.questGiverHeader = new Phaser.GameObjects.Text(
			this.scene,
			QUEST_DETAILS_BORDER_X - 15,
			this.questTitle.y + this.questTitle.height + HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET,
			'QUEST GIVER:',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'endlessDungeon',
			}
		);
		this.questGiverHeader.setOrigin(0);
		this.questGiverHeader.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questGiverHeader.setScrollFactor(0);
		this.add(this.questGiverHeader, true);

		this.questGiver = new Phaser.GameObjects.Text(
			this.scene,
			QUEST_DETAILS_BORDER_X - 5,
			this.questGiverHeader.y + this.questGiverHeader.height,
			quest.questGiverName,
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'endlessDungeon',
			}
		);
		this.questGiver.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questGiver.setScrollFactor(0);
		this.add(this.questGiver, true);

		this.questDescriptionHeader = new Phaser.GameObjects.Text(
			this.scene,
			QUEST_DETAILS_BORDER_X - 15,
			this.questGiver.y + this.questGiver.height + OFFSET_BETWEEN_BLOCKS,
			'GOAL:',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'endlessDungeon',
			}
		);
		this.questDescriptionHeader.setOrigin(0);
		this.questDescriptionHeader.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questDescriptionHeader.setScrollFactor(0);
		this.add(this.questDescriptionHeader, true);

		this.questDescription = new Phaser.GameObjects.Text(
			this.scene,
			QUEST_DETAILS_BORDER_X - 5,
			this.questDescriptionHeader.y + this.questDescriptionHeader.height,
			quest.goal,
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'endlessDungeon',
			}
		);
		this.questDescription.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questDescription.setScrollFactor(0);
		this.add(this.questDescription, true);

		this.questRequirementsHeader = new Phaser.GameObjects.Text(
			this.scene,
			QUEST_DETAILS_BORDER_X - 15,
			this.questDescription.y + this.questDescription.height + OFFSET_BETWEEN_BLOCKS,
			'REQUIREMENTS:',
			{
				color: 'black',
				wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
				fontFamily: 'endlessDungeon',
			}
		);
		this.questRequirementsHeader.setOrigin(0);
		this.questRequirementsHeader.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questRequirementsHeader.setScrollFactor(0);
		this.add(this.questRequirementsHeader, true);

		// this.questRequirements = new Phaser.GameObjects.Text(
		// 	this.scene,
		// 	QUEST_DETAILS_BORDER_X - 5,
		// 	this.questRequirementsHeader.y + this.questRequirementsHeader.height,
		// 	quest.preconditions?.requiredItems ? quest.preconditions?.requiredItems : [],
		// 	{
		// 		color: 'black',
		// 		wordWrap: { width: SCREEN_WIDTH - 40, useAdvancedWrap: true },
		// 		fontFamily: 'endlessDungeon',
		// 	}
		// );
		// this.questRequirements.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		// this.questRequirements.setScrollFactor(0);
		// this.add(this.questRequirements, true);
	}
}
