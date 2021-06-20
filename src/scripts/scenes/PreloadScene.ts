import { getUrlParam } from '../helpers/browserState';
import { spriteDirectionList, NUM_DIRECTIONS, npcTypeToFileMap, FacingRange, npcTypeToAttackFileMap, essenceNames } from '../helpers/constants';
import globalState from '../worldstate';
import DungeonGenerator from '../helpers/generateDungeon';

/*
	The preload scene is the one we use to load assets. Once it's finished, it brings up the main
	scene.
*/
export default class PreloadScene extends Phaser.Scene {
	constructor() {
		super({ key: 'PreloadScene' });
	}

	neededAnimations = [{name: 'player',facingRange: FacingRange.ALL_DIRECTIONS}];

	init() {
		const text = new Phaser.GameObjects.Text(this,
			this.cameras.main.centerX,
			this.cameras.main.centerY, 'Loading ...', { color: 'white', fontSize: '26px' });
		this.add.existing(text);
	}

	preload() {
		// Empty tile
		this.load.image('empty-tile', 'assets/img/empty_16x16_tile.png');

		// Player
		this.load.spritesheet('player', 'assets/sprites/main-character.png',
			{ frameWidth: 40, frameHeight: 40 });

		// Overlay screens
		this.load.spritesheet('screen-background', 'assets/img/screen-background.png',
			{ frameWidth: 64, frameHeight: 64 });

		// Ability effects
		this.load.image('fire', 'assets/img/muzzleflash3.png');
		this.load.image('ice', 'assets/img/ice_spike.png');
		this.load.image('snow', 'assets/img/snowflake.png');
		this.load.image('rock', 'assets/img/rock.png');
		this.load.image('wind', 'assets/img/wind-gust.png');

		// Other elements
		this.load.image('quest', 'assets/img/quest.png');

		// GUI
		this.load.image('icon-backpack', 'assets/img/backpack-icon.png');
		this.load.image('icon-hero', 'assets/img/hero-icon.png');
		this.load.image('icon-guibase', 'assets/img/gui-base.png');
		this.load.image('icon-healthbar', 'assets/img/gui-life.png');
		this.load.image('inventory-borders', 'assets/img/inventory-borders-tall.png');
		this.load.spritesheet('icon-abilities', 'assets/img/abilities-sheet.png',
			{ frameWidth: 20, frameHeight: 20 });

		// Essences
		this.load.spritesheet('items-essence', 'assets/sprites/items-essence.png',
			{ frameWidth: 16, frameHeight: 16 });

		// Items
		this.load.spritesheet('test-items-spritesheet', 'assets/img/items-test-small.png',
			{ frameWidth: 16, frameHeight: 16 });

		// Doors
		this.load.spritesheet('red-door-north', 'assets/img/red-door-north.png',
			{ frameWidth: 48, frameHeight: 32 });

		// Dungeon Door
		this.load.image('dungeon-door', 'assets/img/dungeon-door.png');

		// load music score
		this.load.audio('score-town', 'assets/sounds/score-town.mp3');
		this.load.audio('score-dungeon', 'assets/sounds/score-dungeon.mp3');

		// load sound effects
		this.load.audio('sound-step-grass-l', 'assets/sounds/step-grass-l.wav');
		this.load.audio('sound-step-grass-r', 'assets/sounds/step-grass-r.wav');
		this.load.audio('sound-fireball', 'assets/sounds/fireball.wav');
		this.load.audio('sound-icespike', 'assets/sounds/icespike.wav');
		this.load.audio('sound-icespike-hit', 'assets/sounds/icespike-hit.wav');
		this.load.audio('sound-fireball-explosion', 'assets/sounds/fireball-explosion.wav');
		this.load.audio('sound-wind', 'assets/sounds/wind.wav');

		// load font
		this.load.bitmapFont('pixelfont', 'assets/fonts/font.png', 'assets/fonts/font.fnt');

		// Find out which files we need by going through all rendered rooms
		const requiredNpcs = new Set<string>();
		Object.values(globalState.availableRooms).forEach((room) => {
			if (!globalState.availableTilesets.includes(room.tileset)) {
				globalState.availableTilesets.push(room.tileset);
			}
			if (room.decorationTileset && !globalState.availableTilesets.includes(room.decorationTileset)) {
				globalState.availableTilesets.push(room.decorationTileset);
			}
			if (room.overlayTileset && !globalState.availableTilesets.includes(room.overlayTileset)) {
				globalState.availableTilesets.push(room.overlayTileset);
			}
			room.npcs?.forEach((npc) => {
				requiredNpcs.add(npc.type);
			});
			room.usedNpcTypes?.forEach((npcType) => {
				requiredNpcs.add(npcType);
			});
		});

		// Tiles
		globalState.availableTilesets.forEach((tileSet) => {
			this.load.image(tileSet, `assets/tilesets/${tileSet}.png`);
		});

		// If we are in map editor mode, also load the library background tilesets
		const mapToEditId = getUrlParam('editMap');
		if (mapToEditId) {
			this.load.image('base-background', 'assets/tilesets/base-background.png');
			this.load.image('decoration-background', 'assets/tilesets/decoration-background.png');
			this.load.image('overlay-background', 'assets/tilesets/overlay-background.png');
			this.load.image('map-editor-highlighting', 'assets/img/map-editor-highlighting.png');
		}

		// NPCs
		requiredNpcs.forEach((npc) => {
			this.load.spritesheet(
				npc,
				npcTypeToFileMap[npc].file,
				{ frameWidth: 40, frameHeight: 40 }
			);
			this.neededAnimations.push({
				name: npc,
				facingRange: npcTypeToFileMap[npc].facing
			});
			const attackNames = Object.keys(npcTypeToAttackFileMap[npc] || {});
			attackNames.forEach((attackName) => {
				this.load.spritesheet(
					`${npc}-${attackName}`,
					npcTypeToAttackFileMap[npc][attackName].file,
					{ frameWidth: 40, frameHeight: 40 }
				);
			});
		});
	}

