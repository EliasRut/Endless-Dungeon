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
    this.proximity = 15;
  }

  public update(time: number) {
        // super.update(time);

        const player = globalState.playerCharacter;

        // check death
        if (this.stateObject.health <= 0){
            this.dropItem(player,this.scene);
            this.destroy();
            return;
        }

        const px = player.x;
        const py = player.y;
        const distance = this.getDistance(player);

        // damages & slows you if you're close
        if (distance < 30) {
          player.slowFactor = 0.5;
          player.health -= 0.01;
        }
        else {
          player.slowFactor = 1;
        }
        //follows you only if you're close enough, then runs straight at you.
        if (this.proximity < distance
            && distance < this.stateObject.vision
            && this.attackedAt + 100 < time) {

          const totalDistance = Math.abs(px - this.x) + Math.abs(py - this.y);
          const xSpeed = (px - this.x) / totalDistance * this.stateObject.movementSpeed;
          const ySpeed = (py - this.y) / totalDistance * this.stateObject.movementSpeed;
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
    if(distance < this.proximity) {
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

    if (this.attackedAt + 3000 < time) {
        this.setVelocityX(0);
        this.setVelocityY(0);
        this.attackedAt = time;
        player.health -= 5;
        console.log("player health=", player.health);
    }
  }
}