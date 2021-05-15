import 'phaser';

import globalState from '../worldstate/index';

import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import FpsText from '../drawables/ui/FpsText';

import StatScreen from '../screens/StatScreen';
import InventoryScreen from '../screens/InventoryScreen';
import DialogScreen from '../screens/DialogScreen';
import ItemScreen from '../screens/ItemScreen';

import KeyboardHelper from '../helpers/KeyboardHelper';
import { getCharacterSpeed, getFacing8Dir, updateMovingState } from '../helpers/movement';
import { essenceNames, NUM_ITEM_ICONS, UiDepths } from '../helpers/constants';
import { generateTilemap } from '../helpers/drawDungeon';
import DynamicLightingHelper from '../helpers/DynamicLightingHelper';
import Avatar from '../drawables/ui/Avatar';
import ScriptHelper from '../helpers/ScriptHelper';
import AbilityHelper from '../helpers/AbilityHelper';
import BackpackIcon from '../drawables/ui/BackpackIcon';
import SettingsIcon from '../drawables/ui/SettingsIcon';
import { spawnNpc } from '../helpers/spawn';
import CharacterToken from '../drawables/tokens/CharacterToken';
import { NpcScript } from '../../../typings/custom';
import WorldItemToken from '../drawables/tokens/WorldItemToken';
import Item from '../worldstate/Item';
import { generateRandomItem } from '../helpers/item';
import SettingsScreen from '../screens/SettingsScreen';
import DoorToken from '../drawables/tokens/DoorToken';

import fixedItems from '../../items/fixedItems.json';
import { DungeonRunData } from '../models/DungeonRunData';
import { TILE_HEIGHT, TILE_WIDTH } from '../helpers/generateDungeon';

const FADE_IN_TIME_MS = 1000;
const FADE_OUT_TIME_MS = 1000;

const DEBUG__ITEM_OFFSET_X = 30;
const DEBUG__ITEM_OFFSET_Y = 30;

const CASTING_SPEED_MS = 250;

const CONNECTION_POINT_THRESHOLD_DISTANCE = 32;
const STEP_SOUND_TIME = 200;

