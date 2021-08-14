import MeleeEnemyToken from '../drawables/tokens/MeleeEnemyToken';
import ZombieToken from '../drawables/tokens/ZombieToken';
import RangedEnemyToken from '../drawables/tokens/RangedEnemyToken';
import MainScene from '../scenes/MainScene';
import NpcToken from '../drawables/tokens/NpcToken';
import { NpcOptions } from '../../../typings/custom';
import RedlingBossToken from '../drawables/tokens/RedlingBoss';
import LichKingToken from '../drawables/tokens/LichKing';

export const spawnNpc = (
		scene: MainScene,
		type: string,
		id: string,
		posX: number,
		posY: number,
		level: number,
		options?: NpcOptions
	) => {
	switch(type) {
		case 'red-link': {
			return new MeleeEnemyToken(scene, posX, posY, type, id);
		}
		case 'red-ball': {
			return new RangedEnemyToken(scene, posX, posY, type, id);
		}
		case 'enemy-zombie': {
			return new ZombieToken(scene, posX, posY, type, level, id);
		}
		case 'redling-boss': {
			return new RedlingBossToken(scene, posX, posY, type, level, id);
		}
		case 'lich-king': {
			return new LichKingToken(scene, posX, posY, type, level, id);
		}
		default: {
			return new NpcToken(scene, posX, posY, type, id, options);
		}
	}
};