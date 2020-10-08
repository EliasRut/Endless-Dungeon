import AbilityEffect from '../objects/abilityEffect';
import FireBallEffect from '../objects/fireBallEffect';
import IceSpikeEffect from '../objects/iceSpikeEffect';
import DustNovaEffect from '../objects/dustNovaEffect';

interface ProjectileData {
  spread?: [number, number];
  velocity: number;
  drag?: number;
  xOffset: number;
  yOffset: number;
  effect: typeof AbilityEffect;
  collisionSound?: string;
  sfxVolume?: number;
  delay?: number;
}

interface AbilityData {
  projectiles?: number;
  projectileData?: ProjectileData;
  sound?: string;
  sfxVolume?: number;
  cooldownMs?: number;
};

export const enum AbilityType {
  FIREBALL = 'fireball',
  ICESPIKE = 'icespike',
  DUSTNOVA = 'dustnova'
}

export const Abilities: {[type: string]: AbilityData} = {
  [AbilityType.FIREBALL]: {
    projectiles: 1,
    projectileData: {
      velocity: 300,
      xOffset: 32,
      yOffset: 32,
      effect: FireBallEffect,
      collisionSound: 'sound-fireball-explosion',
      sfxVolume: 0.4,
    },
    sound: 'sound-fireball',
    sfxVolume: 0.2,
    cooldownMs: 400
  },
  [AbilityType.ICESPIKE]: {
    projectiles: 1,
    projectileData: {
      velocity: 400,
      xOffset: 16,
      yOffset: 16,
      effect: IceSpikeEffect,
      collisionSound: 'sound-icespike-hit',
      sfxVolume: 0.2
    },
    sound: 'sound-icespike',
    sfxVolume: 0.3,
    cooldownMs: 1200
  },
  [AbilityType.DUSTNOVA]: {
    projectiles: 32,
    projectileData: {
      spread: [-1, 1],
      velocity: 150,
      drag: 200,
      xOffset: 20,
      yOffset: 20,
      effect: DustNovaEffect,
      // collisionSound: 'sound-wind',
      // sfxVolume: 0.4
    },
    sound: 'sound-wind',
    sfxVolume: 1.4,
    cooldownMs: 1200
  }
}