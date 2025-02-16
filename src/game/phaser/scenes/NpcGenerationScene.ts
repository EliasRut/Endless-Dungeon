import { NpcData } from '../../../../typings/custom';
import { npcToAespriteMap, npcTypeToFileMap } from '../helpers/constants';
import worldstate from '../worldState';
import {
	generateColorConversionTable,
	generateColorReplacedTextures,
	generatePalleteLookup,
	getColorReplacedImageSource,
} from '../helpers/colors';
import {
	collection,
	doc,
	DocumentData,
	DocumentSnapshot,
	getDoc,
	getFirestore,
} from 'firebase/firestore';
import { app } from '../helpers/initializeApp';
import { getBaseUrl } from '../helpers/getBaseUrl';

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
		Object.values(worldstate.availableRooms).forEach((room) => {
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

		const baseUrl = getBaseUrl();

		// NPCs
		requiredNpcs.forEach((npc) => {
			if (npcTypeToFileMap[npc]) {
				this.load.spritesheet(npc, `${baseUrl}/${npcTypeToFileMap[npc].file}`, {
					frameWidth: 40,
					frameHeight: 40,
				});
			} else if (npcToAespriteMap[npc]) {
				this.load.aseprite(
					npc,
					`${baseUrl}/${npcToAespriteMap[npc].png}`,
					`${baseUrl}/${npcToAespriteMap[npc].json}`
				);
			} else {
				if (!this.textures.exists(npc)) {
					this.npcForGeneration.push(npc);
				}
			}
		});

		// Bodies
		this.load.image('body-1', `${baseUrl}/assets/npcSets/bodies/body1.png`);

		// Hair
		this.load.image('hair-1', `${baseUrl}/assets/npcSets/hair/hair1.png`);
		this.load.image('hair-2', `${baseUrl}/assets/npcSets/hair/hair2.png`);

		// Shirts
		this.load.image('shirt-1', `${baseUrl}/assets/npcSets/shirt/shirt1.png`);

		// Pants
		this.load.image('pants-1', `${baseUrl}/assets/npcSets/pants/pants1.png`);
	}

	create() {
		const db = getFirestore(app);
		const npcsCollection = collection(db, 'npcs');
		const npcPromises = this.npcForGeneration.map((npcId) => {
			return getDoc(doc(npcsCollection, npcId)).then((data) => [npcId, data]);
		}) as Promise<[string, DocumentSnapshot<DocumentData>]>[];

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
