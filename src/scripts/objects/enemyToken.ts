import { Game } from "phaser";
import { Facings, facingToSpriteNameMap } from "../helpers/constants";
import NPC from "../worldstate/NPC"
import Player from "../worldstate/PlayerCharacter"
import { getFacing } from '../helpers/orientation';

export default class Enemy extends NPC {
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  lastFacing: Facings = Facings.SOUTH;

  constructor(scene: Phaser.Scene, x: number, y: number, definerID: number) {
  super(scene, x, y, 'red-link');
  scene.add.existing(this);
  scene.physics.add.existing(this);
  this.id= definerID;

    switch (this.id) {
      case 10:
        //cool effects!
        const particles = scene.add.particles('fire');
        particles.setDepth(1);
        this.emitter = particles.createEmitter({
          alpha: { start: 0.3, end: 0.0 },
          scale: { start: 0.0, end: 2 },
          tint: 0x1c092d,//0x008800, //0x663300
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
        break;
      case 9:
        this.proximity = 70;
        break;
    }
  }
  //update from main Scene
  public update(player: Player) {
    //check death
    if(this.health <= 0){
        this.destroy();
        return;
    }
    //calc distance to player
    const px = player.x;
    const py = player.y;
    const distance = Math.sqrt((this.x - px)*(this.x - px) + (this.y - py)*(this.y - py));

    switch (this.id) {
      case 10:
        //damages & slows you if you're close
        if (distance < 30) {
          player.slowFactor = 0.5;
          player.health -= 0.1;
        }
        else {
          player.slowFactor = 1;
        }
        //follows you only if you're close enough, then runs straight at you.
        if (this.proximity < distance && distance < this.vision) {

          const xSpeed = (px - this.x) / (Math.abs(px - this.x) + Math.abs(py - this.y)) * this.movementSpeed;
          const ySpeed = (py - this.y) / (Math.abs(px - this.x) + Math.abs(py - this.y)) * this.movementSpeed;
          this.setVelocityX(xSpeed);
          this.setVelocityY(ySpeed);
          this.emitter.setSpeedX(xSpeed);
          this.emitter.setSpeedY(ySpeed);
          const newFacing = getFacing(xSpeed, ySpeed);
          if (newFacing !== this.lastFacing) {
            this.play(`red-link-walk-${facingToSpriteNameMap[newFacing]}`);
          }
          this.lastFacing = newFacing;
        }
        else {
          this.setVelocityX(0);
          this.setVelocityY(0);
          this.emitter.setSpeedX(0);
          this.emitter.setSpeedY(0);
          this.play(`red-link-idle-${facingToSpriteNameMap[this.lastFacing]}`);
        }
        if(distance < this.proximity)
        this.attack(player);
    }
  }

  //destroy the enemy
  destroy() {
    this.emitter.stopFollow();
    this.emitter.stop();

    super.destroy();
  }

  //attack out hero
  attack(player: Player){

  }
}