	create() {
		const mapToEditId = getUrlParam('editMap');
		if (mapToEditId) {
			this.scene.start('MapEditor');
			return;
		}

		// Create character animations
		for (let directionIndex = 0; directionIndex < NUM_DIRECTIONS; directionIndex++) {
			const numIdleFrames = 4;
			const numWalkFrames = 8;

			const idleFrameOffset = numIdleFrames * directionIndex;
			const firstWalkFrame = numIdleFrames * spriteDirectionList.length;
			const walkFrameOffset = firstWalkFrame + numWalkFrames * directionIndex;

			const directionName = spriteDirectionList[directionIndex];

			this.neededAnimations.forEach((token) => {
				if (directionIndex % token.facingRange === 0) {
					this.anims.create({
						key: `${token.name}-idle-${directionName}`,
						frames: this.anims.generateFrameNumbers(token.name, {
							start: idleFrameOffset / token.facingRange,
							end: idleFrameOffset / token.facingRange /* Currently only 1 drawn */
						}),
						frameRate: 5,
						repeat: -1
					});
					this.anims.create({
						key: `${token.name}-walk-${directionName}`,
						frames: this.anims.generateFrameNumbers(token.name, {
							start: walkFrameOffset / token.facingRange,
							end: walkFrameOffset / token.facingRange + numWalkFrames - 1
						}),
						frameRate: 12,
						repeat: -1
					});
					const attackNames = Object.keys(npcTypeToAttackFileMap[token.name] || {});
					const directionFrameMultiplier = Math.floor(directionIndex / token.facingRange);
					attackNames.forEach((attackName) => {
						const attackData = npcTypeToAttackFileMap[token.name][attackName];
						this.anims.create({
							key: `${token.name}-${attackName}-${directionName}`,
							frames: this.anims.generateFrameNumbers(`${token.name}-${attackName}`, {
								start: directionFrameMultiplier * attackData.framesPerDirection,
								end: (directionFrameMultiplier + 1) * attackData.framesPerDirection  - 1
							}),
							frameRate: 8,
							repeat: 0
						});
					})
				}
			});
		}

		// Prepare essence animations
		essenceNames.forEach((name, index) => {
			this.anims.create({
				key: `essence-${name}`,
				frames: this.anims.generateFrameNumbers('items-essence', {
					start: index * 8,
					end: (index + 1) * 8 - 1
				}),
				frameRate: 12,
				repeat: -1
			});
		});

		// Construct dungeon for this map
		if (!globalState.dungeon.levels[globalState.currentLevel]) {

			// Town is 0, "dungeonLevelx"s are their last character (that's a bit hacky)
			// everything else is -1
			const numericLevel = globalState.currentLevel === 'town' ? 0 :
				globalState.currentLevel.startsWith('dungeonLevel') ?
					parseInt(globalState.currentLevel.substr(-1), 10) :
					-1;

			const dungeonLevel = new DungeonGenerator().generateLevel(
				globalState.currentLevel,
				globalState.roomAssignment[globalState.currentLevel].rooms,
				numericLevel
			);
			
			globalState.dungeon.levels[globalState.currentLevel] = dungeonLevel;
		}

		this.scene.start('MainScene');
	}
}