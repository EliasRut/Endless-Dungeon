import { Facings, Faction } from "./constants";

export interface Character {
  animationBase: string;
  maxHealth: number;
  health: number;
  damage: number;
  level: number;
  luck: number;
  movementSpeed: number;
  slowFactor: number;
  attackTime: number;
  stunDuration: number;
  stunnedAt: number;
  stunned: boolean;
  dashing: boolean;

  currentFacing: Facings;
  isWalking: boolean;

  x: number;
  y: number;
  vision: number;

  faction: Faction;
  id: string;
}

export const createNewCharacter: (
  id: string,
  animationBase: string,
  maxHealth: number,
  damage: number,
  movementSpeed: number
) => Character = (
  id: string,
  animationBase: string,
  maxHealth: number,
  damage: number,
  movementSpeed: number
) => {
  return {
    ...DefaultCharacterData,
    id,
    animationBase,
    maxHealth,
    health: maxHealth,
    damage,
    movementSpeed,
  };
};

export const updateStatus = (globalTime: number, character: Character) => {
  if (character.stunned) {
    if (globalTime > character.stunnedAt + character.stunDuration) {
      character.stunned = false;
    }
  }
};

export const DefaultCharacterData: Character = {
  animationBase: "",
  maxHealth: 100,
  health: 100,
  damage: 1,
  level: 1,
  luck: 1,
  movementSpeed: 30,
  slowFactor: 1,
  attackTime: 0,
  stunDuration: 0,
  stunnedAt: 0,
  stunned: false,
  dashing: false,
  currentFacing: Facings.SOUTH,
  isWalking: false,
  x: 0,
  y: 0,
  vision: 0,
  faction: Faction.PLAYER,
  id: "",
};
