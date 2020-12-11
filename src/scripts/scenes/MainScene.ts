import 'phaser';

import globalState from '../worldstate/index';

import StoryLine from '../models/StoryLine';
import SideQuestLog from '../models/SideQuestLog';

import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import EnemyToken from '../drawables/tokens/EnemyToken';
import RangedEnemyToken from '../drawables/tokens/RangedEnemyToken';
import MeleeEnemyToken from '../drawables/tokens/MeleeEnemyToken';
import WeaponToken from '../drawables/tokens/WeaponToken';
import FpsText from '../drawables/ui/FpsText';

import StatScreen from '../screens/StatScreen';
import InventoryScreen from '../screens/InventoryScreen';
import DialogScreen from '../screens/DialogScreen';

import KeyboardHelper from '../helpers/KeyboardHelper';
import { getFacing } from '../helpers/orientation';
import {
	NUM_ITEM_ICONS,
} from '../helpers/constants';
import { generateTilemap } from '../helpers/drawDungeon';
import { UI_DEPTHS } from '../helpers/uiDepths';
import DynamicLightingHelper from '../helpers/DynamicLightingHelper';
import Avatar from '../drawables/ui/Avatar';
import ScriptHelper from '../helpers/ScriptHelper';
import AbilityHelper from '../helpers/AbilityHelper';
import BackpackIcon from '../drawables/ui/BackpackIcon';

const FADE_IN_TIME_MS = 1000;
const FADE_OUT_TIME_MS = 1000;

const DEBUG__ITEM_OFFSET_X = 30;
const DEBUG__ITEM_OFFSET_Y = 30;

const CASTING_SPEED_MS = 250;

