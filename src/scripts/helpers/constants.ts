import { AbilityType } from "../abilities/abilityData";

export const enum Facings {
  SOUTH,
  SOUTH_EAST,
  EAST,
  NORTH_EAST,
  NORTH,
  NORTH_WEST,
  WEST,
  SOUTH_WEST
};

export const spriteDirectionList = [
  's',
  'se',
  'e',
  'ne',
  'n',
  'nw',
  'w',
  'sw'
];

export const facingToSpriteNameMap = {
  [Facings.SOUTH]: 's',
  [Facings.SOUTH_EAST]: 'se',
  [Facings.EAST]: 'e',
  [Facings.NORTH_EAST]: 'ne',
  [Facings.NORTH]: 'n',
  [Facings.NORTH_WEST]: 'nw',
  [Facings.WEST]: 'w',
  [Facings.SOUTH_WEST]: 'sw',
};

export const ANIMATION_IDLE = 'idle';
export const ANIMATION_WALK = 'walk';

export const enum Faction {
  PLAYER,
  NPCS,
  ENEMIES
};

export const enum AbilityKey {
  ONE = 0,
  TWO = 1,
  THREE = 2,
  FOUR = 3
};

export const AbilityKeyMapping = {
  [AbilityKey.ONE]: AbilityType.FIREBALL,
  [AbilityKey.TWO]: AbilityType.ICESPIKE,
  [AbilityKey.THREE]: AbilityType.DUSTNOVA,
};