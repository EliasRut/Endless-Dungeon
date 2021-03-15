import { ColorsOfMagic } from '../helpers/constants';

export interface DungeonLevelData {
	title: string;
	style: ColorsOfMagic;
	rooms: string[];
}

export interface DungeonRunData {
	levels: DungeonLevelData[];
	buff: ColorsOfMagic;
};