import { ColorsOfMagic } from '../helpers/constants';
import { PrimaryContentDungeonLevelBaseData } from '../models/PrimaryContentBlock';

export default interface RoomAssignment extends PrimaryContentDungeonLevelBaseData {
	dynamicLighting: boolean;
	style?: ColorsOfMagic;
	numberOfRooms?: number;
	enemyBudget?: number;
}