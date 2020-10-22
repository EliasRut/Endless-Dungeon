import { AbilityType } from "../abilities/abilityData";
import { getFacing } from "../helpers/orientation";
import MainScene from "../scenes/mainScene";
import globalState from "../worldstate";
import Enemy from "../worldstate/Enemy";
import EnemyToken from "./enemyToken";

export default class RangedEnemyToken extends EnemyToken {

  constructor(scene: MainScene, x: number, y: number, tokenName: string) {
    super(scene, x, y, tokenName);

    this.attackRange = 100; // how close the enemy comes.
  }

  public update(time: number,) {
    super.update(time);

    const player = globalState.playerCharacter;

    // check death
    if (this.stateObject.health <= 0){
      this.dropItem(player,this.scene);
      this.destroy();
      return;
    }

    const tx = this.target.x;
    const ty = this.target.y;
    const distance = this.getDistance(tx, ty);

    const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
    const xFactor = (tx - this.x) / totalDistance;
    const yFactor = (ty - this.y) / totalDistance;
    (this.stateObject as Enemy).exactTargetXFactor = xFactor;
    (this.stateObject as Enemy).exactTargetYFactor = yFactor;
    const xSpeed = xFactor * this.stateObject.movementSpeed;
    const ySpeed = yFactor * this.stateObject.movementSpeed;
    const newFacing = getFacing(xSpeed, ySpeed);

    if(this.aggro) {
      if (this.attackedAt + this.stateObject.attackTime < time
        && this.attackRange < distance) {

        this.setVelocityX(xSpeed);
        this.setVelocityY(ySpeed);
        const animation = this.stateObject.updateMovingState(true, newFacing);

        if (animation) {
          this.play(animation);
        }
      } else {
        this.setVelocityX(0);
        this.setVelocityY(0);
        const animation =
          this.stateObject.updateMovingState(false, this.stateObject.currentFacing);

        if (animation) {
          this.play(animation);
        }
        this.stateObject.currentFacing = newFacing;
      }

      if(distance <= this.attackRange && this.checkLoS()) {
        this.attack(time);
      }

      this.stateObject.x = this.body.x;
      this.stateObject.y = this.body.y;
    }
  }

  attack(time) {
    if (this.attackedAt + this.stateObject.attackTime < time) {
      this.setVelocityX(0);
      this.setVelocityY(0);
      this.attackedAt = time;
      this.scene.triggerAbility(this.stateObject, AbilityType.ICESPIKE);
    }
  }
}