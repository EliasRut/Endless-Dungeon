import 'phaser';
import firebase from 'firebase';
import AbilityHelper from '../helpers/AbilityHelper';
import AbilityEffect from '../drawables/effects/AbilityEffect';
import FireBallEffect from '../drawables/effects/FireBallEffect';
import MainScene from './MainScene';
import {
	ColorsOfMagic,
	Facings,
	Faction,
	MinMaxParticleEffectValue,
	SimpleParticleEffectValue,
} from '../helpers/constants';
import { Abilities, AbilityType, ProjectileData } from '../abilities/abilityData';
import PlayerCharacter from '../worldstate/PlayerCharacter';
import Character from '../worldstate/Character';
import NpcToken from '../drawables/tokens/NpcToken';
import CharacterToken from '../drawables/tokens/CharacterToken';
import DungeonGenerator from '../helpers/generateDungeon';
import globalState from '../worldstate/index';
import { generateTilemap } from '../helpers/drawDungeon';
import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import { TILE_WIDTH, TILE_HEIGHT } from '../helpers/generateDungeon';
import DoorToken from '../drawables/tokens/DoorToken';
import { ColorEffectValue } from '../helpers/constants';

const SCALE = 2;

export const DefaultAbilityData = {
	projectileImage: 'fire',
	particleImage: 'fire',
	projectiles: 1,
	delay: 0,
	minSpread: 0,
	maxSpread: 0,
	velocity: 200,
	drag: 0,
	emitterAlpha: 1,
	emitterScale: 1,
	emitterSpeed: 20,
	emitterRotate: 0,
	emitterLifespan: 300,
	emitterMaxParticles: 100,
	emitterFrequency: 20,
	emitterExplosionSpeed: 70,
	emitterExplosionParticles: 40,
	emitterExplosionLifespan: 300,
	emitterTint: 0xffffff,
};

export interface EditedAbilityData {
	emitterAlpha: SimpleParticleEffectValue;
	emitterScale: SimpleParticleEffectValue;
	emitterSpeed: SimpleParticleEffectValue;
	emitterRotate: SimpleParticleEffectValue;
	emitterLifespan: MinMaxParticleEffectValue;
	emitterMaxParticles: number;
	emitterFrequency: number;
	emitterTint: ColorEffectValue;
	emitterExplosionSpeed: SimpleParticleEffectValue;
	emitterExplosionLifespan: MinMaxParticleEffectValue;
	emitterExplosionParticles: number;
	projectileImage: string;
	particleImage: string;
	projectiles: number;
	delay: number;
	minSpread: number;
	maxSpread: number;
	velocity: number;
	drag: number;
}

export interface MapEditorReactBridge {
	getData: () => EditedAbilityData;
}

export default class AbilityEditor extends Phaser.Scene {
	database: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
	lastCast: number = -Infinity;
	abilityHelper: AbilityHelper;
	mainCharacter: PlayerCharacterToken;
	npcMap: { [id: string]: CharacterToken } = {};
	doorMap: { [id: string]: DoorToken } = {};
	tileLayer: Phaser.Tilemaps.TilemapLayer;
	decorationLayer: Phaser.Tilemaps.TilemapLayer;
	overlayLayer: Phaser.Tilemaps.TilemapLayer;
	startX: number = 0;
	startY: number = 0;

	reactBridge?: MapEditorReactBridge;

	constructor() {
		super({ key: 'AbilityEditor' });
		this.database = firebase.firestore().collection('abilities');
		this.abilityHelper = new AbilityHelper(this as unknown as MainScene);
	}

	preload() {
		this.load.image('empty-tile', 'assets/img/empty_16x16_tile.png');

		// Ability effects
		this.load.image('fire', 'assets/abilities/fire.png');
		this.load.image('ice', 'assets/abilities/ice.png');
		this.load.image('snow', 'assets/abilities/snow.png');
		this.load.image('rock', 'assets/abilities/rock.png');
		this.load.image('skull', 'assets/abilities/skull.png');

		// load sound effects
		this.load.audio('sound-step-grass-l', 'assets/sounds/step-grass-l.wav');
		this.load.audio('sound-step-grass-r', 'assets/sounds/step-grass-r.wav');
		this.load.audio('sound-fireball', 'assets/sounds/fireball.wav');
		this.load.audio('sound-icespike', 'assets/sounds/icespike.wav');
		this.load.audio('sound-icespike-hit', 'assets/sounds/icespike-hit.wav');
		this.load.audio('sound-fireball-explosion', 'assets/sounds/fireball-explosion.wav');
		this.load.audio('sound-wind', 'assets/sounds/wind.wav');

		globalState.availableTilesets.push('COM-death-B', 'COM-death-D', 'COM-death-O');
		globalState.availableTilesets.forEach((tileSet) => {
			this.load.image(tileSet, `assets/tilesets/${tileSet}.png`);
		});
	}

