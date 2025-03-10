// tslint:disable-next-line: max-line-length
import { AbilityType } from '../../../types/AbilityType';
import { AbilityDataMap } from '../../../types/AbilityData';
import { Fireball } from '../../../data/abilities/Fireball';
import { Bolt } from '../../../data/abilities/Bolt';
import { HailOfBolts } from '../../../data/abilities/HailOfBolts';
import { HailOfFlames } from '../../../data/abilities/HailOfFlames';
import { HailOfIce } from '../../../data/abilities/HailOfIce';
import { IceSpike } from '../../../data/abilities/IceSpike';
import { ArcaneBlade } from '../../../data/abilities/ArcaneBlade';
import { FireCone } from '../../../data/abilities/FireCone';
import { ArcaneCone } from '../../../data/abilities/ArcaneCone';
import { IceCone } from '../../../data/abilities/IceCone';
import { NecroticCone } from '../../../data/abilities/NecroticCone';
import { IceNova } from '../../../data/abilities/IceNova';
import { FireNova } from '../../../data/abilities/FireNova';
import { ExplodingCorpse } from '../../../data/abilities/ExplodingCorpse';
import { ArcaneNova } from '../../../data/abilities/ArcaneNova';
import { NecroticBolt } from '../../../data/abilities/NecroticBolt';
import { NecroticNova } from '../../../data/abilities/NecroticNova';
import { HailOfDeath } from '../../../data/abilities/HailOfDeath';
import { Bat } from '../../../data/abilities/Bat';
import { Condemn } from '../../../data/abilities/Condemn';
import { FireSummonCircling } from '../../../data/abilities/FireSummonCircling';
import { FireSummonElemental } from '../../../data/abilities/FireSummonElemental';
import { IceSummonCircling } from '../../../data/abilities/IceSummonCircling';
import { IceSummonElemental } from '../../../data/abilities/IceSummonElemental';
import { ArcaneSummonCircling } from '../../../data/abilities/ArcaneSummonCircling';
import { ArcaneSummonElemental } from '../../../data/abilities/ArcaneSummonElemental';
import { NecroticSummonCircling } from '../../../data/abilities/NecroticSummonCircling';
import { NecroticSummonElemental } from '../../../data/abilities/NecroticSummonElemental';
import { Teleport } from '../../../data/abilities/Teleport';
import { Charm } from '../../../data/abilities/Charm';
import { Nothing } from '../../../data/abilities/Nothing';
import { BloodDrain } from '../../../data/abilities/BloodDrain';

export const Abilities: AbilityDataMap = {
	[AbilityType.NOTHING]: Nothing,
	[AbilityType.FIREBALL]: Fireball,
	[AbilityType.ARCANE_BOLT]: Bolt,
	[AbilityType.HAIL_OF_BOLTS]: HailOfBolts,
	[AbilityType.HAIL_OF_FLAMES]: HailOfFlames,
	[AbilityType.HAIL_OF_ICE]: HailOfIce,
	[AbilityType.ICE_SPIKE]: IceSpike,
	[AbilityType.ARCANE_BLADE]: ArcaneBlade,
	[AbilityType.FIRE_CONE]: FireCone,
	[AbilityType.ARCANE_CONE]: ArcaneCone,
	[AbilityType.ICE_CONE]: IceCone,
	[AbilityType.NECROTIC_CONE]: NecroticCone,
	[AbilityType.ICE_NOVA]: IceNova,
	[AbilityType.FIRE_NOVA]: FireNova,
	[AbilityType.EXPLODING_CORPSE]: ExplodingCorpse,
	[AbilityType.ARCANE_NOVA]: ArcaneNova,
	[AbilityType.NECROTIC_BOLT]: NecroticBolt,
	[AbilityType.NECROTIC_NOVA]: NecroticNova,
	[AbilityType.HAIL_OF_DEATH]: HailOfDeath,
	[AbilityType.BAT]: Bat,
	[AbilityType.CONDEMN]: Condemn,
	[AbilityType.BLOOD_DRAIN]: BloodDrain,
	[AbilityType.FIRE_SUMMON_CIRCLING]: FireSummonCircling,
	[AbilityType.FIRE_SUMMON_ELEMENTAL]: FireSummonElemental,
	[AbilityType.ICE_SUMMON_CIRCLING]: IceSummonCircling,
	[AbilityType.ICE_SUMMON_ELEMENTAL]: IceSummonElemental,
	[AbilityType.ARCANE_SUMMON_CIRCLING]: ArcaneSummonCircling,
	[AbilityType.ARCANE_SUMMON_ELEMENTAL]: ArcaneSummonElemental,
	[AbilityType.NECROTIC_SUMMON_CIRCLING]: NecroticSummonCircling,
	[AbilityType.NECROTIC_SUMMON_ELEMENTAL]: NecroticSummonElemental,
	[AbilityType.TELEPORT]: Teleport,
	[AbilityType.CHARM]: Charm,
};
