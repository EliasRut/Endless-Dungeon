import { AbilityType } from '../scripts/abilities/abilityData';

export interface EnchantmentData {
	name: string;
	description: string;
}

export enum EnchantmentType {
	NONE = 'none',
	LESSER_WOLF = 'lesserWolf',
}

export const Enchantment: Record<EnchantmentType, EnchantmentData> = {
	[EnchantmentType.NONE]: {
		name: 'No enchantment',
		description: 'Not enchanted. As plain as it comes.',
	},
	[EnchantmentType.LESSER_WOLF]: {
		name: 'Lesser Enchantment of the Wolf',
		description: 'Enchanted with a small bonus to health.',
	},
};