	create() {
		const tilesetLayoutRow = Array.from({ length: 32 }, () => 32);
		const overlayLayoutRow = Array.from({ length: 32 }, () => 0);
		const generator = new DungeonGenerator();
		globalState.availableRooms.abilityEditorRoom = {
			startRoom: true,
			tileset: 'COM-death-B',
			decorationTileset: 'COM-death-D',
			overlayTileset: 'COM-death-O',
			layout: Array.from({ length: 16 }, () => tilesetLayoutRow),
			decorations: Array.from({ length: 16 }, () => overlayLayoutRow),
			overlays: Array.from({ length: 16 }, () => overlayLayoutRow),
			npcs: [],
			connections: [],
			items: [],
			openings: [],
			name: 'Ability Editor Room',
			scripts: {},
			usedNpcTypes: [],
			doors: [],
			title: 'Ability Editor Room',
			colorOfMagic: ColorsOfMagic.DEATH,
			noRandomEnemies: true,
			lightingSources: [],
		};
		const level = generator.generateLevel('abilityEditorDungeon', 1, {
			title: 'Ability Editor',
			style: ColorsOfMagic.DEATH,
			rooms: ['abilityEditorRoom'],
			width: 6,
			height: 4,
			numberOfRooms: 1,
			enemyBudget: 0,
			isDungeon: false,
			specialStartRoom: true,
		});

		const layers = generateTilemap(this, level);
		this.tileLayer = layers[0];
		this.tileLayer.setScale(SCALE);
		this.tileLayer.setDepth(1);
		this.tileLayer.setAlpha(0.5);
		this.decorationLayer = layers[1];
		this.decorationLayer.setScale(SCALE);
		this.decorationLayer.setDepth(2);
		this.overlayLayer = layers[2];
		this.overlayLayer.setScale(SCALE);
		this.overlayLayer.setDepth(3);

		// const debugGraphics = this.add.graphics().setAlpha(0.75);
		// this.tileLayer.renderDebug(debugGraphics, {
		// 	tileColor: null, // Color of non-colliding tiles
		// 	collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
		// 	faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
		// });

		// this.mainCharacter = new NpcToken(
		// 	this as unknown as MainScene,
		// 	level.startPositionX,
		// 	level.startPositionY
		// );
		// this.mainCharacter.setScale(SCALE);
		// this.mainCharacter.setDepth(1);
		// this.cameras.main.startFollow(this.mainCharacter, false);
		this.cameras.main.setPosition(-8 * TILE_WIDTH * SCALE, -8 * TILE_HEIGHT * SCALE);
		this.startX = 8 * TILE_WIDTH;
		this.startY = 11 * TILE_HEIGHT;

		const text = new Phaser.GameObjects.Text(this, 0, 0, 'Some Text', {});
		this.add.existing(text);
	}

	public registerReactBridge = (bridge: MapEditorReactBridge) => {
		this.reactBridge = bridge;
	};

	getTokenForStateObject: (...params: any[]) => CharacterToken | undefined = () => {
		return undefined;
	};

	update(globalTime: number, delta: number) {
		// const projectileData = Abilities[AbilityType.FIREBALL].projectileData;
		const projectileData = Abilities[AbilityType.FIREBALL].projectileData;

		const data = this.reactBridge?.getData() || DefaultAbilityData;

		if (globalTime - this.lastCast > 1000) {
			this.lastCast = globalTime;
			this.abilityHelper.triggerAbility(
				{
					x: this.startX,
					y: this.startY,
					currentFacing: Facings.EAST,
					faction: Faction.PLAYER,
					damage: 1,
				} as Character,
				{
					x: this.startX,
					y: this.startY,
					currentFacing: Facings.EAST,
				},
				AbilityType.FIREBALL,
				1,
				globalTime,
				1,
				{
					...Abilities[AbilityType.FIREBALL],
					projectiles: data.projectiles,
					projectileData: {
						...projectileData!,
						projectileImage: data.projectileImage,
						spread: [data.minSpread, data.maxSpread],
						velocity: data.velocity,
						drag: data.drag,
						delay: data.delay,
						particleData: {
							...(projectileData?.particleData || {}),
							particleImage: data.particleImage,
							alpha: data.emitterAlpha,
							scale: data.emitterScale,
							speed: data.emitterSpeed,
							rotate: data.emitterRotate,
							lifespan: data.emitterLifespan,
							frequency: data.emitterFrequency,
							maxParticles: data.emitterMaxParticles,
							tint: data.emitterTint,
						},
						explosionData: {
							...(projectileData?.explosionData || {}),
							particles: data.emitterExplosionParticles,
							speed: data.emitterExplosionSpeed,
							lifespan: data.emitterExplosionLifespan,
						},
					},
				}
			);
			// const newEffect = new FireBallEffect(
			// 	this.scene as unknown as MainScene,
			// 	0,
			// 	0,
			// 	'',
			// 	Facings.EAST,
			// 	projectileData!
			// );
		}

		this.abilityHelper.update(globalTime, []);
	}
}
