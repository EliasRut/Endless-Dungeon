import { EnemyData } from '../game/phaser/enemies/enemyData';
import { ColorsOfMagic } from '../game/phaser/helpers/constants';
import Character from './Character';
import { CharacterTokenData, DefaultCharacterTokenData } from './CharacterTokenData';

export interface EnemyTokenData extends CharacterTokenData {
	tokenName: string;
	attackRange: number;
	spawnedAt: number | undefined;
	attackedAt: number;
	lastUpdate: number;
	aggroLinger: number;
	aggro: boolean;
	target: [number, number] | undefined;
	nextWaypoint: [number, number][] | undefined;
	color: ColorsOfMagic | undefined;
	targetStateObject: Character | undefined;
	lastTileX?: number;
	lastTileY?: number;
	enemyData?: EnemyData;
	dead: boolean;
	isCharging: boolean;
	isCasting: boolean;
	chargeX: number | undefined;
	chargeY: number | undefined;

	isWaitingToAttack: boolean;
	isWaitingToDealDamage: boolean;
}

export const DefaultEnemyTokenData: EnemyTokenData = {
	...DefaultCharacterTokenData,
	tokenName: '',
	attackRange: 0,
	spawnedAt: undefined,
	attackedAt: Number.MIN_SAFE_INTEGER,
	lastUpdate: Number.MIN_SAFE_INTEGER,
	aggroLinger: 3000,
	aggro: false,
	target: undefined,
	nextWaypoint: undefined,
	color: undefined,
	targetStateObject: undefined,
	lastTileX: undefined,
	lastTileY: undefined,
	enemyData: undefined,
	dead: false,
	isCharging: false,
	isCasting: false,
	chargeX: undefined,
	chargeY: undefined,

	isWaitingToAttack: false,
	isWaitingToDealDamage: false,
};
