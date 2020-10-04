import { AbilityType } from "../abilities/abilityData";
import { getFacing } from "../helpers/orientation";
import MainScene from "../scenes/mainScene";
import globalState from "../worldstate";
import EnemyToken from "./enemyToken";

export default class MeleeEnemyToken extends EnemyToken {

  constructor(scene: MainScene, x: number, y: number, tokenName: string) {
    super(scene,x,y,tokenName);

        this.proximity = 100;
  }

  public update(time: number,) {
        super.update(time);

        const player = globalState.playerCharacter;

        const px = player.x;
        const py = player.y;
        const distance = this.getDistance(player);

        const totalDistance = Math.abs(px - this.x) + Math.abs(py - this.y);
        const xSpeed = (px - this.x) / totalDistance * this.stateObject.movementSpeed;
        const ySpeed = (py - this.y) / totalDistance * this.stateObject.movementSpeed;          
        const newFacing = getFacing(xSpeed, ySpeed);
        const animation = this.stateObject.updateMovingState(true, newFacing);

        if (animation) {
            this.play(animation);
        }

        this.stateObject.currentFacing = newFacing;

        if (this.proximity < distance
            && distance < this.stateObject.vision
            && this.attackedAt + 100 < time) {
                this.setVelocityX(xSpeed);
                this.setVelocityY(ySpeed);
        } else {
            this.setVelocityX(0);
            this.setVelocityY(0);
            const animation = 
                this.stateObject.updateMovingState(false, this.stateObject.currentFacing);

            if (animation) {
                this.play(animation);
            }
        }

        if(distance < this.proximity) {
        this.attack(time);
        }

        this.stateObject.x = this.body.x;
        this.stateObject.y = this.body.y;
    }

    attack(time) {
    const player = globalState.playerCharacter;

        console.log("range attacker");
        if (this.attackedAt + 5000 < time) {
          this.setVelocityX(0);
          this.setVelocityY(0);
          this.attackedAt = time;
          this.scene.triggerAbility(this.stateObject, AbilityType.FIREBALL);
        }
    }
}