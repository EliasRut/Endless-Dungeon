export const enum AbilityType {
	NOTHING = 'nothing',
	FIREBALL = 'fireball',
	ARCANE_BOLT = 'arcaneBolt',
	HAIL_OF_DEATH = 'hailOfDeath',
	HAIL_OF_BOLTS = 'hailOfBolts',
	HAIL_OF_FLAMES = 'hailOfFlames',
	HAIL_OF_ICE = 'hailOfIce',
	ICESPIKE = 'icespike',
	ARCANE_BLADE = 'arcaneBlade',
	FIRE_CONE = 'fireCone',
	FIRE_NOVA = 'fireNova',
	ARCANE_CONE = 'arcaneCone',
	ARCANE_NOVA = 'arcaneNova',
	ICE_CONE = 'iceCone',
	ICE_NOVA = 'iceNova',
	NECROTIC_BOLT = 'necroticBolt',
	NECROTIC_CONE = 'necroticCone',
	NECROTIC_NOVA = 'necroticNova',
	EXPLODING_CORPSE = 'explodingCorpse',
	BAT = 'bat',
	CONDEMN = 'Condemn',
	BLOOD_DRIN = 'BloodDrain',
	BLOOD_DRAIN_PROJECTILE = 'BloodDrainProjectile',
	FIRE_SUMMON_CIRCELING = 'fireSummonCirceling',
	FIRE_SUMMON_ELEMENTAL = 'fireSummonElemental',
	ICE_SUMMON_CIRCELING = 'iceSummonCirceling',
	ICE_SUMMON_ELEMENTAL = 'iceSummonElemental',
	ARCANE_SUMMON_CIRCELING = 'arcaneSummonCirceling',
	ARCANE_SUMMON_ELEMENTAL = 'arcaneSummonElemental',
	NECROTIC_SUMMON_CIRCELING = 'necroticSummonCirceling',
	NECROTIC_SUMMON_ELEMENTAL = 'necroticSummonElemental',
	TELEPORT = 'teleport',
	CHARM = 'charm',
}

export type SpreadData = [number, number, ((factor: number) => number)?];

export type MinMaxParticleEffectValue = undefined | number | { min: number; max: number };
export type SimpleParticleEffectValue = MinMaxParticleEffectValue | { start: number; end: number };
export type ColorEffectValue =
	| undefined
	| number
	| {
			redMin: number;
			greenMin: number;
			blueMin: number;
			redDiff: number;
			greenDiff: number;
			blueDiff: number;
	  };

export type AbilityVersionConditionKey = 'minimumLevel' | 'maximumLevel' | 'comboCastNumber';
export type AbilityVersionCondition = [AbilityVersionConditionKey, number];
export type AbilityVersionConditionList = AbilityVersionCondition[];
