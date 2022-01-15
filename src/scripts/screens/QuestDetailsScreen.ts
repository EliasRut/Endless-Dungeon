import { MENU_ICON_LEFT_BORDER } from '../drawables/ui/MenuIcon';
import { UiDepths, UI_SCALE } from '../helpers/constants';
import { Quests } from '../helpers/quests';
import OverlayScreen from './OverlayScreen';
import { STAT_SCREEN_RIGHT_BORDER } from './StatScreen';

const HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET = 11;
const OFFSET_BETWEEN_BLOCKS = 8;

const SCALED_WINDOW_WIDTH = window.innerWidth / UI_SCALE;

const AVAILABLE_WINDOW_WIDTH =
	SCALED_WINDOW_WIDTH - STAT_SCREEN_RIGHT_BORDER - MENU_ICON_LEFT_BORDER;

const QUEST_DETAILS_START_X = STAT_SCREEN_RIGHT_BORDER + AVAILABLE_WINDOW_WIDTH / 2 + 10;
const QUEST_DETAILS_START_Y = 24;
const SCREEN_WIDTH = 200;
const SCREEN_HEIGHT = 280;

export default class QuestDetailsScreen extends OverlayScreen {
	activeQuestId: string | undefined = undefined;
	questTitle: Phaser.GameObjects.Text | undefined;
	questGiverHeader: Phaser.GameObjects.Text | undefined;
	questGiver: Phaser.GameObjects.Text | undefined;
	questDescriptionHeader: Phaser.GameObjects.Text | undefined;
	questDescription: Phaser.GameObjects.Text | undefined;
	questRequirementsHeader: Phaser.GameObjects.Text | undefined;
	questRequirements: Phaser.GameObjects.Text | undefined;

	constructor(scene: Phaser.Scene) {
		// tslint:disable: no-magic-numbers
		super(
			scene,
			QUEST_DETAILS_START_X * UI_SCALE,
			QUEST_DETAILS_START_Y * UI_SCALE,
			SCREEN_WIDTH * UI_SCALE,
			SCREEN_HEIGHT * UI_SCALE
		);

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
		this.questRequirements?.destroy(true);

		if (!this.activeQuestId) {
			return;
		}
		const quest = Quests[this.activeQuestId];

		this.questTitle = new Phaser.GameObjects.Text(
			this.scene,
			(QUEST_DETAILS_START_X + 16) * UI_SCALE,
			(QUEST_DETAILS_START_Y + 12) * UI_SCALE,
			quest.name,
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${20 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		this.questTitle.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questTitle.setScrollFactor(0);
		this.questTitle.setOrigin(0);
		this.questTitle.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.questTitle, true);

		this.questGiverHeader = new Phaser.GameObjects.Text(
			this.scene,
			(QUEST_DETAILS_START_X + 16) * UI_SCALE,
			this.questTitle.y +
				this.questTitle.height +
				HEADER_FIRST_QUEST_DETAILS_TEXT_OFFSET * UI_SCALE,
			'Quest Giver:',
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		this.questGiverHeader.setOrigin(0);
		this.questGiverHeader.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questGiverHeader.setScrollFactor(0);
		this.questGiverHeader.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.questGiverHeader, true);

		this.questGiver = new Phaser.GameObjects.Text(
			this.scene,
			(QUEST_DETAILS_START_X + 24) * UI_SCALE,
			this.questGiverHeader.y + this.questGiverHeader.height,
			quest.questGiverName,
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		this.questGiver.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questGiver.setOrigin(0);
		this.questGiver.setScrollFactor(0);
		this.questGiver.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.questGiver, true);

		this.questDescriptionHeader = new Phaser.GameObjects.Text(
			this.scene,
			(QUEST_DETAILS_START_X + 16) * UI_SCALE,
			this.questGiver.y + this.questGiver.height + OFFSET_BETWEEN_BLOCKS * UI_SCALE,
			'Goal:',
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		this.questDescriptionHeader.setOrigin(0);
		this.questDescriptionHeader.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questDescriptionHeader.setScrollFactor(0);
		this.questDescriptionHeader.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.questDescriptionHeader, true);

		this.questDescription = new Phaser.GameObjects.Text(
			this.scene,
			(QUEST_DETAILS_START_X + 24) * UI_SCALE,
			this.questDescriptionHeader.y + this.questDescriptionHeader.height,
			quest.goal,
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		this.questDescription.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questDescription.setOrigin(0);
		this.questDescription.setScrollFactor(0);
		this.questDescription.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.questDescription, true);

		this.questRequirementsHeader = new Phaser.GameObjects.Text(
			this.scene,
			(QUEST_DETAILS_START_X + 16) * UI_SCALE,
			this.questDescription.y + this.questDescription.height + OFFSET_BETWEEN_BLOCKS * UI_SCALE,
			'Requirements:',
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		this.questRequirementsHeader.setOrigin(0);
		this.questRequirementsHeader.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questRequirementsHeader.setScrollFactor(0);
		this.questRequirementsHeader.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.questRequirementsHeader, true);

		this.questRequirements = new Phaser.GameObjects.Text(
			this.scene,
			(QUEST_DETAILS_START_X + 24) * UI_SCALE,
			this.questRequirementsHeader.y + this.questRequirementsHeader.height,
			quest.preconditions?.hasItems ? quest.preconditions?.hasItems : '',
			{
				color: 'white',
				wordWrap: { width: (SCREEN_WIDTH - 40) * UI_SCALE, useAdvancedWrap: true },
				fontSize: `${12 * UI_SCALE}pt`,
				fontFamily: 'endlessDungeon',
			}
		);
		this.questRequirements.setOrigin(0);
		this.questRequirements.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.questRequirements.setScrollFactor(0);
		this.questRequirements.setShadow(0, 1 * UI_SCALE, 'black');
		this.add(this.questRequirements, true);
	}
}
