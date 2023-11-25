import { ColorsOfMagic } from '../helpers/constants';

export interface PrimaryContentDungeonLevelBaseData {
	title: string;
	rooms: string[];
	width: number;
	height: number;
}

export interface PrimaryContentDungeonLevelData extends PrimaryContentDungeonLevelBaseData {
	style: ColorsOfMagic;
	numberOfRooms: number;
	enemyBudget: number;
}

export interface PrimaryContentBlock {
	title: string;
	description?: string;
	dungeonLevels: PrimaryContentDungeonLevelData[];
	themes: ColorsOfMagic[];
	lowerBoundOfSecondaryContentBlocks: number;
	upperBoundOfSecondaryContentBlocks: number;
	requiredQuests: [string, 'open' | 'started' | 'not-finished' | 'finished'][];
}
