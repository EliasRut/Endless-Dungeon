import { ColorsOfMagic } from '../scripts/helpers/constants';
import { PrimaryContentDungeonLevelBaseData } from './PrimaryContentBlock';

export default interface RoomAssignment extends PrimaryContentDungeonLevelBaseData {
	dynamicLighting: boolean;
	style?: ColorsOfMagic;
	numberOfRooms?: number;
	enemyBudget?: number;
}
