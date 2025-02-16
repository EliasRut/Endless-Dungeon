import {
	spriteDirectionList,
	NUM_DIRECTIONS,
	npcTypeToFileMap,
	FacingRange,
	ColorsOfMagic,
	activeMode,
	MODE,
	NUM_COLORS_OF_MAGIC,
	npcToAespriteMap,
	NpcTypeList,
	SummonsTypeList,
} from '../helpers/constants';
import worldstate from '../worldState';
import DungeonGenerator from '../helpers/generateDungeon';
import { BLOCK_SIZE } from '../helpers/generateRoom';
import { Quest } from '../../../../typings/custom';
import { fillLoadedQuestFromDb, fillQuestScriptsFromDb, QuestScripts } from '../helpers/quests';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../helpers/initializeApp';
import { getBaseUrl } from '../helpers/getBaseUrl';

/*
	The preload scene is the one we use to load assets. Once it's finished, it brings up the main
	scene.
*/
export default class PreloadScene extends Phaser.Scene {
	constructor() {
		super({ key: 'PreloadScene' });
	}

	neededAnimations = new Array<{ name: string; facingRange: FacingRange }>();

	init() {
		const text = new Phaser.GameObjects.Text(
			this,
			this.cameras.main.centerX,
			this.cameras.main.centerY,
			'Loading ...',
			{
				fontFamily: 'endlessDungeon',
				color: 'white',
				fontSize: '26px',
			}
		);
		this.add.existing(text);
	}

