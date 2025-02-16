import worldstate from '../worldState';
import { Abilities } from '../abilities/abilityData';
import {
	collection,
	DocumentData,
	getDocs,
	getFirestore,
	query,
	QuerySnapshot,
	where,
} from 'firebase/firestore';
import { app } from '../../shared/initializeApp';
import { AbilityData, ConditionalAbilityDataMap } from '../../types/AbilityData';
import { AbilityType } from '../../types/AbilityType';

/*
	The preload scene is the one we use to load assets. Once it's finished, it brings up the main
	scene.
*/
export default class AbilitiesPreloaderScene extends Phaser.Scene {
	constructor() {
		super({ key: 'AbilitiesPreloaderScene' });
	}

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
		if (worldstate.loadGame) {
			worldstate.loadState();
		}
	}

	async create() {
		const { contentPackages } = worldstate;
		const dbAbilities: { [dbKey: string]: AbilityData } = {};
		const conditionalAbilities: ConditionalAbilityDataMap = Object.entries(Abilities).reduce(
			(obj, [key, ability]) => {
				obj[key as AbilityType] = [{ data: ability }];
				return obj;
			},
			{} as ConditionalAbilityDataMap
		);

		const abilityMappingPromises: Promise<QuerySnapshot<DocumentData>>[] = [];
		const abilitiesPromises: Promise<QuerySnapshot<DocumentData>>[] = [];

		const db = getFirestore(app);
		const abilityMappingCollection = collection(db, 'abilityMappings');
		const abilitiesCollection = collection(db, 'abilities');

		for (const contentPackage of contentPackages) {
			const abilityMappingsQuery = getDocs(
				query(abilityMappingCollection, where('contentPackage', '==', contentPackage))
			);
			abilityMappingPromises.push(abilityMappingsQuery);
			const abilitiesQuery = getDocs(
				query(abilitiesCollection, where('contentPackage', '==', contentPackage))
			);
			abilitiesPromises.push(abilitiesQuery);
		}

		await Promise.all(abilitiesPromises).then((abilitiesPromise) => {
			for (const abilitiesQuery of abilitiesPromise) {
				for (const ability of abilitiesQuery.docs) {
					dbAbilities[ability.id as AbilityType] = ability.data() as AbilityData;
				}
			}
		});

		await Promise.all(abilityMappingPromises).then((abilityMappingPromise) => {
			abilityMappingPromise.forEach((abilityMappingQuery) => {
				for (const abilityMapping of abilityMappingQuery.docs) {
					const abilityMappingDataList = abilityMapping.get('abilities');
					for (const abilityMappingData of abilityMappingDataList) {
						const abilityType = abilityMappingData.abilityType as AbilityType;
						conditionalAbilities[abilityType] = [
							{
								conditions: abilityMappingData.conditions,
								data: dbAbilities[abilityMappingData.abilityId],
							},
							...(conditionalAbilities[abilityType] || []),
						];
					}
				}
			});
		});

		worldstate.abilityData = conditionalAbilities;
		this.scene.start('RoomPreloaderScene');
	}
}
