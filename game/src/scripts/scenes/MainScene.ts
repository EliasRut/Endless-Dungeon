import 'phaser';

import globalState from '../worldstate/index';
import Character, { updateStatus } from '../worldstate/Character';

import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import FpsText from '../drawables/ui/FpsText';

import StatScreen from '../screens/StatScreen';
import InventoryScreen from '../screens/InventoryScreen';
import DialogScreen from '../screens/DialogScreen';
import ItemScreen from '../screens/ItemScreen';

import KeyboardHelper from '../helpers/KeyboardHelper';
import {
	getCharacterSpeed,
	getFacing8Dir,
	updateMovingState,
	isCollidingTile,
	getTwoLetterFacingName,
} from '../helpers/movement';
import {
	BaseFadingLabelFontSize,
	COMBO_CAST_RESET_DELAY,
	DEBUG_PHYSICS,
	Faction,
	FadingLabelData,
	FadingLabelSize,
	FPS_DEBUG,
	MOBILE_INTERACTION_OFFSETS,
	NORMAL_ANIMATION_FRAME_RATE,
	SCALE,
	UiDepths,
	UI_SCALE,
	Facings,
	getIsMultiplayer,
} from '../helpers/constants';
import { generateTilemap } from '../helpers/drawDungeon';
import DynamicLightingHelper from '../helpers/DynamicLightingHelper';
import PlayerCharacterAvatar from '../drawables/ui/PlayerCharacterAvatar';
import NPCAvatar from '../drawables/ui/NPCAvatar';
import ScriptHelper from '../helpers/ScriptHelper';
import AbilityHelper from '../helpers/AbilityHelper';
import BackpackIcon from '../drawables/ui/BackpackIcon';
import SettingsIcon from '../drawables/ui/SettingsIcon';
import { spawnNpc } from '../helpers/spawn';
import CharacterToken from '../drawables/tokens/CharacterToken';
import { NpcOptions, LightingSource } from '../../../typings/custom';
import WorldItemToken from '../drawables/tokens/WorldItemToken';
import SettingsScreen from '../screens/SettingsScreen';
import EnchantingScreen from '../screens/EnchantingScreen';
import DoorToken from '../drawables/tokens/DoorToken';

import { DungeonRunData } from '../models/DungeonRunData';
import { TILE_HEIGHT, TILE_WIDTH } from '../helpers/generateDungeon';
import { getItemDataForName, getItemTexture } from '../../items/itemData';
import Minimap from '../drawables/ui/Minimap';
import LevelName from '../drawables/ui/LevelName';
import QuestsIcon from '../drawables/ui/QuestsIcon';
import QuestLogScreen from '../screens/QuestLogScreen';
import QuestDetailsScreen from '../screens/QuestDetailsScreen';
import ContentManagementScreen from '../screens/ContentManagementScreen';
import EnchantIcon from '../drawables/ui/EnchantIcon';
import FollowerToken from '../drawables/tokens/FollowerToken';
import { COLUMNS_PER_TILESET } from '../helpers/constants';
import { updateAnimatedTile } from '../helpers/cells';
import { getAudio, setDrumMute } from '../audiogen/app';
import { getClosestTarget, getDistanceToWorldStatePosition } from '../helpers/targetingHelpers';
import { Client, Room } from 'colyseus.js';

const FADE_IN_TIME_MS = 1000;
const FADE_OUT_TIME_MS = 1000;

export const CASTING_SPEED_MS = 500;

const CONNECTION_POINT_THRESHOLD_DISTANCE = 32;
const STEP_SOUND_TIME = 200;

const MOBILE_PAD_BACKGROUND_X_OFFSET = 96 * UI_SCALE;
const MOBILE_PAD_BACKGROUND_Y_OFFSET = 96 * UI_SCALE;
const MOBILE_PAD_FOREGROUND_X_OFFSET = 96 * UI_SCALE;

const DEATH_RESPAWN_TIME = 3000;

const FADING_LABEL_Y_DISTANCE = 64;
const FADING_LABEL_X_DISTANCE = 16;

const MINIMUM_CASTING_TIME_MS = 80;

const TILE_ANIMATION_STEP_TIME = (1000 / NORMAL_ANIMATION_FRAME_RATE) * 8;

const MS_BETWEEN_PLAYER_POSITION_UPDATES = 40;