	preload() {
		const baseUrl = getBaseUrl();
		// Empty tile
		this.load.image('empty-tile', `${baseUrl}/assets/img/empty_16x16_tile.png`);
		this.load.image('empty-tile-large-portrait', `${baseUrl}/assets/img/empty_32x48_tile.png`);
		this.load.image('search-icon', `${baseUrl}/assets/img/search-icon.png`);

		// Prepare aseprite data for player, npcs, enemies
		Object.entries(npcToAespriteMap).forEach(([npcKey, { png, json }]) => {
			this.load.aseprite(npcKey, `${baseUrl}/${png}`, `${baseUrl}/${json}`);
		});

		// death
		this.load.aseprite(
			'death_anim_small',
			`${baseUrl}/assets/sprites/enemy_explosion_small.png`,
			`${baseUrl}/assets/sprites/enemy_explosion_small.json`
		);

		// Overlay screens
		this.load.spritesheet('screen-background', 'assets/img/screen-background.png', {
			frameWidth: 64,
			frameHeight: 64,
		});

		// Ability effects
		this.load.image('fire', `${baseUrl}/assets/abilities/fire.png`);
		this.load.image('ice', `${baseUrl}/assets/abilities/ice.png`);
		this.load.image('snow', `${baseUrl}/assets/abilities/snow.png`);
		this.load.image('rock', `${baseUrl}/assets/abilities/rock.png`);
		this.load.image('skull', `${baseUrl}/assets/abilities/skull.png`);

		// Other elements
		this.load.image('quest', 'assets/img/quest.png');

		// GUI
		this.load.scenePlugin(
			'rexuiplugin',
			'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
			'rexUI',
			'rexUI'
		);

		this.load.image('quickselect-wheel', `${baseUrl}/assets/img/quickselect-wheel.png`);
		this.load.image(
			'quickselect-wheel-selection-large',
			`${baseUrl}/assets/img/quickselect-wheel-selection-large.png`
		);
		this.load.image(
			'quickselect-wheel-selection-small',
			`${baseUrl}/assets/img/quickselect-wheel-selection-small.png`
		);
		this.load.image('pad-background', `${baseUrl}/assets/img/pad-background.png`);
		this.load.image('pad-stick', `${baseUrl}/assets/img/pad-stick.png`);
		this.load.image('icon-backpack', `${baseUrl}/assets/img/backpack-icon.png`);
		this.load.image('icon-enchantments', `${baseUrl}/assets/img/enchantment-icon.png`);
		this.load.image('icon-quests', `${baseUrl}/assets/img/quest-icon.png`);
		this.load.image('icon-settings', `${baseUrl}/assets/img/settings-icon.png`);
		this.load.image('icon-hero', `${baseUrl}/assets/img/hero-icon.png`);
		this.load.image('icon-agnes', `${baseUrl}/assets/img/agnes-icon.png`);
		this.load.image('icon-healthbar-background', `${baseUrl}/assets/img/gui-healthbar.png`);
		this.load.image('icon-npc-healthbar-background', `${baseUrl}/assets/img/gui-npc-healthbar.png`);
		this.load.image(
			'ability-background-desktop',
			`${baseUrl}/assets/img/ability-icon-background-desktop.png`
		);
		this.load.image(
			'ability-background-mobile',
			`${baseUrl}/assets/img/ability-icon-background-mobile.png`
		);
		this.load.image('gui-text-equipment', `${baseUrl}/assets/img/gui-text-equipment.png`);
		this.load.image('gui-text-info', `${baseUrl}/assets/img/gui-text-info.png`);
		this.load.image('gui-text-stats', `${baseUrl}/assets/img/gui-text-stats.png`);
		this.load.image('ability-background-p', `${baseUrl}/assets/img/ability-icon-background-p.png`);
		this.load.image('ability-background-1', `${baseUrl}/assets/img/ability-icon-background-1.png`);
		this.load.image('ability-background-2', `${baseUrl}/assets/img/ability-icon-background-2.png`);
		this.load.image('ability-background-3', `${baseUrl}/assets/img/ability-icon-background-3.png`);
		this.load.image('ability-background-4', `${baseUrl}/assets/img/ability-icon-background-4.png`);
		this.load.image('icon-guibase', `${baseUrl}/assets/img/gui-base.png`);
		this.load.image('icon-healthbar', `${baseUrl}/assets/img/gui-life.png`);
		this.load.image('icon-npc-healthbar', `${baseUrl}/assets/img/gui-npc-life.png`);
		this.load.image('inventory-borders', `${baseUrl}/assets/img/inventory-borders-tall.png`);
		this.load.image('inventory-selection', `${baseUrl}/assets/img/inventory-selection.png`);
		this.load.image('checkbox-empty', `${baseUrl}/assets/img/checkbox-empty.png`);
		this.load.image('checkbox-filled', `${baseUrl}/assets/img/checkbox-filled.png`);
		this.load.spritesheet('icon-abilities', `${baseUrl}/assets/img/abilities-sheet.png`, {
			frameWidth: 20,
			frameHeight: 20,
		});

		// Essences
		this.load.spritesheet('items-essence', `${baseUrl}/assets/sprites/items-essence.png`, {
			frameWidth: 16,
			frameHeight: 16,
		});

		// Items
		this.load.spritesheet('test-items-spritesheet', `${baseUrl}/assets/img/items-test-small.png`, {
			frameWidth: 16,
			frameHeight: 16,
		});
		this.load.spritesheet('armor-spritesheet', `${baseUrl}/assets/img/armor-icons.png`, {
			frameWidth: 32,
			frameHeight: 48,
		});
		this.load.spritesheet('catalyst-spritesheet', `${baseUrl}/assets/img/catalyst-icons.png`, {
			frameWidth: 32,
			frameHeight: 48,
		});
		this.load.aseprite(
			'source-fire1',
			`${baseUrl}/assets/sprites/source_flame01.png`,
			`${baseUrl}/assets/sprites/source_flame01.json`
		);
		this.load.aseprite(
			'source-ice1',
			`${baseUrl}/assets/sprites/source_ice01.png`,
			`${baseUrl}/assets/sprites/source_ice01.json`
		);
		this.load.aseprite(
			'source-necrotic1',
			`${baseUrl}/assets/sprites/source_necrotic01.png`,
			`${baseUrl}/assets/sprites/source_necrotic01.json`
		);
		this.load.aseprite(
			'source-arcane1',
			`${baseUrl}/assets/sprites/source_arcane01.png`,
			`${baseUrl}/assets/sprites/source_arcane01.json`
		);
		this.load.image('icon-source-fire1', `${baseUrl}/assets/img/source_icon_flame01.png`);
		this.load.image('icon-source-ice1', `${baseUrl}/assets/img/source_icon_ice01.png`);
		this.load.image('icon-source-necrotic1', `${baseUrl}/assets/img/source_icon_necrotic01.png`);
		this.load.image('icon-source-arcane1', `${baseUrl}/assets/img/source_icon_arcane01.png`);

		this.load.aseprite(
			'essence',
			`${baseUrl}/assets/sprites/essence.png`,
			`${baseUrl}/assets/sprites/essence.json`
		);
		// Doors
		this.load.spritesheet('red-door-north', `${baseUrl}/assets/img/red-door-north.png`, {
			frameWidth: 48,
			frameHeight: 32,
		});
		this.load.image('iron_door_idle', `${baseUrl}/assets/img/iron_door_idle.png`);
		this.load.aseprite(
			'iron_door',
			`${baseUrl}/assets/sprites/iron_door.png`,
			`${baseUrl}/assets/sprites/iron_door.json`
		);

		// Dungeon Door
		this.load.image('dungeon-door', `${baseUrl}/assets/img/dungeon-door.png`);

		// load music score
		this.load.audio('score-town', `${baseUrl}/assets/sounds/score-town.mp3`);
		this.load.audio('score-dungeon', `${baseUrl}/assets/sounds/score-dungeon.mp3`);

		// load sound effects
		this.load.audio('sound-step-grass-l', `${baseUrl}/assets/sounds/step-grass-l.wav`);
		this.load.audio('sound-step-grass-r', `${baseUrl}/assets/sounds/step-grass-r.wav`);
		this.load.audio('sound-fireball', `${baseUrl}/assets/sounds/fireball.wav`);
		this.load.audio('sound-icespike', `${baseUrl}/assets/sounds/icespike.wav`);
		this.load.audio('sound-icespike-hit', `${baseUrl}/assets/sounds/icespike-hit.wav`);
		this.load.audio('sound-fireball-explosion', `${baseUrl}/assets/sounds/fireball-explosion.wav`);
		this.load.audio('sound-wind', `${baseUrl}/assets/sounds/wind.wav`);

		// load font
		this.load.bitmapFont(
			'pixelfont',
			`${baseUrl}/assets/fonts/font.png`,
			`${baseUrl}/assets/fonts/font.fnt`
		);

		// Find out which files we need by going through all rendered rooms
		const requiredNpcs = new Set<string>();
		Object.values(worldstate.availableRooms).forEach((room) => {
			if (!worldstate.availableTilesets.includes(room.tileset)) {
				worldstate.availableTilesets.push(room.tileset);
			}
			if (
				room.decorationTileset &&
				!worldstate.availableTilesets.includes(room.decorationTileset)
			) {
				worldstate.availableTilesets.push(room.decorationTileset);
			}
			if (room.overlayTileset && !worldstate.availableTilesets.includes(room.overlayTileset)) {
				worldstate.availableTilesets.push(room.overlayTileset);
			}
			room.npcs?.forEach((npc) => {
				requiredNpcs.add(npc.type);
			});
			room.usedNpcTypes?.forEach((npcType) => {
				requiredNpcs.add(npcType);
			});
		});

		// Tiles
		worldstate.availableTilesets.forEach((tileSet) => {
			this.load.image(tileSet, `${baseUrl}/assets/tilesets/${tileSet}.png`);
		});

		// Load all default enemies.
		NpcTypeList.forEach((type) => {
			if (!requiredNpcs.has(type)) {
				requiredNpcs.add(type);
			}
		});

		// Load all default summons.
		SummonsTypeList.forEach((type) => {
			if (!requiredNpcs.has(type)) {
				requiredNpcs.add(type);
			}
		});

		// If we are in map editor mode, also load the library background tilesets
		if (activeMode === MODE.MAP_EDITOR) {
			this.load.image('base-background', `${baseUrl}/assets/tilesets/base-background.png`);
			this.load.image(
				'decoration-background',
				`${baseUrl}/assets/tilesets/decoration-background.png`
			);
			this.load.image('overlay-background', `${baseUrl}/assets/tilesets/overlay-background.png`);
			this.load.image(
				'map-editor-highlighting',
				`${baseUrl}/assets/img/map-editor-highlighting.png`
			);
		}

		requiredNpcs.add('vanya-base');

		// NPCs
		requiredNpcs.forEach((npc) => {
			this.neededAnimations.push({
				name: npc,
				facingRange: npcTypeToFileMap[npc]?.facing || FacingRange.ONLY_NESW,
			});
		});

		// Quests
	}

