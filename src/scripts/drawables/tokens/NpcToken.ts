import { NpcOptions } from '../../../../typings/custom';
import { Faction, SCALE, UiDepths, NORMAL_ANIMATION_FRAME_RATE } from '../../helpers/constants';
import globalState from '../../worldstate';
import Character from '../../worldstate/Character';
import CharacterToken from './CharacterToken';
import { getNextQuestId, hasAnyOpenQuests, loadQuestScript } from '../../helpers/quests';
import MainScene from '../../scenes/MainScene';

const BODY_RADIUS = 8;
const BODY_X_OFFSET = 12;
const BODY_Y_OFFSET = 16;

const NPC_DAMAGE = 10;
const NPC_HEALTH = 10;
const NPC_SPEED = 80;

export default class NpcToken extends CharacterToken {
	questGiverId?: string;
	traderId?: string;
	openQuestSymbol?: Phaser.GameObjects.Image;

	constructor(
		scene: MainScene,
		x: number,
		y: number,
		type: string,
		id: string,
		options?: NpcOptions
	) {
		super(scene, x, y, type, type, id);
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		this.questGiverId = options?.questGiverId;
		this.traderId = options?.traderId;

		this.stateObject = new Character(id, type, NPC_DAMAGE, NPC_HEALTH, NPC_SPEED);
		globalState.npcs[id] = this.stateObject;

		this.play({ key: `${type}-idle-s`, frameRate: NORMAL_ANIMATION_FRAME_RATE });
		this.faction = Faction.NPCS;
	}

	update(globalTime: number, deltaTime: number) {
		super.update(globalTime, deltaTime);
		if (this.questGiverId && hasAnyOpenQuests(this.questGiverId)) {
			const yOffset = (Math.abs(500 - (globalTime % 1000)) / 125) * SCALE;
			if (!this.openQuestSymbol) {
				this.openQuestSymbol = this.scene.add.image(
					this.body.x + 8 * SCALE,
					this.body.y - (14 - yOffset) * SCALE,
					'quest'
				);
				this.openQuestSymbol.setDepth(UiDepths.TOKEN_FOREGROUND_LAYER);
				this.openQuestSymbol.setScale(SCALE);
			} else {
				this.openQuestSymbol.x = this.body.x + 8 * SCALE;
				this.openQuestSymbol.y = this.body.y - (22 - yOffset) * SCALE;
			}
			const player = globalState.playerCharacter;
			if (this.getDistanceToWorldStatePosition(player.x, player.y) < 60 * SCALE) {
				const mainScene = this.scene as MainScene;
				if (!mainScene.scriptHelper.isScriptRunning()) {
					const nextQuestId = getNextQuestId(this.questGiverId);
					if (nextQuestId) {
						globalState.quests[nextQuestId] = {
							questFinished: false,
							questGiverId: this.questGiverId,
							states: {},
						};
						mainScene.scriptHelper.loadScript(loadQuestScript(nextQuestId));
					}
				}
			}
		} else if (this.questGiverId && this.openQuestSymbol) {
			this.openQuestSymbol.destroy(true);
		}
	}
}
