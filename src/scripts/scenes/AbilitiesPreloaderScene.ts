import { ConditionalAbilityListing, DatabaseRoom, Room } from '../../../typings/custom';
import { getUrlParam } from '../helpers/browserState';
import { activeMode, ColorsOfMagic, MODE } from '../helpers/constants';
import RoomGenerator from '../helpers/generateRoom';
import globalState from '../worldstate';
import firebase from 'firebase';
import { deserializeRoom } from '../helpers/serialization';
import { ConditionalAbilityDataMap, Abilities, AbilityType } from '../abilities/abilityData';

/*
	The preload scene is the one we use to load assets. Once it's finished, it brings up the main
	scene.
*/
export default class RoomPreloaderScene extends Phaser.Scene {
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

	preload() {}

	create() {
		const { contentPackages } = globalState;
		const abilityMappings: ConditionalAbilityListing[] = [];
		const conditionalAbilities: ConditionalAbilityDataMap = Object.entries(Abilities).reduce(
			(obj, [key, ability]) => {
				obj[key as AbilityType] = [{ data: ability }];
				return obj;
			},
			{} as ConditionalAbilityDataMap
		);

		for (const contentPackage of contentPackages) {
			const abilityMappingsQuery = firebase
				.firestore()
				.collection('abilityMappings')
				.where('contentPackage', '==', contentPackage);

			const abilitiesQuery = firebase
				.firestore()
				.collection('abilities')
				.where('contentPackage', '==', contentPackage);
		}
	}
}
