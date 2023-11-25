import { EnemyData } from "./EnemyData";
import { ColorsOfMagic } from "./ColorsOfMagic";
export const enum Facings {
  SOUTH,
  SOUTH_EAST,
  EAST,
  NORTH_EAST,
  NORTH,
  NORTH_WEST,
  WEST,
  SOUTH_WEST,
}

export const enum Faction {
  PLAYER,
  NPCS,
  ENEMIES,
  ALLIES,
}

export const enum AbilityKey {
  ONE = 0,
  TWO = 1,
  THREE = 2,
  FOUR = 3,
  FIVE = 4,
  SPACE = 5,
}

export const NUM_DIRECTIONS = 8;

export const enum EquipmentSlot {
  SOURCE = "source",
  CATALYST = "catalyst",
  CHESTPIECE = "chestpiece",
  AMULET = "amulet",
  RIGHT_RING = "rightRing",
  LEFT_RING = "leftRing",
}

export interface RuneAssignment {
  primaryContent: ColorsOfMagic;
  secondaryContent: ColorsOfMagic;
  wanderingMonsters: ColorsOfMagic;
  playerBuff: ColorsOfMagic;
  randomNpc: ColorsOfMagic;
}

export const enum FacingRange {
  ALL_DIRECTIONS = 1,
  ONLY_NESW = 2,
}

export const NpcTypeList = ["rich", "jacques", "pierre"];
export const SummonsTypeList = ["firesprite"];

export const EnemyByColorOfMagicMap: {
  [color: string]: [number, string, Partial<EnemyData>?][];
} = {
  [ColorsOfMagic.FLUX]: [
    [0.5, "rich"],
    [0.85, "jacques"],
    [1, "pierre"],
  ],
  [ColorsOfMagic.METAL]: [
    [0.5, "rich"],
    [0.85, "jacques"],
    [1, "pierre"],
  ],
  [ColorsOfMagic.CHANGE]: [
    [0.5, "rich"],
    [0.85, "jacques"],
    [1, "pierre"],
  ],
  [ColorsOfMagic.BLOOD]: [
    [0.5, "rich"],
    [0.85, "jacques"],
    [1, "pierre"],
  ],
  [ColorsOfMagic.DEATH]: [
    [0.25, "rich", { useSpawnAnimation: false }],
    [0.5, "rich", { useSpawnAnimation: true, spawnOnVisible: true }],
    [0.85, "jacques"],
    [1, "pierre"],
  ],
  [ColorsOfMagic.PASSION]: [
    [0.5, "rich"],
    [0.85, "jacques"],
    [1, "pierre"],
  ],
  [ColorsOfMagic.WILD]: [
    [0.5, "rich"],
    [0.85, "jacques"],
    [1, "pierre"],
  ],
  [ColorsOfMagic.ROYAL]: [
    [0.5, "rich"],
    [0.85, "jacques"],
    [1, "pierre"],
  ],
};

export const enemyBudgetCost = {
  rich: 1,
  jacques: 1,
  pierre: 1,
  "redling-boss": 10,
};

export const enum DOOR_TYPE {
  IRON_DOOR = "iron_door",
}

export enum SUMMONING_TYPE {
  FIRE_ELEMENTAL = "fire_elemental",
  ICE_ELEMENTAL = "ice_elemental",
  ARCANE_ELEMENTAL = "arcane_elemental",
  NECROTIC_ELEMENTAL = "necrotic_elemental",
}