	createAnimFromAseprite(tokenName: string) {
		const data = this.game.cache.json.get(tokenName);
		if (!data) {
			return;
		}

		const meta = data.meta;
		const frames = data.frames;

		if (meta && frames) {
			const frameTags = meta.frameTags || [];

			frameTags.forEach((tag: any) => {
				let animFrames = [];

				const name = tag.name;
				const from = tag.from || 0;
				const to = tag.to || 0;
				const direction = tag.direction || 'forward';

				if (!name) {
					//  Skip if no name
					return;
				}
				let totalDuration = 0;

				//  Get all the frames for this tag and calculate the total duration in milliseconds.
				for (let i = from; i <= to; i++) {
					const frameKey = i.toString();
					const frame = frames[frameKey];

					if (frame) {
						const frameDuration = frame.duration || Number.MAX_SAFE_INTEGER;
						animFrames.push({ key: tokenName, frame: frameKey, duration: frameDuration });
						totalDuration += frameDuration;
					}
				}

				// Fix duration to play nice with how the next tick is calculated.
				// var msPerFrame = totalDuration / animFrames.length;

				// animFrames.forEach(function (entry)
				// {
				//     entry.duration -= msPerFrame;
				// });

				if (direction === 'reverse') {
					animFrames = animFrames.reverse();
				}

				//  Create the animation
				const createConfig = {
					key: name,
					frames: animFrames,
					duration: totalDuration,
					yoyo: direction === 'pingpong',
				};

				this.anims.create(createConfig);
			});
		}
	}

