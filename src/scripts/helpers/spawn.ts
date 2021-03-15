import MeleeEnemyToken from '../drawables/tokens/MeleeEnemyToken';
import ZombieToken from '../drawables/tokens/ZombieToken';
import RangedEnemyToken from '../drawables/tokens/RangedEnemyToken';
import MainScene from '../scenes/MainScene';
import NpcToken from '../drawables/tokens/NpcToken';

export const spawnNpc = (
		scene: MainScene,
		type: string,
		id: string,
		posX: number,
		posY: number
	) => {
	switch(type) {
		case 'red-link': {
			return new MeleeEnemyToken(scene, posX, posY, type, id);
		}
		case 'red-ball': {
			return new RangedEnemyToken(scene, posX, posY, type, id);
		}
		case 'naked-guy': {
			return new NpcToken(scene, posX, posY, 'naked-guy', id);
		}
		case 'enemy_Zombie': {
			return new ZombieToken(scene, posX, posY, type, id);
		}
		default: {
			throw new Error(`Map called for unknown enemy "${type}".`);
		}
	}
};