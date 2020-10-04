import { Game } from "phaser";
import { Facings, facingToSpriteNameMap } from "../helpers/constants";
import NPC from "../worldstate/NPC"
import Player from "../worldstate/PlayerCharacter"
import { getFacing } from '../helpers/orientation';
import CharacterToken from './characterToken';
import Enemy from "../worldstate/Enemy";

export default class EnemyToken extends CharacterToken {
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  lastFacing: Facings = Facings.SOUTH;

  constructor(scene: Phaser.Scene, x: number, y: number, tokenName: string) {
  super(scene, x, y, tokenName);
  scene.add.existing(this);
  scene.physics.add.existing(this);
  this.stateObject = new Enemy(tokenName, 10, 10, 35);
  //this.body.setCircle(10, 10, 12);

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
  }

  //update from main Scene
  public update(player: Player) {
    if (this.stateObject.health <= 0){
        this.destroy();
        return;
    }
    const px = player.x;
    const py = player.y;
    const distance = Math.sqrt((this.x - px)*(this.x - px) + (this.y - py)*(this.y - py));

    //damages you if you're close
    if (distance < 30){
        player.slowFactor = 0.5;
        player.health -= 0.1;
    }
    else{
        player.slowFactor = 1;
    }
    //follows you only if you're close enough, then runs straight at you.
    if(distance < this.stateObject.vision){
      const totalDistance = Math.abs(px - this.x) + Math.abs(py - this.y);
        const xSpeed = (px - this.x) / totalDistance * this.stateObject.movementSpeed;
        const ySpeed = (py - this.y) / totalDistance * this.stateObject.movementSpeed;
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
  }

  //destroy the enemy
  destroy() {
    this.emitter.stopFollow();
    this.emitter.stop();

    super.destroy();
  }
}