	async create() {
		if (activeMode === MODE.NPC_EDITOR) {
			this.scene.start('NpcEditor');
			return;
		}

		if (activeMode === MODE.MAP_EDITOR) {
			this.scene.start('MapEditor');
			return;
		}

		// Door animation
		this.createAnimFromAseprite('iron_door');

		// Item animation
		this.createAnimFromAseprite('source-fire1');
		this.createAnimFromAseprite('source-ice1');
		this.createAnimFromAseprite('source-necrotic1');
		this.createAnimFromAseprite('source-arcane1');

		// Essence animation
		this.createAnimFromAseprite('essence');

		// Create character animations
		this.createAnimFromAseprite('player');
		this.createAnimFromAseprite('agnes');
		this.createAnimFromAseprite('death_anim_small');

		this.neededAnimations.forEach((token) => {
			if (npcToAespriteMap[token.name]) {
				this.createAnimFromAseprite(token.name);
				return;
			}
			for (let directionIndex = 0; directionIndex < NUM_DIRECTIONS; directionIndex++) {
				const numIdleFrames = 4;
				const numWalkFrames = 8;

				const idleFrameOffset = numIdleFrames * directionIndex;
				const firstWalkFrame = numIdleFrames * spriteDirectionList.length;
				const walkFrameOffset = firstWalkFrame + numWalkFrames * directionIndex;

				const directionName = spriteDirectionList[directionIndex];

				if (directionIndex % token.facingRange === 0) {
					this.anims.create({
						key: `${token.name}-idle-${directionName}`,
						frames: this.anims.generateFrameNumbers(token.name, {
							start: idleFrameOffset / token.facingRange,
							end: idleFrameOffset / token.facingRange /* Currently only 1 drawn */,
						}),
						frameRate: 5,
						repeat: -1,
					});
					this.anims.create({
						key: `${token.name}-walk-${directionName}`,
						frames: this.anims.generateFrameNumbers(token.name, {
							start: walkFrameOffset / token.facingRange,
							end: walkFrameOffset / token.facingRange + numWalkFrames - 1,
						}),
						frameRate: 12,
						repeat: -1,
					});
					// const subAnimationNames = Object.keys(characterToSubAnimationFileMap[token.name] || {});
					// const directionFrameMultiplier = Math.floor(directionIndex / token.facingRange);
					// subAnimationNames.forEach((subAnimation) => {
					// 	const attackData = characterToSubAnimationFileMap[token.name][subAnimation];
					// 	const startFrame =
					// 		directionFrameMultiplier * attackData.framesPerDirection +
					// 		(attackData.frameOffset || 0);

					// 	this.anims.create({
					// 		key: `${token.name}-${subAnimation}-${directionName}`,
					// 		frames: this.anims.generateFrameNumbers(`${token.name}-${subAnimation}`, {
					// 			start: startFrame,
					// 			end:
					// 				startFrame +
					// 				(attackData.animationFrames
					// 					? attackData.animationFrames
					// 					: attackData.framesPerDirection) -
					// 				1,
					// 		}),
					// 		// frameRate: 16,
					// 		repeat: 0,
					// 	});
					// });
				}
			}
		});

		// Prepare essence animations
		Object.values(ColorsOfMagic).forEach((name, index) => {
			this.anims.create({
				key: `essence-${name}`,
				frames: this.anims.generateFrameNumbers('items-essence', {
					start: index * NUM_COLORS_OF_MAGIC,
					end: (index + 1) * NUM_COLORS_OF_MAGIC - 1,
				}),
				frameRate: 12,
				repeat: -1,
			});
		});

		// Construct dungeon for this map
		if (
			!worldstate.dungeon.levels[worldstate.currentLevel] &&
			worldstate.currentLevel.startsWith('dungeonLevel')
		) {
			// Town is 0, "dungeonLevelx"s are their last character (that's a bit hacky)
			// everything else is -1
			const numericLevel =
				worldstate.currentLevel === 'town'
					? 0
					: worldstate.currentLevel.startsWith('dungeonLevel')
					? parseInt(worldstate.currentLevel.substr(-1), 10)
					: -1;

			const levelData = worldstate.roomAssignment[worldstate.currentLevel];
			const dungeonLevel = new DungeonGenerator().generateLevel(
				worldstate.currentLevel,
				numericLevel,
				{
					title: levelData.title,
					rooms: levelData.rooms,
					width: levelData.width,
					height: levelData.height,
					enemyBudget: levelData.enemyBudget || 0,
					numberOfRooms: levelData.numberOfRooms || 0,
					style: levelData.style || ColorsOfMagic.DEATH,
					isDungeon: true,
				}
			);

			worldstate.dungeon.levels[worldstate.currentLevel] = dungeonLevel;
		} else if (!worldstate.dungeon.levels[worldstate.currentLevel]) {
			// Town is 0, "dungeonLevelx"s are their last character (that's a bit hacky)
			// everything else is -1
			const numericLevel = worldstate.currentLevel.startsWith('town') ? 0 : -1;

			const roomData = worldstate.availableRooms[worldstate.currentLevel];

			// const levelData = globalState.roomAssignment[globalState.currentLevel];
			const roomLevelData = new DungeonGenerator().generateLevel(
				worldstate.currentLevel,
				numericLevel,
				{
					title: roomData.title || '',
					rooms: [worldstate.currentLevel],
					width: Math.ceil(roomData.layout[0].length / BLOCK_SIZE) + 2,
					height: Math.ceil(roomData.layout.length / BLOCK_SIZE) + 2,
					enemyBudget: 0,
					numberOfRooms: 1,
					style: roomData.colorOfMagic || ColorsOfMagic.DEATH,
					isDungeon: false,
				}
			);

			worldstate.dungeon.levels[worldstate.currentLevel] = roomLevelData;
		}

		// Load quests from database
		const db = getFirestore(app);
		const questsCollection = collection(db, 'quests');
		const questQuery = await getDocs(questsCollection);
		const quests = questQuery.docs.map((doc) => [doc.id, doc.data() as Quest]) as [string, Quest][];
		const loadedQuestScripts = quests.reduce((obj, [id, quest]) => {
			if (quest.scripts) {
				obj[id] = quest.scripts;
			}
			return obj;
		}, {} as { [name: string]: QuestScripts });
		fillQuestScriptsFromDb(loadedQuestScripts);

		const loadedQuests = quests.reduce((obj, [id, quest]) => {
			obj[id] = quest;
			return obj;
		}, {} as { [name: string]: Quest });
		fillLoadedQuestFromDb(loadedQuests);

		this.scene.start('MainScene');
	}
}
