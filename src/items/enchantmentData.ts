import worldstate from '../scripts/worldState';
import { colorOfMagicToTilesetMap, ColorsOfMagic } from '../scripts/helpers/constants';

export interface EnchantmentData {
	name: string;
	description: string;
	affectedStat?: {
		stat: keyof typeof worldstate.playerCharacter.enchantmentModifiers;
		value: number;
	};
	cost?: Array<{ essence: ColorsOfMagic; amount: number }>;
}

enum EnchantmentType {
	WOLF = 'Wolf',
	CAT = 'Cat',
	RABBIT = 'Rabbit',
	BEAR = 'Bear',
}

enum EnchantmentStrength {
	LESSER = 'Lesser',
	SPLENDID = 'Splendid',
	GREATER = 'Greater',
	MIGHTY = 'Mighty',
}

const strengthToAdj = {
	Lesser: ' small ',
	Splendid: '',
	Greater: ' large ',
	Mighty: 'n enormous ',
};

const strengthToMult = {
	Lesser: 1,
	Splendid: 2,
	Greater: 3,
	Mighty: 4,
};

export type EnchantmentName = `${EnchantmentStrength}${EnchantmentType}` | 'None';

export const Enchantment: Partial<Record<EnchantmentName, EnchantmentData>> = {
	None: {
		name: 'No enchantment',
		description: 'Not enchanted. As plain as it comes.',
	},
	...Object.values(EnchantmentStrength).reduce((obj, strength, index) => {
		obj[`${strength}Cat`] = {
			name: `${strength} Enchantment of the Cat`,
			description: `Enchanted with a${strengthToAdj[strength]}bonus to movement speed.`,
			affectedStat: { stat: 'movementSpeed', value: 25 * strengthToMult[strength] },
			cost: [{ essence: ColorsOfMagic.DEATH, amount: 1 * strengthToMult[strength] }],
		};
		return obj;
	}, {} as Partial<Record<EnchantmentName, EnchantmentData>>),
	...Object.values(EnchantmentStrength).reduce((obj, strength, index) => {
		obj[`${strength}Wolf`] = {
			name: `${strength} Enchantment of the Wolf`,
			description: `Enchanted with a${strengthToAdj[strength]}bonus to damage.`,
			affectedStat: { stat: 'damage', value: 0.25 * strengthToMult[strength] },
			cost: [
				{ essence: ColorsOfMagic.WILD, amount: 1 * strengthToMult[strength] },
				{ essence: ColorsOfMagic.DEATH, amount: 1 * strengthToMult[strength] },
			],
		};
		return obj;
	}, {} as Partial<Record<EnchantmentName, EnchantmentData>>),
	...Object.values(EnchantmentStrength).reduce((obj, strength, index) => {
		obj[`${strength}Rabbit`] = {
			name: `${strength} Enchantment of the Rabbit`,
			description: `Enchanted with a${strengthToAdj[strength]}bonus to luck.`,
			affectedStat: { stat: 'luck', value: 0.25 * strengthToMult[strength] },
			cost: [{ essence: ColorsOfMagic.WILD, amount: 1 * strengthToMult[strength] }],
		};
		return obj;
	}, {} as Partial<Record<EnchantmentName, EnchantmentData>>),
	...Object.values(EnchantmentStrength).reduce((obj, strength, index) => {
		obj[`${strength}Bear`] = {
			name: `${strength} Enchantment of the Bear`,
			description: `Enchanted with a${strengthToAdj[strength]}bonus to health.`,
			affectedStat: { stat: 'maxHealth', value: 50 * strengthToMult[strength] },
			cost: [
				{ essence: ColorsOfMagic.WILD, amount: 1 * strengthToMult[strength] },
				{ essence: ColorsOfMagic.DEATH, amount: 1 * strengthToMult[strength] },
			],
		};
		return obj;
	}, {} as Partial<Record<EnchantmentName, EnchantmentData>>),
};
