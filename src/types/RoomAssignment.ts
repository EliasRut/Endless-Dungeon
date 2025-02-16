import { ColorsOfMagic } from '../game/phaser/helpers/constants';
import { PrimaryContentDungeonLevelBaseData } from './PrimaryContentBlock';

export default interface RoomAssignment extends PrimaryContentDungeonLevelBaseData {
	dynamicLighting: boolean;
	style?: ColorsOfMagic;
	numberOfRooms?: number;
	enemyBudget?: number;
}
