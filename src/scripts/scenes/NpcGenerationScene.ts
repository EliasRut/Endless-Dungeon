import { NpcData } from '../../../typings/custom';
import {
	FacingRange,
	npcToAespriteMap,
	npcTypeToFileMap,
	NUM_DIRECTIONS,
	spriteDirectionList,
} from '../helpers/constants';
import globalState from '../worldstate';
import firebase from 'firebase';
import {
	generateColorConversionTable,
	generateColorReplacedTextures,
	generatePalleteLookup,
	getColorReplacedImageSource,
} from '../helpers/colors';

/*
	The preload scene is the one we use to load assets. Once it's finished, it brings up the main
	scene.
*/
export default class NpcGenerationScene extends Phaser.Scene {
	constructor() {
		super({ key: 'NpcGenerationScene' });
	}

	npcForGeneration: string[] = [];

	preload() {
		this.npcForGeneration = [];
		const requiredNpcs = new Set<string>();		
		requiredNpcs.add('vanya-base');
		requiredNpcs.add('agnes');
		requiredNpcs.add('erwin');
		requiredNpcs.add('hilda-base');
		Object.values(globalState.availableRooms).forEach((room) => {
			room.npcs?.forEach((npc) => {
				if (!npc.type) {
					throw new Error(`No npc type found for room ${room.name}.`);
				}
				requiredNpcs.add(npc.type);
			});
			room.usedNpcTypes?.forEach((npcType) => {
				if (!npcType) {
					throw new Error(`No npc type found for room ${room.name}.`);
				}
				requiredNpcs.add(npcType);
			});
		});

		// NPCs
		requiredNpcs.forEach((npc) => {
			if (npcTypeToFileMap[npc]) {
				this.load.spritesheet(npc, npcTypeToFileMap[npc].file, { frameWidth: 40, frameHeight: 40 });
			} else if (npcToAespriteMap[npc]) {
				this.load.aseprite(npc, npcToAespriteMap[npc].png, npcToAespriteMap[npc].json)
			} else {
				if (!this.textures.exists(npc)) {
					this.npcForGeneration.push(npc);
				}
			}
		});

		// Bodies
		this.load.image('body-1', 'assets/npcSets/bodies/body1.png');

		// Hair
		this.load.image('hair-1', 'assets/npcSets/hair/hair1.png');
		this.load.image('hair-2', 'assets/npcSets/hair/hair2.png');

		// Shirts
		this.load.image('shirt-1', 'assets/npcSets/shirt/shirt1.png');

		// Pants
		this.load.image('pants-1', 'assets/npcSets/pants/pants1.png');
	}

	create() {
		const db = firebase.firestore().collection('npcs');
		const npcPromises = this.npcForGeneration.map((npcId) => {
			return db
				.doc(npcId)
				.get()
				.then((data) => [npcId, data]);
		}) as Promise<[string, firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>]>[];

		Promise.all(npcPromises)
			.then((npcDocs) => {
				for (const [npcId, npcDoc] of npcDocs) {
					const npcDbData = npcDoc.data() as NpcData;
					if (!npcDbData) {
						throw new Error(`Npc ${npcId} not found in the database.`);
					}

					const lookupTable = generatePalleteLookup(
						npcDbData.bodyTemplate as any,
						npcDbData.hairTemplate as any,
						npcDbData.shirtTemplate as any,
						npcDbData.pantsTemplate as any
					);

					const conversionTable = generateColorConversionTable(lookupTable, npcDbData);

					generateColorReplacedTextures(this.textures, conversionTable, npcDbData);

					const imageData = getColorReplacedImageSource(this.textures);

					this.textures.addSpriteSheet(npcId, imageData, {
						frameWidth: 40,
						frameHeight: 40,
					});
				}
			})
			.then(() => {
				this.scene.start('PreloadScene');
			});
	}
}
