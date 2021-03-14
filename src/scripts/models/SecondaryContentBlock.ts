import { ColorsOfMagic } from '../helpers/constants';

export interface SecondaryContentBlock {
	title: string;
	description?: string;
	themes: ColorsOfMagic[];
	rooms: string[][];
}
