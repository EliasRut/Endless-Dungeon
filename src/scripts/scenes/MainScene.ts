import 'phaser';

import globalState from '../worldstate/index';
import { updateStatus } from '../worldstate/Character';

import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import FpsText from '../drawables/ui/FpsText';

import StatScreen from '../screens/StatScreen';
import InventoryScreen from '../screens/InventoryScreen';
import DialogScreen from '../screens/DialogScreen';
import ItemScreen from '../screens/ItemScreen';

import KeyboardHelper from '../helpers/KeyboardHelper';
import { getCharacterSpeed, getFacing8Dir, updateMovingState } from '../helpers/movement';
import { essenceNames, Faction, NUM_ITEM_ICONS, UiDepths } from '../helpers/constants';
import { generateTilemap } from '../helpers/drawDungeon';
import DynamicLightingHelper from '../helpers/DynamicLightingHelper';
import Avatar from '../drawables/ui/Avatar';
import ScriptHelper from '../helpers/ScriptHelper';
import AbilityHelper from '../helpers/AbilityHelper';
import BackpackIcon from '../drawables/ui/BackpackIcon';
import SettingsIcon from '../drawables/ui/SettingsIcon';
import { spawnNpc } from '../helpers/spawn';
import CharacterToken from '../drawables/tokens/CharacterToken';
import { NpcOptions, NpcScript } from '../../../typings/custom';
import WorldItemToken from '../drawables/tokens/WorldItemToken';
import Item from '../worldstate/Item';
import { EquippableDroppedItemData, generateRandomItem } from '../helpers/item';
import SettingsScreen from '../screens/SettingsScreen';
import DoorToken from '../drawables/tokens/DoorToken';

import fixedItems from '../../items/fixedItems.json';
import { DungeonRunData } from '../models/DungeonRunData';
import { TILE_HEIGHT, TILE_WIDTH } from '../helpers/generateDungeon';
import { Catalyst, Source, getItemDataForName } from '../../items/itemData';
import Minimap from '../drawables/ui/Minimap';
import { AbilityType } from '../abilities/abilityData';
import LevelName from '../drawables/ui/LevelName';
import QuestsIcon from '../drawables/ui/QuestsIcon';
import QuestLogScreen from '../screens/QuestLogScreen';
import QuestDetailsScreen from '../screens/QuestDetailsScreen';

const FADE_IN_TIME_MS = 1000;
const FADE_OUT_TIME_MS = 1000;

const DEBUG__ITEM_OFFSET_X = 30;
const DEBUG__ITEM_OFFSET_Y = 30;

const CASTING_SPEED_MS = 250;

const CONNECTION_POINT_THRESHOLD_DISTANCE = 32;
const STEP_SOUND_TIME = 200;

const MOBILE_PAD_BACKGROUND_X_OFFSET = 96;
const MOBILE_PAD_FOREGROUND_X_OFFSET = 96;

