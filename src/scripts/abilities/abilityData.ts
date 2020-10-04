import AbilityEffect from '../objects/abilityEffect';
import FireBallEffect from '../objects/fireBallEffect';
import IceSpikeEffect from '../objects/iceSpikeEffect';
interface ProjectileData {
  spread?: [number, number];
  velocity: number;
  xOffset: number;
  yOffset: number;
  effect: typeof AbilityEffect;
  collisionSound?: string;
  sfxVolume?: number;
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
  ICESPIKE = 'icespike'
}

export const Abilities: {[type: string]: AbilityData} = {
  [AbilityType.FIREBALL]: {
    projectiles: 1,
    projectileData: {
      velocity: 300,
      xOffset: 16,
      yOffset: 16,
      effect: FireBallEffect,
      collisionSound: 'sound-fireball-explosion',
      sfxVolume: 0.4
    },
    sound: 'sound-fireball',
    sfxVolume: 0.2,
    cooldownMs: 400
  },
  [AbilityType.ICESPIKE]: {
    projectiles: 1,
    projectileData: {
      velocity: 300,
      xOffset: 16,
      yOffset: 16,
      effect: IceSpikeEffect,
      collisionSound: 'sound-icespike-hit',
      sfxVolume: 0.2
    },
    sound: 'sound-icespike',
    sfxVolume: 0.3,
    cooldownMs: 1200
  }
}