import globalState from '../../worldstate/index';
import { BLOCK_SIZE, TILE_WIDTH, TILE_HEIGHT } from '../../helpers/generateDungeon';
import MainScene from '../../scenes/MainScene';
import { UiDepths } from '../../helpers/constants';

export interface Icons extends Phaser.GameObjects.GameObject {
	setScreenVisibility(visibile: boolean): void;
}