const DEATH_RESPAWN_TIME = 3000;

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
	fpsText: Phaser.GameObjects.Text;
	levelName?: LevelName;
	minimap?: Minimap;

	keyboardHelper: KeyboardHelper;
	dynamicLightingHelper?: DynamicLightingHelper;
	scriptHelper: ScriptHelper;
	abilityHelper: AbilityHelper;

	mainCharacter: PlayerCharacterToken;
	npcMap: { [id: string]: CharacterToken };
	doorMap: { [id: string]: DoorToken };
	worldItems: WorldItemToken[];

	overlayScreens: {
		inventory: InventoryScreen;
		statScreen: StatScreen;
		dialogScreen: DialogScreen;
		settingsScreen: SettingsScreen;
		questLogScreen: QuestLogScreen;
		questDetailsScreen: QuestDetailsScreen;
		itemScreen: ItemScreen;
	};
	alive: number;
	isPaused = false;
	blockUserInteraction = false;

	mobilePadBackgorund?: Phaser.GameObjects.Image;
	mobilePadStick?: Phaser.GameObjects.Image;

	avatar: Avatar;

	icons: {
		backpackIcon: BackpackIcon;
		settingsIcon: SettingsIcon;
		questsIcon: QuestsIcon;
	};

	wasIPressed: boolean = false;
	wasEscPressed: boolean = false;
	wasJPressed: boolean = false;

	tileLayer: Phaser.Tilemaps.TilemapLayer;
	decorationLayer: Phaser.Tilemaps.TilemapLayer;
	overlayLayer: Phaser.Tilemaps.TilemapLayer;

	useDynamicLighting = false;
	dungeonRunData: DungeonRunData;

	lastSave: number = Date.now();

	lastStepLeft: number | undefined;

	lastScriptUnpausing: number = Date.now();

	constructor() {
		super({ key: 'MainScene' });
	}

	// If nothing is found, we default to desktop
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator?.userAgent || ''
	);

	create() {
		this.input.addPointer(2);

		this.alive = 0;
		// tslint:disable-next-line:no-unused-expression
		this.cameras.main.fadeIn(FADE_IN_TIME_MS);

		this.npcMap = {};
		this.doorMap = {};
		this.worldItems = [];
		const [startX, startY] = this.drawRoom();

		this.useDynamicLighting = globalState.currentLevel.startsWith('dungeonLevel');

		if (this.useDynamicLighting) {
			this.dynamicLightingHelper = new DynamicLightingHelper(
				this.tileLayer,
				this.decorationLayer,
				this.overlayLayer
			);
		}

		this.mainCharacter = new PlayerCharacterToken(
			this,
			globalState.playerCharacter.x || startX,
			globalState.playerCharacter.y || startY
		);
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

		this.fpsText = new FpsText(this);
		this.icons = {
			backpackIcon: new BackpackIcon(this),
			settingsIcon: new SettingsIcon(this),
			questsIcon: new QuestsIcon(this),
		};
		if (globalState.currentLevel.startsWith('dungeonLevel')) {
			this.levelName = new LevelName(this);
			this.minimap = new Minimap(this);
		}
		this.avatar = new Avatar(this);
		if (this.isMobile) {
			this.mobilePadBackgorund = this.add.image(
				this.cameras.main.width - MOBILE_PAD_BACKGROUND_X_OFFSET,
				this.cameras.main.height / 2,
				'pad-background'
			);
			this.mobilePadBackgorund.setScrollFactor(0);
			this.mobilePadBackgorund.setDepth(UiDepths.UI_FOREGROUND_LAYER);
			this.add.existing(this.mobilePadBackgorund);

			this.mobilePadStick = this.add.image(
				this.cameras.main.width - MOBILE_PAD_FOREGROUND_X_OFFSET,
				this.cameras.main.height / 2,
				'pad-stick'
			);
			this.mobilePadStick.setScrollFactor(0);
			this.mobilePadStick.setDepth(UiDepths.UI_STICK_LAYER);

			const hitArea = new Phaser.Geom.Circle(70, 70, 70);
			this.mobilePadBackgorund.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
			this.mobilePadBackgorund.on('pointerup', (event: any) => {
				this.mobilePadStick!.x = this.cameras.main.width - MOBILE_PAD_FOREGROUND_X_OFFSET;
				this.mobilePadStick!.y = this.cameras.main.height / 2;
			});
			this.mobilePadBackgorund.on('pointermove', (event: any) => {
				if (!event.isDown) {
					this.mobilePadStick!.x = this.cameras.main.width - MOBILE_PAD_FOREGROUND_X_OFFSET;
					this.mobilePadStick!.y = this.cameras.main.height / 2;
					return;
				}

				this.mobilePadStick!.x = Math.min(
					this.cameras.main.width - MOBILE_PAD_FOREGROUND_X_OFFSET + 60,
					Math.max(this.cameras.main.width - MOBILE_PAD_FOREGROUND_X_OFFSET - 60, event.position.x)
				);
				this.mobilePadStick!.y = Math.min(
					this.cameras.main.height / 2 + 60,
					Math.max(this.cameras.main.height / 2 - 60, event.position.y)
				);
			});
			this.mobilePadBackgorund.on('pointerover', (_: any, event: any) => {
				if (!event.isDown) {
					this.mobilePadStick!.x = this.cameras.main.width - MOBILE_PAD_FOREGROUND_X_OFFSET;
					this.mobilePadStick!.y = this.cameras.main.height / 2;
					return;
				}

				this.mobilePadStick!.x = Math.min(
					this.cameras.main.width - MOBILE_PAD_FOREGROUND_X_OFFSET + 60,
					Math.max(this.cameras.main.width - MOBILE_PAD_FOREGROUND_X_OFFSET - 60, event.position.x)
				);
				this.mobilePadStick!.y = Math.min(
					this.cameras.main.height / 2 + 60,
					Math.max(this.cameras.main.height / 2 - 60, event.position.y)
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
		};

		this.icons.backpackIcon.setScreens();
		this.icons.settingsIcon.setScreens();
		this.icons.questsIcon.setScreens();

		this.keyboardHelper = new KeyboardHelper(this);
		this.abilityHelper = new AbilityHelper(this);
		this.scriptHelper = new ScriptHelper(this);

		this.sound.stopAll();
		if (globalState.currentLevel === 'town') {
			this.sound.play('score-town', { volume: 0.05, loop: true });
		} else {
			this.sound.play('score-dungeon', { volume: 0.08, loop: true });
		}

		// if (globalState.inventory.unequippedItemList.length === 0) {
		// 	const zeroWeights = {
		// 		sourceWeight: 0,
		// 		catalystWeight: 0,
		// 		armorWeight: 0,
		// 		ringWeight: 0,
		// 		amuletWeight: 0,
		// 	};
		// 	this.overlayScreens.inventory.addToInventory(
		// 		generateRandomItem({
		// 			...zeroWeights,
		// 			sourceWeight: 1,
		// 			sourceTypes: [Source.FIRE],
		// 		})
		// 	);
		// 	this.overlayScreens.inventory.addToInventory(
		// 		generateRandomItem({
		// 			...zeroWeights,
		// 			sourceWeight: 1,
		// 			sourceTypes: [Source.ICE],
		// 		})
		// 	);
		// 	this.overlayScreens.inventory.addToInventory(
		// 		generateRandomItem({
		// 			...zeroWeights,
		// 			sourceWeight: 1,
		// 			sourceTypes: [Source.FORCE],
		// 		})
		// 	);
		// 	this.overlayScreens.inventory.addToInventory(
		// 		generateRandomItem({
		// 			...zeroWeights,
		// 			sourceWeight: 1,
		// 			sourceTypes: [Source.NECROTIC],
		// 		})
		// 	);
		// 	this.overlayScreens.inventory.addToInventory(
		// 		generateRandomItem({
		// 			...zeroWeights,
		// 			catalystWeight: 1,
		// 			catalystTypes: [Catalyst.NOVA],
		// 		})
		// 	);
		// 	this.overlayScreens.inventory.addToInventory(
		// 		generateRandomItem({
		// 			...zeroWeights,
		// 			catalystWeight: 1,
		// 			catalystTypes: [Catalyst.CONE],
		// 		})
		// 	);
		// 	this.overlayScreens.inventory.addToInventory(
		// 		generateRandomItem({
		// 			...zeroWeights,
		// 			catalystWeight: 1,
		// 			catalystTypes: [Catalyst.STORM],
		// 		})
		// 	);
		// 	this.overlayScreens.inventory.addToInventory(
		// 		generateRandomItem({
		// 			...zeroWeights,
		// 			catalystWeight: 1,
		// 			catalystTypes: [Catalyst.SUMMON],
		// 		})
		// 	);
		// }
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
		this.npcMap[id] = npc;
		if (globalState.npcs[id]) {
			const facing = getFacing8Dir(facingX, facingY);
			const animation = updateMovingState(globalState.npcs[id], false, facing, true);
			if (animation) {
				npc.play(animation);
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
	}

	addDoor(id: string, type: string, x: number, y: number, open: boolean) {
		if (!globalState.doors[id]) {
			globalState.doors[id] = {
				id,
				type,
				x,
				y,
				open,
			};
		}
		this.doorMap[id] = new DoorToken(this, x, y, type, id);
		this.doorMap[id].setDepth(UiDepths.DECORATION_TILE_LAYER);
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
		if (!dungeonLevel) {
			throw new Error(`No dungeon level was created for level name ${globalState.currentLevel}.`);
		}

		const { startPositionX, startPositionY, npcs, doors, items } = dungeonLevel;

		const [tileLayer, decorationLayer, overlayLayer] = generateTilemap(this, dungeonLevel);

		this.tileLayer = tileLayer;
		this.decorationLayer = decorationLayer;
		this.overlayLayer = overlayLayer;

		this.tileLayer.setDepth(UiDepths.BASE_TILE_LAYER);
		this.decorationLayer.setDepth(UiDepths.DECORATION_TILE_LAYER);
		this.overlayLayer.setDepth(UiDepths.OVERLAY_TILE_LAYER);
		this.overlayLayer.setDepth(UiDepths.TOP_TILE_LAYER);

		npcs.forEach((npc) => {
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
				}
			);
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
			this.addDoor(door.id, door.type, door.x, door.y, door.open);
		});

		items.forEach((item) => {
			this.addFixedItem(item.id, item.x, item.y);
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
		const debugGraphics = this.add.graphics().setAlpha(0.75);
		this.tileLayer.renderDebug(debugGraphics, {
			tileColor: null, // Color of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
			faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
		});
		// tslint:enable: no-magic-numbers
	}

	update(globalTime: number, delta: number) {
		globalState.gameTime = globalTime;
		this.fpsText.update();
		this.minimap?.update();
		this.keyboardHelper.updateGamepad();
		updateStatus(globalTime, globalState.playerCharacter);

		if (this.keyboardHelper.isKKeyPressed()) {
			globalState.clearState();
			location.reload();
		}
		if (this.keyboardHelper.isInventoryPressed(this.icons.backpackIcon.screens[0].visiblity)) {
			if (this.wasIPressed === false) {
				this.icons.backpackIcon.toggleScreen();
				this.overlayScreens.inventory.interactInventory('pressed', globalTime);
			}
			this.wasIPressed = true;
		} else {
			this.wasIPressed = false;
		}
		if (this.keyboardHelper.isSettingsPressed()) {
			if (this.wasEscPressed === false) {
				this.icons.settingsIcon.toggleScreen();
			}
			this.wasEscPressed = true;
		} else {
			this.wasEscPressed = false;
		}
		if (this.keyboardHelper.isQuestsPressed()) {
			if (this.wasJPressed === false) {
				this.icons.questsIcon.toggleScreen();
			}
			this.wasJPressed = true;
		} else {
			this.wasJPressed = false;
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

		this.scriptHelper.handleScripts(globalTime);

		this.overlayScreens.statScreen.update();

		if (this.isPaused) {
			if (this.icons.backpackIcon.screens[0].visiblity)
				this.overlayScreens.inventory.interactInventory(
					this.keyboardHelper.getInventoryKeyPress(),
					globalTime
				);
			return;
		}

		if (!this.blockUserInteraction) {
			if (globalState.playerCharacter.stunned === true) return;
			const msSinceLastCast = this.keyboardHelper.getMsSinceLastCast(globalTime);
			const isCasting = msSinceLastCast < CASTING_SPEED_MS;

			const [xFacing, yFacing] = this.keyboardHelper.getCharacterFacing(
				this.mobilePadStick ? this.mobilePadStick.x - this.mobilePadBackgorund!.x : 0,
				this.mobilePadStick ? this.mobilePadStick.y - this.mobilePadBackgorund!.y : 0
			);
			const newFacing = getFacing8Dir(xFacing, yFacing);

			const hasMoved = isCasting ? false : xFacing !== 0 || yFacing !== 0;
			const playerAnimation = updateMovingState(globalState.playerCharacter, hasMoved, newFacing);
			const isWalking = this.mobilePadStick
				? Math.abs(this.mobilePadStick.x - this.mobilePadBackgorund!.x) < 40 &&
				  Math.abs(this.mobilePadStick.y - this.mobilePadBackgorund!.y) < 40
				: false;
			if (playerAnimation) {
				this.mainCharacter.play({
					key: playerAnimation,
					frameRate: globalState.playerCharacter.movementSpeed / (isWalking ? 20 : 10),
				});
			}
			if (hasMoved) {
				const shouldPlayLeftStepSfx =
					!this.lastStepLeft || globalTime - this.lastStepLeft > STEP_SOUND_TIME;

				if (shouldPlayLeftStepSfx) {
					this.sound.play('sound-step-grass-l', { volume: 0.25 });
					this.lastStepLeft = globalTime;
				}
			} else {
				this.lastStepLeft = undefined;
			}

			let speed = isCasting ? 0 : getCharacterSpeed(globalState.playerCharacter);

			if (isWalking) {
				speed = speed / 2;
			}

			this.mainCharacter.setVelocity(xFacing * speed, yFacing * speed);
			this.mainCharacter.body.velocity.normalize().scale(speed);
		}
		globalState.playerCharacter.x = Math.round(this.mainCharacter.x);
		globalState.playerCharacter.y = Math.round(this.mainCharacter.y);

		if (!this.blockUserInteraction) {
			const castAbilities = this.keyboardHelper.getCastedAbilities(globalTime);
			this.abilityHelper.update(globalTime, castAbilities);
		}

		const cooldowns = this.keyboardHelper.getAbilityCooldowns(globalTime);
		this.avatar.update(cooldowns);

		if (this.useDynamicLighting && this.dynamicLightingHelper) {
			this.dynamicLightingHelper.updateDynamicLighting();
		}

		// Updated npcs
		Object.values(this.npcMap).forEach((curNpc) => {
			curNpc.update(globalTime, delta);
		});

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
		const playerX = globalState.playerCharacter.x;
		const playerY = globalState.playerCharacter.y;
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

		// tslint:disable-next-line: no-magic-numbers
		if (Date.now() - this.lastSave > 10 * 1000) {
			this.lastSave = Date.now();
			globalState.storeState();
		}

		// tslint:disable-next-line: no-magic-numbers
		if (Date.now() - this.lastScriptUnpausing > 1000) {
			this.scriptHelper.resumePausedScripts();
		}
	}

	pause() {
		this.isPaused = true;
		this.physics.pause();
		this.time.paused = true;
	}

	resume() {
		this.isPaused = false;
		this.physics.resume();
		this.time.paused = false;
	}

	dropItem(x: number, y: number, itemKey: string, level?: number) {
		const item = getItemDataForName(itemKey);
		const itemToken = new WorldItemToken(this, x, y, itemKey, item, level || 0);
		itemToken.setDepth(UiDepths.TOKEN_BACKGROUND_LAYER);
		this.worldItems.push(itemToken);
	}
}
