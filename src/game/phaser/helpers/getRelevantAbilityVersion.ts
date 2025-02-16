import { AbilityType } from '../../../types/AbilityType';
import worldState from '../worldState';
import { Abilities } from './abilities';

/**
 * Returns the relevant ability version based on the ability type, level, and combo cast number.
 * @param abilityType
 * @param abilityLevel
 * @param comboCast
 */
export const getRelevantAbilityVersion = (
	abilityType: AbilityType,
	abilityLevel: number,
	comboCast: number
) => {
	const options = worldState.abilityData[abilityType] || [{ data: Abilities[abilityType] }];
	return options.find((option) => {
		return (
			!option.conditions ||
			Object.entries(option.conditions).every(([condition, conditionValue]) => {
				switch (condition) {
					case 'minimumLevel':
						return abilityLevel >= (conditionValue as number);
					case 'maximumLevel':
						return abilityLevel <= (conditionValue as number);
					case 'comboCastNumber':
						return comboCast === conditionValue;
					default:
						return true;
				}
			})
		);
	})!.data;
};
