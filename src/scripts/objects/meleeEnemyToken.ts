import { getFacing } from "../helpers/orientation";
import MainScene from "../scenes/mainScene";
import globalState from "../worldstate";
import EnemyToken from "./enemyToken";

export default class MeleeEnemyToken extends EnemyToken {

  constructor(scene: MainScene, x: number, y: number, tokenName: string) {
    super(scene,x,y,tokenName);

    // cool effects!
    const particles = scene.add.particles('fire');
    particles.setDepth(1);
    this.emitter = particles.createEmitter({
        alpha: { start: 0.3, end: 0.0 },
        scale: { start: 0.0, end: 2 },
        tint: 0x1c092d,// 0x008800, // 0x663300
        speed: 0,
        // accelerationY: -300,
        // angle: { min: -85, max: -95 },
        rotate: { min: -180, max: 180 },
        lifespan: { min: 1000, max: 1100 },
        blendMode: Phaser.BlendModes.DARKEN,
        frequency: 50,
        maxParticles: 200,
    });
    this.emitter.startFollow(this.body.gameObject);
    this.emitter.start();
    this.attackRange = 15; //how close the enemy comes
  }

  public update(time: number) {
        super.update(time);

        const player = globalState.playerCharacter;

        // check death
        if (this.stateObject.health <= 0){
            this.dropItem();
            this.destroy();
            return;
        }

        const tx = this.target.x;
        const ty = this.target.y;
        const distance = this.getDistance(tx, ty);

        // damages & slows you if you're close
        if (distance < 30) {
          player.slowFactor = 0.5;
          player.health -= 0.01;
        }
        else {
          player.slowFactor = 1;
        }

        // follows you only if you're close enough, then runs straight at you,
        // stop when close enough (proximity)
        if (this.aggro
          && this.attackedAt + this.stateObject.attackTime < time
          && this.attackRange < distance) {

          const totalDistance = Math.abs(tx - this.x) + Math.abs(ty - this.y);
          const xSpeed = (tx - this.x) / totalDistance * this.stateObject.movementSpeed;
          const ySpeed = (ty - this.y) / totalDistance * this.stateObject.movementSpeed;
          this.setVelocityX(xSpeed);
          this.setVelocityY(ySpeed);
          this.emitter.setSpeedX(xSpeed);
          this.emitter.setSpeedY(ySpeed);
          const newFacing = getFacing(xSpeed, ySpeed);
          const animation = this.stateObject.updateMovingState(true, newFacing);
          if (animation) {
            this.play(animation);
          }
        }
        else {
          this.setVelocityX(0);
          this.setVelocityY(0);
          this.emitter.setSpeedX(0);
          this.emitter.setSpeedY(0);
          const animation =
            this.stateObject.updateMovingState(false, this.stateObject.currentFacing);
          if (animation) {
            this.play(animation);
          }
        }
    if(distance <= this.attackRange) {
      this.attack(time);
    }
    this.stateObject.x = this.body.x;
    this.stateObject.y = this.body.y;
  }

  destroy() {
    this.emitter.stopFollow();
    this.emitter.stop();

    super.destroy();
  }

  attack(time: number) {
    const player = globalState.playerCharacter;

    if (this.attackedAt + this.stateObject.attackTime < time) {
        this.setVelocityX(0);
        this.setVelocityY(0);
        this.attackedAt = time;
        player.health -= 5;
        console.log("player health=", player.health);
    }
  }
}