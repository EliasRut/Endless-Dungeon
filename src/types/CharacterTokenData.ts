import { NpcScript } from '../../typings/custom';
import { Faction } from '../game/phaser/helpers/constants';

export interface CharacterTokenData {
	id: string;
	type: string;
	script?: NpcScript;
	faction?: Faction;
	isBeingMoved?: boolean;
	lastMovedTimestamp: number;
	lastNecroticEffectTimestamp: number;
	necroticEffectStacks: number;
	hitAt: number;
	lastIceEffectTimestamp: number;
	iceEffectStacks: number;
	tokenName: string;
	charmedTime: number;
	healedTime: number;
	isSpawning: boolean;
}

export const DefaultCharacterTokenData: CharacterTokenData = {
	id: '',
	type: '',
	lastMovedTimestamp: Number.MIN_SAFE_INTEGER,
	lastNecroticEffectTimestamp: Number.MIN_SAFE_INTEGER,
	necroticEffectStacks: 0,
	hitAt: Number.MIN_SAFE_INTEGER,
	lastIceEffectTimestamp: Number.MIN_SAFE_INTEGER,
	iceEffectStacks: 0,
	tokenName: '',
	charmedTime: Number.MIN_SAFE_INTEGER,
	healedTime: Number.MIN_SAFE_INTEGER,
	isSpawning: false,
};
