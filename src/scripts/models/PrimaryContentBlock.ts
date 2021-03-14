import { ColorsOfMagic } from '../helpers/constants';

export interface PrimaryContentDungeonLevelData {
	title: string;
	style: ColorsOfMagic;
	rooms: string[];
}

export interface PrimaryContentBlock {
	title: string;
	description?: string;
	dungeonLevels: PrimaryContentDungeonLevelData[];
	themes: ColorsOfMagic[];
	lowerBoundOfSecondaryContentBlocks: number;
	upperBoundOfSecondaryContentBlocks: number;
}