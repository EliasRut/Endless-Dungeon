import MeleeEnemyToken from '../drawables/tokens/MeleeEnemyToken';
import ZombieToken from '../drawables/tokens/ZombieToken';
import RangedEnemyToken from '../drawables/tokens/RangedEnemyToken';
import MainScene from '../scenes/MainScene';
import NpcToken from '../drawables/tokens/NpcToken';
import { NpcOptions } from '../../../typings/custom';
import RedlingBossToken from '../drawables/tokens/RedlingBoss';
import LichKingToken from '../drawables/tokens/LichKing';
import VampireToken from '../drawables/tokens/VampireEnemyToken';
import PierreToken from '../drawables/tokens/PierreEnemyToken';
import ElementalToken from '../drawables/tokens/ElementalToken';
import FireElementalToken from '../drawables/tokens/FireElementalToken';
import IceElementalToken from '../drawables/tokens/IceElementalToken';
import ArcaneElementalToken from '../drawables/tokens/ArcaneElementalToken';
import NecroticElementalToken from '../drawables/tokens/NecroticElementalToken';

export const spawnNpc = (
	scene: MainScene,
	type: string,
	id: string,
	posX: number,
	posY: number,
	level: number,
	options?: NpcOptions
) => {
	switch (type) {
		case 'red-link': {
			return new MeleeEnemyToken(scene, posX, posY, 'rich', id);
		}
		case 'red-ball': {
			return new RangedEnemyToken(scene, posX, posY, type, id);
		}
		case 'rich': {
			return new ZombieToken(scene, posX, posY, type, level, id);
		}
		case 'jacques': {
			return new VampireToken(scene, posX, posY, type, level, id);
		}
		case 'pierre': {
			return new PierreToken(scene, posX, posY, type, level, id);
		}
		case 'redling-boss': {
			return new RedlingBossToken(scene, posX, posY, type, level, id);
		}
		case 'lich-king': {
			return new LichKingToken(scene, posX, posY, 'rich', level, id);
		}
		case 'fire_elemental': {
			return new FireElementalToken(scene, posX, posY, 'rich', level, id);
		}
		case 'ice_elemental': {
			return new IceElementalToken(scene, posX, posY, 'rich', level, id);
		}
		case 'arcane_elemental': {
			return new ArcaneElementalToken(scene, posX, posY, 'rich', level, id);
		}
		case 'necrotic_elemental': {
			return new NecroticElementalToken(scene, posX, posY, 'rich', level, id);
		}
		default: {
			return new NpcToken(scene, posX, posY, type, id, options);
		}
	}
};