let LAST_ANIMATION_AVERAGES: number[] = [];

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
	fpsText?: Phaser.GameObjects.Text;
	levelName?: LevelName;
	minimap?: Minimap;

	keyboardHelper: KeyboardHelper;
	dynamicLightingHelper?: DynamicLightingHelper;
	scriptHelper: ScriptHelper;
	abilityHelper: AbilityHelper;

	mainCharacter: PlayerCharacterToken;
	follower?: FollowerToken;
	npcMap: { [id: string]: CharacterToken };
	doorMap: { [id: string]: DoorToken };
	worldItems: WorldItemToken[];
	fadingLabels: FadingLabelData[];

	overlayScreens: {
		inventory: InventoryScreen;
		statScreen: StatScreen;
		dialogScreen: DialogScreen;
		settingsScreen: SettingsScreen;
		questLogScreen: QuestLogScreen;
		questDetailsScreen: QuestDetailsScreen;
		itemScreen: ItemScreen;
		contentManagementScreen: ContentManagementScreen;
		enchantingScreen: EnchantingScreen;
	};
	alive: number;
	isPaused = false;
	blockUserInteraction = false;

	mobilePadBackground?: Phaser.GameObjects.Image;
	mobilePadStick?: Phaser.GameObjects.Image;

	playerCharacterAvatar: PlayerCharacterAvatar;
	nPCAvatar?: NPCAvatar;

	icons: {
		backpackIcon: BackpackIcon;
		settingsIcon: SettingsIcon;
		questsIcon: QuestsIcon;
		enchantIcon: EnchantIcon;
	};

	overlayPressed: number = 0;

	tileLayer: Phaser.Tilemaps.TilemapLayer;
	decorationLayer: Phaser.Tilemaps.TilemapLayer;
	overlayLayer: Phaser.Tilemaps.TilemapLayer;

	navigationalMap: boolean[][];

	useDynamicLighting = false;
	dungeonRunData: DungeonRunData;

	lastSave: number = Date.now();

	lastStepLeft: number | undefined;

	lastScriptUnpausing: number = Date.now();
	lastTileAnimationStep: number = Date.now();
	lastPlayerPositionUpdate: number = Date.now();
	lastPlayerPosition: { x: number; y: number } | undefined;

	hasCasted: boolean = false;
	lastCastingAnimation: string | undefined;

	showHealthbars: boolean = true;

	lightingSources: LightingSource[] = [];

	serverRoom?: Room;

	constructor() {
		super({ key: 'MainScene' });
		this.connectToServer();
	}

	// If nothing is found, we default to desktop
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator?.userAgent || ''
	);

	async connectToServer() {
		const endpoint = 'ws://localhost:2567';
		const options = {
			roomName: 'dungeon',
		};

		const client = new Client(endpoint);
		this.serverRoom = await client.joinOrCreate(options.roomName, {
			level: globalState.currentLevel,
		});

		console.log('joined room "dungeon" successfully!');

		this.serverRoom.onMessage('message-type', (payload) => {
			// logic
		});

		this.serverRoom.onStateChange((state) => {
			state.entities.forEach((entity: any, entityId: string) => {
				if (this.npcMap[entityId]) {
					console.log(`Moving ${entityId} to ${entity.x}, ${entity.y}`);
					const npc = this.npcMap[entityId];

					npc.x = entity.x;
					npc.y = entity.y;
					npc.setVelocity(entity.velocityX, entity.velocityY);
				} else if (entityId !== globalState.playerId && entityId.startsWith('player')) {
					console.log(`Spawning player ${entityId} at ${entity.x}, ${entity.y}`);
					this.addNpc(entityId, 'player', entity.x, entity.y, 1, 0, 0);
				}
			});
		});

		this.serverRoom.onLeave((code) => {
			console.log('left');
		});

		// setInterval(() => {
		//     const updates: any[] = [];
		//     room.state.entities.forEach((entity) => {
		//         if (Math.random() > 0.25) {
		//             return;
		//         }

		//         const x = Math.floor(Math.random() * 640);
		//         const y = Math.floor(Math.random() * 640);
		//         const velocityX = Math.floor(Math.random() * 10) - 5;
		//         const velocityY = Math.floor(Math.random() * 10) - 5;
		//         const facing = Math.floor(Math.random() * 4);

		//         updates.push([entity.id, x, y, velocityX, velocityY, facing]);
		//     });
		//     room.send('updatePositions', updates);
		// }, 1000 / 12);
	}

	create() {
		this.input.addPointer(2);
		// this.cameras.main.zoom = 2;
		this.alive = 0;
		// tslint:disable-next-line:no-unused-expression
		this.cameras.main.fadeIn(FADE_IN_TIME_MS);

		this.npcMap = {};
		this.doorMap = {};
		this.worldItems = [];
		this.fadingLabels = [];
		const [startX, startY] = this.drawRoom();

		this.useDynamicLighting = globalState.currentLevel.startsWith('dungeonLevel');

		if (this.useDynamicLighting) {
			this.dynamicLightingHelper = new DynamicLightingHelper(
				this.tileLayer,
				this.decorationLayer,
				this.overlayLayer,
				this.doorMap,
				this
			);
		}

		this.mainCharacter = new PlayerCharacterToken(
			this,
			globalState.playerCharacter.x || startX,
			globalState.playerCharacter.y || startY,
			globalState.playerId
		);

		if (getIsMultiplayer()) {
			this.connectToServer().then(() => {
				const entitiesToRegister: any[][] = [];
				// Process npcs
				Object.keys(this.npcMap).forEach((key) => {
					const npc = this.npcMap[key];
					entitiesToRegister.push([
						npc.id,
						npc.x,
						npc.y,
						npc.body.velocity.x,
						npc.body.velocity.y,
						npc.stateObject.currentFacing,
						npc.stateObject.health,
					]);
				});
				// Process player
				entitiesToRegister.push([
					this.mainCharacter.id,
					this.mainCharacter.x,
					this.mainCharacter.y,
					this.mainCharacter.body.velocity.x,
					this.mainCharacter.body.velocity.y,
					this.mainCharacter.stateObject.currentFacing,
					this.mainCharacter.stateObject.health,
				]);
				this.serverRoom!.send('registerEntities', entitiesToRegister);
			});
		}

		this.mainCharacter.setScale(SCALE);
		this.mainCharacter.setDepth(UiDepths.TOKEN_MAIN_LAYER);
		this.cameras.main.startFollow(this.mainCharacter, false);
		this.physics.add.collider(this.mainCharacter, this.tileLayer);
		this.physics.add.collider(this.mainCharacter, this.decorationLayer);
		Object.values(this.doorMap).forEach((door) => {
			this.physics.add.collider(this.mainCharacter, door);
		});
		Object.values(this.npcMap).forEach((npc) => {
			this.physics.add.collider(this.mainCharacter, npc, () => {
				npc.onCollide(true);
			});
		});
		Object.values(this.npcMap).forEach((npc) => {
			this.physics.add.collider(Object.values(this.npcMap), npc, (collidingToken) => {
				const castCollidingToken = collidingToken as CharacterToken;
				npc.onCollide(castCollidingToken.faction !== npc.faction);
			});
		});

		if (globalState.activeFollower !== '') {
			this.spawnFollower(
				globalState.playerCharacter.x || startX,
				globalState.playerCharacter.y || startY,
				globalState.activeFollower,
				globalState.activeFollower
			);
		}

		if (FPS_DEBUG) {
			this.fpsText = new FpsText(this);
		}
		this.icons = {
			backpackIcon: new BackpackIcon(this),
			settingsIcon: new SettingsIcon(this),
			questsIcon: new QuestsIcon(this),
			enchantIcon: new EnchantIcon(this),
		};
		if (globalState.currentLevel.startsWith('dungeonLevel')) {
			this.levelName = new LevelName(this);
			this.minimap = new Minimap(this);
		}
		this.playerCharacterAvatar = new PlayerCharacterAvatar(this);
		if (this.isMobile) {
			this.mobilePadBackground = this.add.image(
				MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_BACKGROUND_X_OFFSET,
				this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET,
				'pad-background'
			);
			this.mobilePadBackground.setScrollFactor(0);
			this.mobilePadBackground.setDepth(UiDepths.UI_FOREGROUND_LAYER);
			this.add.existing(this.mobilePadBackground);

			this.mobilePadStick = this.add.image(
				MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_FOREGROUND_X_OFFSET,
				this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET,
				'pad-stick'
			);
			this.mobilePadStick.setScrollFactor(0);
			this.mobilePadStick.setDepth(UiDepths.UI_STICK_LAYER);

			const hitArea = new Phaser.Geom.Circle(152, 152, 304);
			this.mobilePadBackground.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
			this.mobilePadBackground.on('pointerup', (event: any) => {
				this.mobilePadStick!.x = MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_FOREGROUND_X_OFFSET;
				this.mobilePadStick!.y = this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET;
			});
			this.mobilePadBackground.on('pointermove', (event: any) => {
				if (!event.isDown) {
					this.mobilePadStick!.x = MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_FOREGROUND_X_OFFSET;
					this.mobilePadStick!.y = this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET;
					return;
				}

				this.mobilePadStick!.x = Math.min(
					MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_FOREGROUND_X_OFFSET + 60,
					Math.max(
						MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_FOREGROUND_X_OFFSET - 60,
						event.position.x
					)
				);
				this.mobilePadStick!.y = Math.min(
					this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET + 60,
					Math.max(this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET - 60, event.position.y)
				);
			});
			this.mobilePadBackground.on('pointerover', (_: any, event: any) => {
				if (!event.isDown) {
					this.mobilePadStick!.x = MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_FOREGROUND_X_OFFSET;
					this.mobilePadStick!.y = this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET;
					return;
				}

				Math.min(
					MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_FOREGROUND_X_OFFSET + 60,
					Math.max(
						MOBILE_INTERACTION_OFFSETS + MOBILE_PAD_FOREGROUND_X_OFFSET - 60,
						event.position.x
					)
				);
				Math.min(
					this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET + 60,
					Math.max(this.cameras.main.height - MOBILE_PAD_BACKGROUND_Y_OFFSET - 60, event.position.y)
				);
			});
			this.add.existing(this.mobilePadStick);
		}

		this.overlayScreens = {
			itemScreen: new ItemScreen(this),
			statScreen: new StatScreen(this),
			inventory: new InventoryScreen(this),
			dialogScreen: new DialogScreen(this),
			settingsScreen: new SettingsScreen(this),
			questLogScreen: new QuestLogScreen(this),
			questDetailsScreen: new QuestDetailsScreen(this),
			contentManagementScreen: new ContentManagementScreen(this),
			enchantingScreen: new EnchantingScreen(this),
		};

		this.icons.backpackIcon.setScreens();
		this.icons.settingsIcon.setScreens();
		this.icons.questsIcon.setScreens();

		this.keyboardHelper = new KeyboardHelper(this);
		this.abilityHelper = new AbilityHelper(this);
		this.scriptHelper = new ScriptHelper(this);

		// this.sound.stopAll();
		// if (globalState.currentLevel === 'town') {
		// 	this.sound.play('score-town', { volume: 0.05, loop: true });
		// } else {
		// 	this.sound.play('score-dungeon', { volume: 0.08, loop: true });
		// }

		if (DEBUG_PHYSICS) {
			this.renderDebugGraphics();
		}

		this.connectToServer();
	}

	despawnFollower() {
		if (this.follower) {
			this.follower.destroy(true);
			this.follower = undefined;
		}
		if (this.nPCAvatar) {
			this.nPCAvatar.destroy(true);
			this.nPCAvatar = undefined;
		}
	}

	spawnFollower(x: number, y: number, type: string, id: string) {
		this.follower = new FollowerToken(this, x, y, type, id);
		this.follower.setScale(SCALE);
		this.follower.setDepth(UiDepths.TOKEN_MAIN_LAYER);
		this.physics.add.collider(this.follower, this.tileLayer);
		this.physics.add.collider(this.follower, this.decorationLayer);
		this.physics.add.collider(this.follower, this.mainCharacter);
		Object.values(this.npcMap).forEach((npc) => {
			this.physics.add.collider(this.follower!, npc, () => {
				npc.onCollide(true);
			});
		});
		this.nPCAvatar = new NPCAvatar(this, this.follower.id, 'icon-agnes');
	}

	addNpc(
		id: string,
		type: string,
		x: number,
		y: number,
		level: number,
		facingX: number,
		facingY: number,
		options?: NpcOptions
	) {
		const npc = spawnNpc(this, type, id, x, y, level, options);
		npc.setScale(SCALE);
		this.npcMap[id] = npc;
		if (globalState.npcs[id]) {
			const facing = getFacing8Dir(facingX, facingY);
			const animation = updateMovingState(globalState.npcs[id], false, facing, true);
			if (animation) {
				npc.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
			}
		}
		this.npcMap[id].setDepth(UiDepths.TOKEN_MAIN_LAYER);
		Object.entries(this.npcMap).forEach(([key, value]) => {
			this.physics.add.collider(this.npcMap[id], value);
		});
		this.physics.add.collider(this.npcMap[id], this.tileLayer, () => {
			npc.onCollide(false);
		});
		this.physics.add.collider(this.npcMap[id], this.decorationLayer, () => {
			npc.onCollide(false);
		});
		if (this.mainCharacter && npc.faction === Faction.ENEMIES) {
			this.physics.add.collider(this.npcMap[id], this.mainCharacter, () => {
				npc.onCollide(true);
			});
		}
		this.npcMap[id].script = options?.script;
		return npc;
	}

	addDoor(
		id: string,
		type: string,
		x: number,
		y: number,
		width: number,
		height: number,
		open: boolean
	) {
		if (!globalState.doors[id]) {
			globalState.doors[id] = {
				id,
				type,
				x,
				y,
				width,
				height,
				open,
			};
		}
		this.doorMap[id] = new DoorToken(this, x, y, type, id);
		this.doorMap[id].setDepth(UiDepths.TOKEN_BACKGROUND_LAYER);
		this.physics.add.collider(this.doorMap[id], this.mainCharacter);
		Object.values(this.npcMap).forEach((npc) => {
			this.physics.add.collider(this.doorMap[id], npc);
		});
		this.doorMap[id].setFrame(globalState.doors[id].open ? 1 : 0);
	}

	addFixedItem(id: string, x: number, y: number) {
		this.dropItem(
			x, // - DEBUG__ITEM_OFFSET_X,
			y, // - DEBUG__ITEM_OFFSET_Y,
			id
		);
	}

	changeDoorState(id: string, open: boolean) {
		if (open) {
			this.doorMap[id].open();
		} else {
			this.doorMap[id].close();
		}
	}

	drawRoom() {
		const dungeonLevel = globalState.dungeon.levels[globalState.currentLevel];
		const enemies = globalState.enemies;
		if (!dungeonLevel) {
			throw new Error(`No dungeon level was created for level name ${globalState.currentLevel}.`);
		}

		const isDungeon = globalState.currentLevel.startsWith('dungeonLevel');
		setDrumMute(0, true);
		setDrumMute(1, true);
		setDrumMute(2, true);
		setDrumMute(3, !isDungeon);

		const { startPositionX, startPositionY, npcs, doors, items, lightingSources } = dungeonLevel;

		const [tileLayer, decorationLayer, overlayLayer] = generateTilemap(this, dungeonLevel);

		this.tileLayer = tileLayer;
		this.decorationLayer = decorationLayer;
		this.overlayLayer = overlayLayer;

		this.navigationalMap = [];
		for (let y = 0; y < this.tileLayer.height; y++) {
			this.navigationalMap[y] = [];
			for (let x = 0; x < this.tileLayer.width; x++) {
				const tile = this.tileLayer.getTileAt(x, y);
				const decorationTile = this.decorationLayer.getTileAt(x, y);
				this.navigationalMap[y][x] =
					tile &&
					!isCollidingTile(tile.index) &&
					(!decorationTile || !isCollidingTile(decorationTile.index));
			}
		}

		this.tileLayer.setDepth(UiDepths.BASE_TILE_LAYER);
		this.tileLayer.setScale(SCALE);
		this.decorationLayer.setDepth(UiDepths.DECORATION_TILE_LAYER);
		this.decorationLayer.setScale(SCALE);
		this.overlayLayer.setDepth(UiDepths.TOP_TILE_LAYER);
		this.overlayLayer.setScale(SCALE);

		npcs.forEach((npc) => {
			if ((enemies[npc.id] && enemies[npc.id].health > 0) || !enemies[npc.id]) {
				this.addNpc(
					npc.id,
					npc.type,
					npc.x,
					npc.y,
					dungeonLevel.enemyLevel,
					npc.facingX || 0,
					npc.facingY || 0,
					{
						script: npc.script,
						questGiverId: npc.questGiverId,
						traderId: npc.traderId,
						enemyData: npc.options,
					}
				);
			}
		});
		// this.addNpc(
		// 	"lichking",
		// 	'lich-king',
		// 	globalState.playerCharacter.x+1,
		// 	globalState.playerCharacter.y+1,
		// 	1,
		// 	0,
		// 	0
		// )

		doors.forEach((door) => {
			this.addDoor(
				door.id,
				door.type,
				door.x * SCALE,
				door.y * SCALE,
				door.width,
				door.height,
				door.open
			);
		});

		items.forEach((item) => {
			this.addFixedItem(item.id, item.x * SCALE, item.y * SCALE);
		});

		lightingSources.forEach((lightingSource: LightingSource) => {
			this.lightingSources.push({
				...lightingSource,
				x: lightingSource.x / TILE_WIDTH,
				y: lightingSource.y / TILE_HEIGHT,
			});
		});

		// console.log(`Dropping item at ${startPositionX}, ${startPositionY}`);
		// this.dropItem(
		// 	startPositionX,
		// 	startPositionY,
		// 	generateRandomItem(1, 0, 0, 0, 0)
		// );

		const transitionCoordinates = globalState.transitionStack[globalState.currentLevel];
		let usedStartPositionX = startPositionX;
		let usedStartPositionY = startPositionY;
		if (transitionCoordinates) {
			const targetRoom = globalState.dungeon.levels[globalState.currentLevel]?.rooms.find(
				(room) => room.roomName === transitionCoordinates.targetRoom
			);
			if (targetRoom) {
				usedStartPositionX = (targetRoom.x + transitionCoordinates.targetX) * TILE_WIDTH;
				usedStartPositionY = (targetRoom.y + transitionCoordinates.targetY) * TILE_HEIGHT;
			}
		}

		return [usedStartPositionX, usedStartPositionY];
	}

	renderDebugGraphics() {
		// tslint:disable: no-magic-numbers
		const tileDebugGraphics = this.add.graphics().setAlpha(0.75);
		const decorationDebugGraphics = this.add.graphics().setAlpha(0.75);
		this.tileLayer.renderDebug(tileDebugGraphics, {
			tileColor: null, // Color of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
			faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
		});
		this.decorationLayer.renderDebug(decorationDebugGraphics, {
			tileColor: null, // Color of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(0, 134, 48, 255),
			faceColor: new Phaser.Display.Color(0, 39, 37, 255), // Color of colliding face edges
		});
		// tslint:enable: no-magic-numbers
	}

	update(globalTime: number, delta: number) {
		globalState.gameTime += delta;

		if (FPS_DEBUG) {
			this.fpsText?.update();
		}
		this.minimap?.update();
		this.keyboardHelper.updateGamepad();
		updateStatus(globalState.gameTime, globalState.playerCharacter);

		if (this.keyboardHelper.isKKeyPressed()) {
			globalState.clearState();
			location.reload();
		}

		if (this.keyboardHelper.isEnterPressed()) {
			if (this.scriptHelper.isScriptRunning()) {
				this.scriptHelper.handleScriptStep(globalState.gameTime, true);
				return;
			}
		}

		let open = false;
		Object.values(this.icons).forEach((icon) => {
			if (icon.open) open = true;
		});
		if (this.keyboardHelper.isSettingsPressed(open)) {
			if (!this.scriptHelper.isScriptRunning()) {
				if (this.handleOverlayCooldown()) {
					this.closeAllIconScreens();
					if (!open) this.icons.settingsIcon.openScreen();
				}
			} else {
				this.scriptHelper.handleScriptStep(globalState.gameTime, true);
				return;
			}
		}

		open = this.icons.backpackIcon.open;
		if (
			this.keyboardHelper.isInventoryPressed() &&
			!this.scriptHelper.isScriptRunning() &&
			this.handleOverlayCooldown()
		) {
			this.closeAllIconScreens();
			if (!open) this.icons.backpackIcon.openScreen();
		}
		//this.overlayScreens.inventory.interactInventory(['pressed'], globalState.gameTime); // <= dunno what this is for, delete if no inventory bugs are found

		open = this.icons.questsIcon.open;
		if (
			this.keyboardHelper.isQuestsPressed() &&
			!this.scriptHelper.isScriptRunning() &&
			this.handleOverlayCooldown()
		) {
			this.closeAllIconScreens();
			if (!open) this.icons.questsIcon.openScreen();
		}

		open = this.icons.enchantIcon.open;
		if (
			this.keyboardHelper.isEnchantPressed() &&
			!this.scriptHelper.isScriptRunning() &&
			this.handleOverlayCooldown()
		) {
			this.closeAllIconScreens();
			if (!open) this.icons.enchantIcon.openScreen();
		}

		if (globalState.playerCharacter.health <= 0 && this.alive === 0) {
			this.cameras.main.fadeOut(FADE_OUT_TIME_MS);
			// tslint:disable-next-line: no-console
			console.log('you died');
			setTimeout(() => {
				globalState.clearState();
				location.reload();
			}, DEATH_RESPAWN_TIME);
			this.alive = 1;
			// this.scene.pause();
			return;
		}

		this.overlayScreens.statScreen.update();

		if (this.isPaused) {
			this.scriptHelper.handleScripts(globalState.gameTime);
			if (this.icons.backpackIcon.open)
				this.overlayScreens.inventory.interactInventory(
					this.keyboardHelper.getInventoryKeyPress(),
					globalState.gameTime
				);
			return;
		}

		// Reset Player position to last position if they are on a blocking tile now
		const playerX = globalState.playerCharacter.x;
		const playerY = globalState.playerCharacter.y;
		const currentBaseTileIndex = this.tileLayer.getTileAtWorldXY(
			this.mainCharacter.x,
			this.mainCharacter.y
		)?.index;
		const currentDecorationTileIndex = this.decorationLayer.getTileAtWorldXY(
			this.mainCharacter.x,
			this.mainCharacter.y
		)?.index;

		if (
			isCollidingTile(currentBaseTileIndex || -1) ||
			isCollidingTile(currentDecorationTileIndex || -1)
		) {
			this.mainCharacter.x = this.lastPlayerPosition!.x;
			this.mainCharacter.y = this.lastPlayerPosition!.y;
			this.mainCharacter.setVelocity(0);
		} else {
			this.lastPlayerPosition = {
				x: this.mainCharacter.x,
				y: this.mainCharacter.y,
			};
		}

		if (!this.blockUserInteraction) {
			if (globalState.playerCharacter.stunned === true) {
				this.mainCharacter.setVelocity(0, 0);
			} else {
				if (
					globalState.playerCharacter.comboCast > 0 &&
					globalState.gameTime >
						globalState.playerCharacter.lastComboCastTime + COMBO_CAST_RESET_DELAY
				) {
					globalState.playerCharacter.comboCast = 0;
				}
				const msSinceLastCast = this.keyboardHelper.getMsSinceLastCast(globalState.gameTime);
				const castingDuration = this.keyboardHelper.getLastCastingDuration();
				const isCasting = msSinceLastCast < castingDuration;

				if (!globalState.playerCharacter.dashing) {
					const [xFacing, yFacing] = this.keyboardHelper.getCharacterFacing(
						this.mobilePadStick ? this.mobilePadStick.x - this.mobilePadBackground!.x : 0,
						this.mobilePadStick ? this.mobilePadStick.y - this.mobilePadBackground!.y : 0
					);
					const newFacing = getFacing8Dir(xFacing, yFacing);

					// const hasMoved = isCasting ? false : xFacing !== 0 || yFacing !== 0;
					const hasMoved = xFacing !== 0 || yFacing !== 0;
					const facingBeforeUpdate = globalState.playerCharacter.currentFacing;
					let playerAnimation = updateMovingState(
						globalState.playerCharacter,
						hasMoved,
						newFacing,
						this.hasCasted && hasMoved
					);
					const isWalking =
						isCasting ||
						(this.mobilePadStick
							? Math.abs(this.mobilePadStick.x - this.mobilePadBackground!.x) < 40 &&
							  Math.abs(this.mobilePadStick.y - this.mobilePadBackground!.y) < 40
							: false);
					let potentialCastingAnmiation = undefined;
					if (isCasting) {
						potentialCastingAnmiation = `player-cast-${getTwoLetterFacingName(
							globalState.playerCharacter.currentFacing
						)}`;
					}
					if (
						potentialCastingAnmiation &&
						potentialCastingAnmiation !== this.lastCastingAnimation
					) {
						console.log(
							`Casting animation is ${potentialCastingAnmiation}, last casting animation was ${this.lastCastingAnimation}`
						);
						playerAnimation = potentialCastingAnmiation;
						this.lastCastingAnimation = potentialCastingAnmiation;
					} else if (isCasting) {
						playerAnimation = false;
					} else {
						this.lastCastingAnimation = undefined;
					}

					if (playerAnimation) {
						this.mainCharacter.play({
							key: playerAnimation,
							// duration: 5,
							frameRate: isCasting
								? NORMAL_ANIMATION_FRAME_RATE * (MINIMUM_CASTING_TIME_MS / castingDuration)
								: isWalking
								? NORMAL_ANIMATION_FRAME_RATE / 2
								: NORMAL_ANIMATION_FRAME_RATE,
							startFrame:
								isCasting && this.hasCasted
									? this.mainCharacter.anims.currentFrame?.index - 1 || 0
									: 0,
							repeat: -1,
						});
					}
					if (hasMoved) {
						const shouldPlayLeftStepSfx =
							!this.lastStepLeft || globalState.gameTime - this.lastStepLeft > STEP_SOUND_TIME;

						if (shouldPlayLeftStepSfx) {
							this.sound.play('sound-step-grass-l', { volume: 0.25 });
							this.lastStepLeft = globalState.gameTime;
						}
					} else {
						this.lastStepLeft = undefined;
					}

					if (!isCasting) {
						this.hasCasted = false;
					} else {
						this.hasCasted = true;
					}

					const speed = isCasting
						? 0
						: isWalking
						? getCharacterSpeed(globalState.playerCharacter) / 2
						: getCharacterSpeed(globalState.playerCharacter);

					this.mainCharacter.setVelocity(xFacing * speed, yFacing * speed);
					this.mainCharacter.body.velocity.normalize().scale(speed);
				}
			}
			globalState.playerCharacter.x = Math.round(this.mainCharacter.x / SCALE);
			globalState.playerCharacter.y = Math.round(this.mainCharacter.y / SCALE);

			if (!this.blockUserInteraction) {
				const castAbilities = this.keyboardHelper.getCastedAbilities(globalState.gameTime);
				this.abilityHelper.update(globalState.gameTime, castAbilities);
			}
		}
		const cooldowns = this.keyboardHelper.getAbilityCooldowns(globalState.gameTime);
		this.playerCharacterAvatar.update(cooldowns);

		if (this.useDynamicLighting && this.dynamicLightingHelper) {
			this.dynamicLightingHelper.updateDynamicLighting(globalState.gameTime);
		}

		// Updated npcs
		this.mainCharacter.update(globalState.gameTime, delta);
		Object.values(this.npcMap).forEach((curNpc) => {
			curNpc.update(globalState.gameTime, delta);
		});

		this.follower?.update(globalState.gameTime, delta);
		this.nPCAvatar?.update();

		// TODO: remove items that are picked up
		this.worldItems = this.worldItems.filter((itemToken) => !itemToken.isDestroyed);
		this.worldItems.forEach((item) => {
			item.update(this);
		});

		Object.values(this.doorMap).forEach((door) => {
			door.update(this);
		});

		// Check if the player is close to a connection point and move them if so
		const connections = globalState.dungeon.levels[globalState.currentLevel]?.connections || [];
		connections.forEach((connection) => {
			if (
				Math.hypot(connection.x - playerX, connection.y - playerY) <
				CONNECTION_POINT_THRESHOLD_DISTANCE
			) {
				globalState.playerCharacter.x = 0;
				globalState.playerCharacter.y = 0;
				if (connection.targetMap) {
					if (connection.targetRoom) {
						globalState.transitionStack[connection.targetMap] = {
							targetRoom: connection.targetRoom,
							targetX: connection.targetX || 0,
							targetY: connection.targetY || 0,
						};
					}
					globalState.currentLevel = connection.targetMap;
					this.scene.start('RoomPreloaderScene');
				} else if (connection.targetScene) {
					this.scene.start(connection.targetScene);
				}
			}
		});

		// Set parts of the overlay layer transparent if the character is behind it
		this.overlayLayer.forEachTile((tile) => (tile.alpha = 1));
		const overlayTile = this.overlayLayer.getTileAtWorldXY(playerX, playerY);
		if (overlayTile) {
			const overlayTiles = [
				overlayTile,
				this.overlayLayer.getTileAtWorldXY(playerX - 16, playerY - 16),
				this.overlayLayer.getTileAtWorldXY(playerX, playerY - 16),
				this.overlayLayer.getTileAtWorldXY(playerX + 16, playerY - 16),
				this.overlayLayer.getTileAtWorldXY(playerX - 16, playerY),
				this.overlayLayer.getTileAtWorldXY(playerX + 16, playerY),
				this.overlayLayer.getTileAtWorldXY(playerX - 16, playerY + 16),
				this.overlayLayer.getTileAtWorldXY(playerX, playerY + 16),
				this.overlayLayer.getTileAtWorldXY(playerX + 16, playerY + 16),
			];

			for (const currentTile of overlayTiles) {
				if (currentTile) {
					currentTile.alpha = 0.4;
				}
			}
		}

		for (const fadingLabel of this.fadingLabels) {
			const timeDelta = globalTime - fadingLabel.timestamp;
			if (timeDelta > fadingLabel.timeToLive) {
				fadingLabel.fontElement?.destroy(true);
				fadingLabel.fontElement = undefined;
			} else if (fadingLabel.fontElement) {
				const timeDeltaFraction = timeDelta / fadingLabel.timeToLive;
				fadingLabel.fontElement.y = fadingLabel.posY - timeDeltaFraction * FADING_LABEL_Y_DISTANCE;
				fadingLabel.fontElement.x =
					fadingLabel.posX + Math.sin(timeDeltaFraction * 4) * FADING_LABEL_X_DISTANCE;
				fadingLabel.fontElement.alpha = 1 - 0.6 * timeDeltaFraction;
			}
		}

		this.fadingLabels = this.fadingLabels.filter((label) => label.fontElement);

		this.scriptHelper.handleScripts(globalState.gameTime);

		const now = Date.now();

		// Animate all tiles that should be animated
		if (now - this.lastTileAnimationStep > TILE_ANIMATION_STEP_TIME) {
			this.lastTileAnimationStep = now;

			const lowestRelevantX = Math.max(0, Math.floor(playerX / 16) - 26);
			const highestRelevantX = Math.max(0, Math.floor(playerX / 16) + 26);
			const lowestRelevantY = Math.max(0, Math.floor(playerY / 16) - 14);
			const highestRelevantY = Math.max(0, Math.floor(playerY / 16) + 14);

			for (let animatedX = lowestRelevantX; animatedX < highestRelevantX; animatedX++) {
				for (let animatedY = lowestRelevantY; animatedY < highestRelevantY; animatedY++) {
					updateAnimatedTile(this.tileLayer.getTileAt(animatedX, animatedY));
					updateAnimatedTile(this.decorationLayer.getTileAt(animatedX, animatedY));
					updateAnimatedTile(this.overlayLayer.getTileAt(animatedX, animatedY));
				}
			}
		}

		// tslint:disable-next-line: no-magic-numbers
		if (now - this.lastSave > 10 * 1000) {
			this.lastSave = now;
			globalState.storeState();
		}

		// tslint:disable-next-line: no-magic-numbers
		if (now - this.lastScriptUnpausing > 1000) {
			this.scriptHelper.resumePausedScripts();
		}

		if (
			this.serverRoom &&
			now - this.lastPlayerPositionUpdate > MS_BETWEEN_PLAYER_POSITION_UPDATES
		) {
			this.lastPlayerPositionUpdate = now;
			this.serverRoom.send('move', [
				[
					this.mainCharacter.id,
					Math.round(this.mainCharacter.x),
					Math.round(this.mainCharacter.y),
					Math.round(this.mainCharacter.body.velocity.x),
					Math.round(this.mainCharacter.body.velocity.y),
					this.mainCharacter.stateObject.currentFacing,
				],
			]);
		}

		// Update drum state based on distance to enemy
		const closestEnemy = getClosestTarget(
			Faction.PLAYER,
			this.mainCharacter.x,
			this.mainCharacter.y
		);
		if (closestEnemy) {
			const distanceToEnemy = Math.hypot(
				globalState.playerCharacter.x - closestEnemy.x,
				globalState.playerCharacter.y - closestEnemy.y
			);

			// console.log(`Distance to enemy: ${distanceToEnemy}}`);
			// if (distanceToEnemy < 1000) {
			// setDrumMute(1, false);
			// setDrumMute(2, false);
			// setDrumMute(3, false);
			// } else {
			setDrumMute(0, distanceToEnemy > 400);
			setDrumMute(1, distanceToEnemy > 600);
			setDrumMute(2, distanceToEnemy > 800);
			// }
		} else {
			setDrumMute(0, true);
			setDrumMute(1, true);
			setDrumMute(2, true);
		}
	}

	addFadingLabel(
		text: string,
		fontSize: FadingLabelSize,
		color: string,
		posX: number,
		posY: number,
		timeToLive: number
	) {
		const fadingLabel = new Phaser.GameObjects.Text(this, posX, posY, text, {
			fontFamily: 'endlessDungeon',
			fontSize: `${BaseFadingLabelFontSize[fontSize] * SCALE}pt`,
			color,
		});
		fadingLabel.setDepth(UiDepths.FLOATING_TEXT_LAYER);
		this.add.existing(fadingLabel);
		this.fadingLabels.push({
			fontSize,
			fontElement: fadingLabel,
			timestamp: this.game.getTime(),
			timeToLive,
			posX,
			posY,
		});
	}

	closeAllIconScreens() {
		Object.values(this.icons).forEach((icon) => {
			if (icon.open) icon.closeScreen();
		});
		this.resume();
	}

	handleOverlayCooldown() {
		if (globalState.gameTime - this.overlayPressed > 250) {
			this.overlayPressed = globalState.gameTime;
			return true;
		} else return false;
	}

	pause() {
		this.isPaused = true;
		this.physics.pause();
		let playerAnimation = updateMovingState(
			globalState.playerCharacter,
			false,
			globalState.playerCharacter.currentFacing
		);
		if (playerAnimation) {
			this.mainCharacter.play({ key: playerAnimation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
		}
		Object.values(this.npcMap).forEach((curNpc) => {
			curNpc.update(globalState.gameTime, 0);
		});

		this.time.paused = true;
	}

	resume() {
		this.isPaused = false;
		this.physics.resume();
		this.time.paused = false;
	}

	dropItem(x: number, y: number, itemKey: string, level: number = 0) {
		const item = getItemDataForName(itemKey);
		if (item === undefined) {
			console.log('ITEM UNDEFINED: ', itemKey);
			return;
		}
		let itemToken = new WorldItemToken(this, x, y, itemKey, item, level, getItemTexture(itemKey));
		itemToken.setDepth(UiDepths.TOKEN_BACKGROUND_LAYER);
		this.worldItems.push(itemToken);
	}

	getTokenForStateObject(stateObject: Character) {
		if (stateObject.faction === Faction.PLAYER) {
			return this.mainCharacter;
		} else if (stateObject.faction === Faction.ALLIES) {
			return this.follower;
		} else {
			return this.npcMap[stateObject.id];
		}
	}

	getLightingSources(): LightingSource[] {
		return [
			...this.abilityHelper.abilityEffects.map((abilityEffect) => {
				return {
					x: Math.round(abilityEffect.x / TILE_WIDTH / SCALE),
					y: Math.round(abilityEffect.y / TILE_HEIGHT / SCALE),
					radius: abilityEffect.lightingRadius || 2,
					strength:
						abilityEffect.lightingStrength !== undefined
							? abilityEffect.lightingStrength || 2
							: undefined,
					...(abilityEffect.lightingMinStrength !== undefined
						? {
								minStrength: abilityEffect.lightingMinStrength,
								maxStrength: abilityEffect.lightingMaxStrength,
								frequency: abilityEffect.lightingFrequency,
								seed: abilityEffect.lightingSeed,
						  }
						: {}),
				};
			}),
			...this.lightingSources,
		];
	}
}
