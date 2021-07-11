import { ColorsOfMagic } from '../helpers/constants';
import { PrimaryContentBlock } from './PrimaryContentBlock';
import { SecondaryContentBlock } from './SecondaryContentBlock';

export interface DungeonLevelData {
	title: string;
	style: ColorsOfMagic;
	rooms: string[];
	width: number;
	height: number;
	numberOfRooms: number;
	enemyBudget: number;
}

export interface DungeonRunData {
	levels: DungeonLevelData[];
	buff: ColorsOfMagic;
	primaryContentBlock: PrimaryContentBlock;
	secondaryContentBlocks: SecondaryContentBlock[];
}