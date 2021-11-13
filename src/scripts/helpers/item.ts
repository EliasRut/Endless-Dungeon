import EquippableItem from '../worldstate/EquippableItem';
import {
	EquippableItemType,
	SourceData,
	ItemData,
	AbilityLinkedItem,
	CatalystData,
	ChestPieceData,
	RingData,
	AmuletData,
	CatalystItem,
	Source,
	Catalyst,
	ChestPiece,
	Ring,
	Amulet,
} from '../../items/itemData';
import { AbilityType } from '../abilities/abilityData';

const MAX_HEALTH = 20;
const BASE_DAMAGE = 0;
const MAX_ADDITIONAL_DAMAGE = 1;
const MAX_MOVEMENT_SPEED = 35;
const BASE_MAIN_STAT = 1;
const MAX_ADDITIONAL_MAIN_STAT = 1;

export interface RandomItemOptions {
	level: number;
	sourceWeight: number;
	catalystWeight: number;
	armorWeight: number;
	ringWeight: number;
	amuletWeight: number;
	sourceTypes?: Source[];
	catalystTypes?: Catalyst[];
	chestPieceTypes?: ChestPiece[];
	ringTypes?: Ring[];
	amuletTypes?: Amulet[];
}

const randomItemDefaultOptionss: RandomItemOptions = {
	level: 1,
	sourceWeight: 1,
	catalystWeight: 1,
	armorWeight: 1,
	ringWeight: 1,
	amuletWeight: 1,
};

export const generateRandomItem = (options: Partial<RandomItemOptions>) => {
	const combinedOptions = {
		...randomItemDefaultOptionss,
		...options,
	};
	const {
		level,
		sourceWeight,
		catalystWeight,
		armorWeight,
		ringWeight,
		amuletWeight,
		sourceTypes,
		catalystTypes,
		chestPieceTypes,
		ringTypes,
		amuletTypes,
	} = combinedOptions;

	const rnd = Math.random();
	let itemType: string;
	let data: ItemData | AbilityLinkedItem;
	const totalWeight = sourceWeight + catalystWeight + armorWeight + ringWeight + amuletWeight;
	if (rnd < sourceWeight / totalWeight) {
		itemType = EquippableItemType.SOURCE;
		if (sourceTypes && sourceTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * sourceTypes.length);
			data = SourceData[sourceTypes[randomIndex]];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(SourceData).length);
			data = Object.values(SourceData)[randomIndex];
		}
	} else if (rnd < (sourceWeight + catalystWeight) / totalWeight) {
		itemType = EquippableItemType.CATALYST;
		if (catalystTypes && catalystTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * catalystTypes.length);
			data = CatalystData[catalystTypes[randomIndex]];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(CatalystData).length);
			data = Object.values(CatalystData)[randomIndex];
		}
	} else if (rnd < (sourceWeight + catalystWeight + armorWeight) / totalWeight) {
		itemType = EquippableItemType.CHESTPIECE;
		if (chestPieceTypes && chestPieceTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * chestPieceTypes.length);
			data = ChestPieceData[chestPieceTypes[randomIndex]];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(ChestPieceData).length);
			data = Object.values(ChestPieceData)[randomIndex];
		}
	} else if (rnd < (sourceWeight + catalystWeight + ringWeight + armorWeight) / totalWeight) {
		itemType = EquippableItemType.RING;
		if (ringTypes && ringTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * ringTypes.length);
			data = RingData[ringTypes[randomIndex]];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(RingData).length);
			data = Object.values(RingData)[randomIndex];
		}
	} else {
		itemType = EquippableItemType.NECKLACE;
		if (amuletTypes && amuletTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * amuletTypes.length);
			data = AmuletData[amuletTypes[randomIndex]];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(AmuletData).length);
			data = Object.values(AmuletData)[randomIndex];
		}
	}
	return new EquippableItem(
		Math.random() * MAX_HEALTH * (1 + level),
		Math.random() * MAX_ADDITIONAL_DAMAGE * (1 + level * 0.5) + BASE_DAMAGE,
		Math.random() * MAX_MOVEMENT_SPEED * (1 + level * 0.1),
		Math.random() * MAX_ADDITIONAL_MAIN_STAT * (1 + level * 0.5) + BASE_MAIN_STAT,
		itemType,
		data
	);
};

export const getCatalystAbility = (baseAbility: AbilityType, offHand: CatalystItem) => {
	if (offHand.catalystType === Catalyst.CONE) {
		switch (baseAbility) {
			case AbilityType.ARCANE_BOLT: {
				return AbilityType.ARCANE_CONE;
			}
			case AbilityType.NECROTIC_BOLT: {
				return AbilityType.NECROTIC_CONE;
			}
			case AbilityType.ICESPIKE: {
				return AbilityType.ICE_CONE;
			}
			case AbilityType.FIREBALL:
			default: {
				return AbilityType.FIRE_CONE;
			}
		}
	}
	if (offHand.catalystType === Catalyst.NOVA) {
		switch (baseAbility) {
			case AbilityType.ARCANE_BOLT: {
				return AbilityType.ARCANE_NOVA;
			}
			case AbilityType.NECROTIC_BOLT: {
				return AbilityType.NECROTIC_NOVA;
			}
			case AbilityType.ICESPIKE: {
				return AbilityType.ICE_NOVA;
			}
			case AbilityType.FIREBALL:
			default: {
				return AbilityType.FIRE_NOVA;
			}
		}
	}
	switch (baseAbility) {
		case AbilityType.ICESPIKE: {
			return AbilityType.HAIL_OF_ICE;
		}
		case AbilityType.ARCANE_BOLT: {
			return AbilityType.HAIL_OF_BOLTS;
		}
		case AbilityType.NECROTIC_BOLT: {
			return AbilityType.HAIL_OF_DEATH;
		}
		case AbilityType.FIREBALL:
		default: {
			return AbilityType.HAIL_OF_FLAMES;
		}
	}
};
