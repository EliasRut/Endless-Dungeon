import EquippableItem from '../worldstate/EquippableItem';
import {
	EquippableItemType,
	SourceData,
	ItemData,
	AbilityLinkedItem,
	CatalystData,
	ChestPieceData,
	RingData,
	AmuletData
} from '../../items/itemData';

const MAX_HEALTH = 100;
const BASE_DAMAGE = 1;
const MAX_ADDITIONAL_DAMAGE = 1;
const MAX_MOVEMENT_SPEED = 100;
const BASE_MAIN_STAT = 1;
const MAX_ADDITIONAL_MAIN_STAT = 1;

export const generateRandomItem = (
								sourceWeight: number = 1,
								catalystWeight: number = 1,
								armorWeight: number = 1,
								ringWeight: number = 1,
								amuletWeight: number = 1) => {
	const rnd = Math.random();
	let itemType: string;
	let data: ItemData | AbilityLinkedItem;
	const totalWeight = sourceWeight + catalystWeight + armorWeight + ringWeight + amuletWeight;
	if (rnd < (sourceWeight / totalWeight)) {
		itemType = EquippableItemType.SOURCE;
		const randomIndex = Math.floor(Math.random() * Object.keys(SourceData).length);
		data = Object.values(SourceData)[randomIndex];
	} else if (rnd < (sourceWeight + catalystWeight) / totalWeight) {
		itemType = EquippableItemType.CATALYST;
		const randomIndex = Math.floor(Math.random() * Object.keys(CatalystData).length);
		data = Object.values(CatalystData)[randomIndex];
	} else if (rnd < (sourceWeight + catalystWeight + armorWeight) / totalWeight) {
		itemType = EquippableItemType.CHESTPIECE;
		const randomIndex = Math.floor(Math.random() * Object.keys(ChestPieceData).length);
		data = Object.values(ChestPieceData)[randomIndex];
	} else if (rnd < (sourceWeight + catalystWeight + ringWeight) / totalWeight) {
		itemType = EquippableItemType.RING;
		const randomIndex = Math.floor(Math.random() * Object.keys(RingData).length);
		data = Object.values(RingData)[randomIndex];
	} else {
		itemType = EquippableItemType.NECKLACE;
		const randomIndex = Math.floor(Math.random() * Object.keys(AmuletData).length);
		data = Object.values(AmuletData)[randomIndex];
	}
	return new EquippableItem(
		Math.random() * MAX_HEALTH,
		Math.random() * MAX_ADDITIONAL_DAMAGE + BASE_DAMAGE,
		Math.random() * MAX_MOVEMENT_SPEED,
		Math.random() * MAX_ADDITIONAL_MAIN_STAT + BASE_MAIN_STAT,
		data.iconFrame,
		data.description,
		data.name,
		itemType
	);
};