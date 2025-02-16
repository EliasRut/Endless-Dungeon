import { ColorsOfMagic } from '../game/phaser/helpers/constants';

export interface SecondaryContentBlock {
	title: string;
	description?: string;
	themes: ColorsOfMagic[];
	rooms: string[][];
}
