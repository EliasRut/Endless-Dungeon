import { Facings, Faction } from "../helpers/constants";
import Character from "./Character";
// This class handles the players character and all mechanical events associated with it.
export default class Enemy extends Character {
    public vision = 350;

    constructor(
      animationBase: string,
      health: number = 100,
      damage: number = 10,
      movementSpeed: number = 100
    ) {
      super(animationBase, health, damage, movementSpeed);

      this.faction = Faction.ENEMIES;
    }
  };