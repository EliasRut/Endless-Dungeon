import MainScene from '../scenes/MainScene';
import NpcToken from '../drawables/tokens/NpcToken';
import { NpcOptions } from '../../../typings/custom';
import LichKingToken from '../drawables/tokens/LichKing';
import VampireToken from '../drawables/tokens/VampireEnemyToken';
import FireElementalToken from '../drawables/tokens/FireElementalToken';
import IceElementalToken from '../drawables/tokens/IceElementalToken';
import ArcaneElementalToken from '../drawables/tokens/ArcaneElementalToken';
import NecroticElementalToken from '../drawables/tokens/NecroticElementalToken';
import EnemyToken from '../drawables/tokens/EnemyToken';
import { EnemyCategory, MeleeAttackType } from '../enemies/enemyData';
import { ColorsOfMagic, SCALE } from './constants';
import { AbilityType } from '../abilities/abilityData';

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
		case 'rich': {
			return new EnemyToken(scene, posX, posY, type, id, {
				startingHealth: 4 * (1 + level * 0.5),
				damage: 3 * (1 + level * 0.5),
				movementSpeed: 80,
				itemDropChance: 0,
				healthPotionDropChance: 0.05,
				category: EnemyCategory.NORMAL,
				color: ColorsOfMagic.DEATH,
				isMeleeEnemy: true,
				isRangedEnemy: false,
				meleeAttackData: {
					attackDamageDelay: 450,
					attackType: MeleeAttackType.HIT,
					attackRange: 32 * SCALE,
					animationName: 'attack',
				},
			});
		}
		case 'jacques': {
			return new VampireToken(scene, posX, posY, type, level, id);
		}
		// case 'pierre': {
		// 	return new PierreToken(scene, posX, posY, type, level, id);
		// }
		case 'pierre': {
			return new EnemyToken(scene, posX, posY, type, id, {
				startingHealth: 4 * (1 + level * 0.5),
				damage: 3 * (1 + level * 0.5),
				movementSpeed: 80,
				itemDropChance: 0,
				healthPotionDropChance: 0.05,
				category: EnemyCategory.NORMAL,
				color: ColorsOfMagic.BLOOD,
				isMeleeEnemy: false,
				isRangedEnemy: true,
				rangedAttackData: {
					castTime: 1000,
					castRange: 75 * SCALE,
					animationName: 'throw',
					firedShot: false,
					abilityType: AbilityType.BAT,
				},
			});
		}
		case 'lich-king': {
			return new LichKingToken(scene, posX, posY, 'rich', level, id);
		}
		case 'fire_elemental': {
			return new FireElementalToken(scene, posX, posY, level, id);
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