// The main scene handles the actual game play.
export default class MainScene extends Phaser.Scene {
	fpsText: Phaser.GameObjects.Text;

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
		itemScreen: ItemScreen;
	};
	alive: number;
	isPaused = false;
	blockUserInteraction = false;

	avatar: Avatar;
	backpackIcon: BackpackIcon;
	settingsIcon: SettingsIcon;
	tileLayer: Phaser.Tilemaps.DynamicTilemapLayer;
	decorationLayer: Phaser.Tilemaps.DynamicTilemapLayer;
	overlayLayer: Phaser.Tilemaps.DynamicTilemapLayer;

	useDynamicLighting = false;
	dungeonRunData: DungeonRunData;

	lastSave: number = Date.now();

	lastStepLeft: number | undefined;

	constructor() {
		super({ key: 'MainScene' });
	}

	create() {
		this.alive = 0;
		// tslint:disable-next-line:no-unused-expression
		this.cameras.main.fadeIn(FADE_IN_TIME_MS);

		this.npcMap = {};
		this.doorMap = {};
		this.worldItems = [];
		const [startX, startY] = this.drawRoom();

		this.useDynamicLighting = globalState.roomAssignment[globalState.currentLevel].dynamicLighting;

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
			globalState.playerCharacter.y || startY);
		this.mainCharacter.setDepth(UiDepths.TOKEN_MAIN_LAYER);
		this.cameras.main.startFollow(this.mainCharacter, false);
		this.physics.add.collider(this.mainCharacter, this.tileLayer);
		this.physics.add.collider(this.mainCharacter, this.decorationLayer);
		Object.values(this.doorMap).forEach((door) => {
			this.physics.add.collider(this.mainCharacter, door);
		});
		Object.values(this.npcMap).forEach((npc) => {
			this.physics.add.collider(this.mainCharacter, npc);
		});

		this.fpsText = new FpsText(this);
		this.backpackIcon = new BackpackIcon(this);
		this.avatar = new Avatar(this);

		// essenceNames.forEach((name, index) => {
		// 	const essence = new Phaser.GameObjects.Sprite(this, 200 + index * 20, 200, 'items-essence', 0);
		// 	essence.play(`essence-${name}`);
		// 	essence.setDepth(UiDepths.UI_FOREGROUND_LAYER);
		// 	essence.setScrollFactor(0);
		// 	this.add.existing(essence);
		// })

		this.overlayScreens = {
			statScreen: new StatScreen(this),
			inventory: new InventoryScreen(this),
			dialogScreen: new DialogScreen(this),
			itemScreen: new ItemScreen(this),
			settingsScreen: new SettingsScreen(this)
		};

		this.fpsText = new FpsText(this);
		this.backpackIcon = new BackpackIcon(this);
		this.settingsIcon = new SettingsIcon(this);
		this.avatar = new Avatar(this);

		this.keyboardHelper = new KeyboardHelper(this);
		this.abilityHelper = new AbilityHelper(this);
		this.scriptHelper = new ScriptHelper(this);

		// var pointers = this.input.activePointer;
		// this.input.on('pointerdown', function () {
		// 	console.log("mouse x", pointers.x);
		// 	console.log("mouse y", pointers.y);
		// });

		this.sound.stopAll();
		if (globalState.currentLevel === 'town') {
			this.sound.play('score-town', { volume: 0.05, loop: true });
		} else {
			this.sound.play('score-dungeon', {volume: 0.08, loop: true});
		}
	}

	addNpc(
			id: string,
			type: string,
			x: number,
			y: number,
			facingX: number,
			facingY: number,
			script?: NpcScript
		) {
		const npc = spawnNpc(this, type, id, x, y);
		this.npcMap[id] = npc;
		if (globalState.npcs[id]) {
			const facing = getFacing8Dir(facingX, facingY);
			const animation = updateMovingState(
				globalState.npcs[id],
				false,
				facing,
				true
			);
			if (animation) {
				npc.play(animation);
			}
		}
		this.npcMap[id].setDepth(UiDepths.TOKEN_MAIN_LAYER);
		this.physics.add.collider(this.npcMap[id], this.tileLayer);
		this.physics.add.collider(this.npcMap[id], this.decorationLayer);
		if (this.mainCharacter) {
			this.physics.add.collider(this.npcMap[id], this.mainCharacter);
		}
		this.npcMap[id].script = script;
	}

	addDoor(id: string, type: string, x: number, y: number, open: boolean) {
		if (!globalState.doors[id]) {
			globalState.doors[id] = {
				id,
				type,
				x,
				y,
				open
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
			x, //- DEBUG__ITEM_OFFSET_X,
			y, //- DEBUG__ITEM_OFFSET_Y,
			{
				...(fixedItems as { [id: string]: Partial<Item> })[id],
				itemLocation: 0
			} as Item
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

		const {
			startPositionX,
			startPositionY,
			npcs,
			doors,
			items
		} = dungeonLevel;

		const [
			tileLayer,
			decorationLayer,
			overlayLayer
		] = generateTilemap(this, dungeonLevel);

		this.tileLayer = tileLayer;
		this.decorationLayer = decorationLayer;
		this.overlayLayer = overlayLayer;

		this.tileLayer.setDepth(UiDepths.BASE_TILE_LAYER);
		this.decorationLayer.setDepth(UiDepths.DECORATION_TILE_LAYER);
		this.overlayLayer.setDepth(UiDepths.OVERLAY_TILE_LAYER);

		npcs.forEach((npc) => {
			this.addNpc(npc.id, npc.type, npc.x, npc.y, npc.facingX || 0, npc.facingY || 0, npc.script);
		});

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
				(room) => room.roomName === transitionCoordinates.targetRoom);
			if (targetRoom) {
				usedStartPositionX = (targetRoom.x + transitionCoordinates.targetX) * TILE_WIDTH;
				usedStartPositionY = (targetRoom.y + transitionCoordinates.targetY) * TILE_HEIGHT;
			}
		}

		return [
			usedStartPositionX,
			usedStartPositionY
		];
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
		globalState.gameTime = globalTime;
		this.fpsText.update();

		if (this.keyboardHelper.isKKeyPressed()) {
			globalState.clearState();
			location.reload();
		}

		if (globalState.playerCharacter.health <= 0 && this.alive === 0) {
			this.cameras.main.fadeOut(FADE_OUT_TIME_MS);
			// tslint:disable-next-line: no-console
			console.log('you died');
			this.alive = 1;
			// this.scene.pause();
			return;
		}

		this.scriptHelper.handleScripts(globalTime);

		this.overlayScreens.statScreen.update();

		if (this.isPaused) {
			return;
		}

		if (!this.blockUserInteraction) {
			const msSinceLastCast = this.keyboardHelper.getMsSinceLastCast(globalTime);
			const isCasting = msSinceLastCast < CASTING_SPEED_MS;

			const [xFacing, yFacing] = this.keyboardHelper.getCharacterFacing();
			const newFacing = getFacing8Dir(xFacing, yFacing);

			const hasMoved = isCasting ? false : (xFacing !== 0 || yFacing !== 0);
			const playerAnimation = updateMovingState(
				globalState.playerCharacter,
				hasMoved,
				newFacing);
			if (playerAnimation) {
				this.mainCharacter.play(playerAnimation);
			}
			if (hasMoved) {
				const shouldPlayLeftStepSfx =
					!this.lastStepLeft || (globalTime - this.lastStepLeft) > STEP_SOUND_TIME;

				if (shouldPlayLeftStepSfx) {
					this.sound.play('sound-step-grass-l', { volume: 0.25 });
					this.lastStepLeft = globalTime;
				}
			} else {
				this.lastStepLeft = undefined;
			}

			const speed = isCasting ? 0 : getCharacterSpeed(globalState.playerCharacter);

			this.mainCharacter.setVelocity(xFacing * speed, yFacing * speed);
			this.mainCharacter.body.velocity.normalize().scale(speed);

		}
		globalState.playerCharacter.x = Math.round(this.mainCharacter.x);
		globalState.playerCharacter.y = Math.round(this.mainCharacter.y);

		if (!this.blockUserInteraction) {
			const castAbilities = this.keyboardHelper.getCastedAbilities(globalTime);
			this.abilityHelper.update(castAbilities);
		}

		const cooldowns = this.keyboardHelper.getAbilityCooldowns(globalTime);
		this.avatar.update(cooldowns);

		if (this.useDynamicLighting && this.dynamicLightingHelper) {
			this.dynamicLightingHelper.updateDynamicLighting();
		}

		Object.values(this.npcMap).forEach((curNpc) => {
			curNpc.update(globalTime);
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

			if (Math.hypot(
				connection.x - playerX,
				connection.y - playerY) < CONNECTION_POINT_THRESHOLD_DISTANCE) {
				globalState.playerCharacter.x = 0;
				globalState.playerCharacter.y = 0;
				if (connection.targetMap) {
					if (connection.targetRoom) {
						globalState.transitionStack[connection.targetMap] = {
							targetRoom: connection.targetRoom,
							targetX: connection.targetX || 0,
							targetY: connection.targetY || 0
						};
					}
					globalState.currentLevel = connection.targetMap;
					this.scene.start('RoomPreloaderScene');
				} else if (connection.targetScene) {
					this.scene.start(connection.targetScene);
				}
			}
		});

		// tslint:disable-next-line: no-magic-numbers
		if (Date.now() - this.lastSave > 10 * 1000) {
			this.lastSave = Date.now();
			globalState.storeState();
		}
	}

	pause() {
		this.isPaused = true;
		this.physics.pause();
	}

	resume() {
		this.isPaused = false;
		this.physics.resume();
	}

	dropItem(x: number, y: number, item: Item) {
		const itemToken = new WorldItemToken(this, x, y, item);
		itemToken.setDepth(UiDepths.TOKEN_MAIN_LAYER);
		this.worldItems.push(itemToken);
	}
}