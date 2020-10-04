import Enemy from "./Enemy";

export default class Melee extends Enemy {
    constructor(
      animationBase: string,
      health: number = 100,
      damage: number = 10,
      movementSpeed: number = 100
    ) {
      super(animationBase, health, damage, movementSpeed);
    }
}