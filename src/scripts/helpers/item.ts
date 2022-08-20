import {
	EquippableItemType,
	SourceData,
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
	EquipmentKey,
} from '../../items/itemData';
import { AbilityType } from '../abilities/abilityData';
import { getItemDataForName } from '../../items/itemData';

export interface EquippableDroppedItemData {
	level: number;
	itemKey: EquippableItemType;
}

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
	sourceWeight: 0,
	catalystWeight: 0,
	armorWeight: 0,
	ringWeight: 0,
	amuletWeight: 0,
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
	let itemKey: EquipmentKey;
	const totalWeight = sourceWeight + catalystWeight + armorWeight + ringWeight + amuletWeight;
	if (rnd < sourceWeight / totalWeight) {
		itemType = EquippableItemType.SOURCE;
		if (sourceTypes && sourceTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * sourceTypes.length);
			itemKey = sourceTypes[randomIndex];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(SourceData).length);
			itemKey = Object.keys(SourceData)[randomIndex] as Source;
		}
	} else if (rnd < (sourceWeight + catalystWeight) / totalWeight) {
		itemType = EquippableItemType.CATALYST;
		if (catalystTypes && catalystTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * catalystTypes.length);
			itemKey = catalystTypes[randomIndex];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(CatalystData).length);
			itemKey = Object.keys(CatalystData)[randomIndex] as Catalyst;
		}
	} else if (rnd < (sourceWeight + catalystWeight + armorWeight) / totalWeight) {
		itemType = EquippableItemType.CHESTPIECE;
		if (chestPieceTypes && chestPieceTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * chestPieceTypes.length);
			itemKey = chestPieceTypes[randomIndex];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(ChestPieceData).length);
			itemKey = Object.keys(ChestPieceData)[randomIndex] as ChestPiece;
		}
	} else if (rnd < (sourceWeight + catalystWeight + ringWeight + armorWeight) / totalWeight) {
		itemType = EquippableItemType.RING;
		if (ringTypes && ringTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * ringTypes.length);
			itemKey = ringTypes[randomIndex];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(RingData).length);
			itemKey = Object.keys(RingData)[randomIndex] as Ring;
		}
	} else {
		itemType = EquippableItemType.AMULET;
		if (amuletTypes && amuletTypes.length > 0) {
			const randomIndex = Math.floor(Math.random() * amuletTypes.length);
			itemKey = amuletTypes[randomIndex];
		} else {
			const randomIndex = Math.floor(Math.random() * Object.keys(AmuletData).length);
			itemKey = Object.keys(AmuletData)[randomIndex] as Amulet;
		}
	}
	return { itemKey, level };
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
	if (offHand.catalystType === Catalyst.SUMMON) {
		switch (baseAbility) {
			case AbilityType.ARCANE_BOLT: {
				return AbilityType.ARCANE_SUMMON_CIRCELING;
			}
			case AbilityType.NECROTIC_BOLT: {
				return AbilityType.NECROTIC_SUMMON_CIRCELING;
			}
			case AbilityType.ICESPIKE: {
				return AbilityType.ICE_SUMMON_CIRCELING;
			}
			case AbilityType.FIREBALL:
			default: {
				return AbilityType.FIRE_SUMMON_CIRCELING;
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
