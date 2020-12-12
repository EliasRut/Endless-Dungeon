import MeleeEnemyToken from '../drawables/tokens/MeleeEnemyToken';
import RangedEnemyToken from '../drawables/tokens/RangedEnemyToken';
import MainScene from '../scenes/MainScene';

export const spawnNpc = (scene: MainScene, type: string, posX: number, posY: number) => {
	switch(type) {
		case 'red-link': {
			return new MeleeEnemyToken(scene, posX, posY, type);
		}
		case 'red-ball': {
			return new RangedEnemyToken(scene, posX, posY, type);
		}
		default: {
			throw new Error(`Map called for unknown enemy "${type}".`);
		}
	}
};