import { NpcOptions } from '../../../../typings/custom';
import { Faction } from '../../helpers/constants';
import globalState from '../../worldstate';
import Character from '../../worldstate/Character';
import CharacterToken from './CharacterToken';
import { getNextQuestId, hasAnyOpenQuests, loadQuestScript } from '../../helpers/quests';
import MainScene from '../../scenes/MainScene';

const BODY_RADIUS = 10;
const BODY_X_OFFSET = 10;
const BODY_Y_OFFSET = 12;

const NPC_DAMAGE = 10;
const NPC_HEALTH = 10;
const NPC_SPEED = 80;

export default class NpcToken extends CharacterToken {
	questGiverId?: string;
	traderId?: string;
	openQuestSymbol?: Phaser.GameObjects.Image;

	constructor(
			scene: Phaser.Scene,
			x: number,
			y: number,
			type: string,
			id: string,
			options?: NpcOptions
		) {
		super(scene, x, y, 'empty-tile', type, id);
		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.body.setCircle(BODY_RADIUS, BODY_X_OFFSET, BODY_Y_OFFSET);

		this.questGiverId = options?.questGiverId;
		this.traderId = options?.traderId;

		globalState.npcs[id] = new Character(
			type,
			NPC_DAMAGE,
			NPC_HEALTH,
			NPC_SPEED);

		this.play(`${type}-idle-s`);
		this.faction = Faction.NPCS;
	}

	update(globalTime: number) {
		if (this.questGiverId && hasAnyOpenQuests(this.questGiverId)) {
			const yOffset = Math.abs(500 - (globalTime % 1000)) / 125;
			if (!this.openQuestSymbol) {
				this.openQuestSymbol = this.scene.add.image(
					this.body.x + 10,
					this.body.y - 12 - yOffset,
					'quest'
				);
			} else {
				this.openQuestSymbol.x = this.body.x + 10;
				this.openQuestSymbol.y = this.body.y - 12 - yOffset;
			}
			const player = globalState.playerCharacter;
			if (this.getDistance(player.x, player.y) < 60) {
				const mainScene = this.scene as MainScene;
				if (!mainScene.scriptHelper.isScriptRunning()) {
					const nextQuestId = getNextQuestId(this.questGiverId);
					if (nextQuestId) {
						globalState.quests[nextQuestId] = {
							questFinished: false,
							questGiverId: this.questGiverId,
							states: {}
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
