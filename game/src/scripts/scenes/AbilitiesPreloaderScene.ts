import globalState from '../worldstate';
import firebase from 'firebase';
import { ConditionalAbilityDataMap, Abilities, AbilityData } from '../abilities/abilityData';
import { AbilityType } from 'shared/AbilityType';

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
		if (globalState.loadGame) {
			globalState.loadState();
		}
	}

	async create() {
		const { contentPackages } = globalState;
		const dbAbilities: { [dbKey: string]: AbilityData } = {};
		const conditionalAbilities: ConditionalAbilityDataMap = Object.entries(Abilities).reduce(
			(obj, [key, ability]) => {
				obj[key as AbilityType] = [{ data: ability }];
				return obj;
			},
			{} as ConditionalAbilityDataMap
		);

		const abilityMappingPromises: Promise<
			firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
		>[] = [];
		const abilitiesPromises: Promise<
			firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
		>[] = [];

		for (const contentPackage of contentPackages) {
			const abilityMappingsQuery = firebase
				.firestore()
				.collection('abilityMappings')
				.where('contentPackage', '==', contentPackage);
			abilityMappingPromises.push(abilityMappingsQuery.get());
			const abilitiesQuery = firebase
				.firestore()
				.collection('abilities')
				.where('contentPackage', '==', contentPackage);
			abilitiesPromises.push(abilitiesQuery.get());
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

		globalState.abilityData = conditionalAbilities;
		this.scene.start('RoomPreloaderScene');
	}
}