const CONNECTION_POINT_THRESHOLD_DISTANCE = 32;

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
	fpsText: Phaser.GameObjects.Text;

	keyboardHelper: KeyboardHelper;
	dynamicLightingHelper?: DynamicLightingHelper;
	scriptHelper: ScriptHelper;
	abilityHelper: AbilityHelper;

	mainCharacter: PlayerCharacterToken;
	enemy: EnemyToken[];
	groundItem: WeaponToken[];

	overlayScreens: {
		inventory: InventoryScreen;
		statScreen: StatScreen;
		dialogScreen: DialogScreen;
	};
	alive: number;
	isPaused = false;

	avatar: Avatar;
	backpackIcon: BackpackIcon;
	tileLayer: Phaser.Tilemaps.DynamicTilemapLayer;

	useDynamicLighting = false;
	storyLine: StoryLine;
	sideQuestLog: SideQuestLog;

	constructor() {
		super({ key: 'MainScene' });
	}

	create() {
		this.alive = 0;
		// tslint:disable-next-line:no-unused-expression
		this.cameras.main.fadeIn(FADE_IN_TIME_MS);

		this.generateStory();

		this.enemy = [];
		this.groundItem = [];
		const [startX, startY] = this.drawRoom();

		this.useDynamicLighting = globalState.roomAssignment[globalState.currentLevel].dynamicLighting;

		if (this.useDynamicLighting) {
			this.dynamicLightingHelper = new DynamicLightingHelper(this.tileLayer);
		}

		this.mainCharacter = new PlayerCharacterToken(this, startX, startY);
		this.mainCharacter.setDepth(UI_DEPTHS.TOKEN_MAIN_LAYER);
		this.cameras.main.startFollow(this.mainCharacter, false);
		this.physics.add.collider(this.mainCharacter, this.tileLayer);

		const rndItem = Math.floor(Math.random() * NUM_ITEM_ICONS); // todo calculate from tileset
		const length = this.groundItem.push(new WeaponToken(
			this,
			startX - DEBUG__ITEM_OFFSET_X,
			startY - DEBUG__ITEM_OFFSET_Y,
			rndItem));
		this.groundItem[length - 1].setDepth(UI_DEPTHS.TOKEN_BACKGROUND_LAYER);

		this.overlayScreens = {
			statScreen: new StatScreen(this),
			inventory: new InventoryScreen(this),
			dialogScreen: new DialogScreen(this)
		};

		this.fpsText = new FpsText(this);
		this.backpackIcon = new BackpackIcon(this);
		this.avatar = new Avatar(this);

		this.keyboardHelper = new KeyboardHelper(this);
		this.abilityHelper = new AbilityHelper(this);
		this.scriptHelper = new ScriptHelper(this);

		this.sound.play('testSound', {volume: 0.08, loop: true});
	}

	drawRoom() {
		const dungeonLevel = globalState.dungeon.levels.get(globalState.currentLevel);
		if (!dungeonLevel) {
			throw new Error(`No dungeon level was created for level name ${globalState.currentLevel}.`);
		}

		const {
			startPositionX,
			startPositionY,
			npcs
		} = dungeonLevel;

		this.tileLayer = generateTilemap(this, dungeonLevel);

		this.tileLayer.setDepth(UI_DEPTHS.BASE_TILE_LAYER);
		let npcCounter = 0;
		npcs.forEach((npc) => {
			switch(npc.id) {
				case 'red-link': {
					this.enemy[npcCounter] =
						new MeleeEnemyToken( this, npc.x, npc.y, npc.id);
					break;
				}
				case 'red-ball': {
					this.enemy[npcCounter] =
						new RangedEnemyToken( this, npc.x, npc.y, npc.id);
					break;
				}
				default: {
					throw new Error(`Map called for unknown enemy "${npc.id}".`);
				}
			}

			this.enemy[npcCounter].setDepth(UI_DEPTHS.TOKEN_MAIN_LAYER);
			this.physics.add.collider(this.enemy[npcCounter], this.tileLayer);
			npcCounter++;
		});

		return [startPositionX, startPositionY];
	}

	renderDebugGraphics() {
		// tslint:disable: no-magic-numbers
		const debugGraphics = this.add.graphics().setAlpha(0.75);
		this.tileLayer.renderDebug(debugGraphics, {
			tileColor: null, // Color of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
			faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		});
		// tslint:enable: no-magic-numbers
	}

	update(globalTime: number, _delta: number) {
		this.fpsText.update();

		if(globalState.playerCharacter.health <= 0 && this.alive ===0){
			this.cameras.main.fadeOut(FADE_OUT_TIME_MS);
			// tslint:disable-next-line: no-console
			console.log('you died');
			this.alive = 1;
			// this.scene.pause();
			return;
		}

		this.scriptHelper.handleScripts(globalTime);

		if (this.isPaused) {
			return;
		}

		const castAbilities = this.keyboardHelper.getCastedAbilities(globalTime);
		const msSinceLastCast = this.keyboardHelper.getMsSinceLastCast(globalTime);
		const isCasting = msSinceLastCast < CASTING_SPEED_MS;

		const [xFacing, yFacing] = this.keyboardHelper.getCharacterFacing();
		const newFacing = getFacing(xFacing, yFacing);

		const hasMoved = isCasting ? false : (xFacing !== 0 || yFacing !== 0);
		const playerAnimation = globalState.playerCharacter.updateMovingState(hasMoved, newFacing);
		if (playerAnimation) {
			this.mainCharacter.play(playerAnimation);
		}

		const speed = isCasting ? 0 : globalState.playerCharacter.getSpeed();

		this.mainCharacter.setVelocity(xFacing * speed, yFacing * speed);
		this.mainCharacter.body.velocity.normalize().scale(speed);

		globalState.playerCharacter.x = Math.round(this.mainCharacter.x);
		globalState.playerCharacter.y = Math.round(this.mainCharacter.y);

		this.abilityHelper.update(castAbilities);

		this.overlayScreens.statScreen.update();

		const cooldowns = this.keyboardHelper.getAbilityCooldowns(globalTime);
		this.avatar.update(cooldowns);

		if (this.useDynamicLighting && this.dynamicLightingHelper) {
			this.dynamicLightingHelper.updateDynamicLighting();
		}

		this.enemy.forEach(curEnemy => {
			curEnemy.update(globalTime);
		});

		// TODO: remove items that are picked up
		this.groundItem.forEach(curItem => {
			curItem.update(this);
		});

		// Check if the player is close to a connection point and move them if so
		globalState.dungeon.levels.get(globalState.currentLevel)?.connections.forEach((connection) => {
			if (Math.hypot(
						connection.x - globalState.playerCharacter.x,
						connection.y - globalState.playerCharacter.y) < CONNECTION_POINT_THRESHOLD_DISTANCE) {
				globalState.currentLevel = connection.targetMap;
				this.scene.start('RoomPreloaderScene');
			}
		});
	}

	pause() {
		this.isPaused = true;
		this.physics.pause();
	}

	resume() {
		this.isPaused = false;
		this.physics.resume();
	}

	generateStory() {
		if(!this.storyLine) {
			this.storyLine = new StoryLine();
			// tslint:disable-next-line: no-console
			console.log(this.storyLine);
			const mainQuests = this.storyLine.storyLineData.mainQuests;
			this.sideQuestLog = new SideQuestLog(mainQuests.length, this.storyLine.storyLineData.themes);
			// tslint:disable-next-line: no-console
			console.log(this.sideQuestLog);

			for(let i = 0; i < mainQuests.length; i++) {
				const sideQuestRooms: string[] = [];
				for(const sideQuest of this.sideQuestLog.sideQuests) {
					if(sideQuest.level === i) {
						sideQuestRooms.concat(sideQuest.rooms);
					}
				}
				globalState.roomAssignment['dungeonLvl' + i] = {
					dynamicLighting: true,
					rooms: mainQuests[i].rooms.concat(sideQuestRooms)
				};
			}
		}
	}
}