import { Game } from "phaser";
import { Facings, facingToSpriteNameMap } from "../helpers/constants";
import NPC from "../worldstate/NPC"
import Player from "../worldstate/PlayerCharacter"
import { getFacing, getVelocitiesForFacing } from '../helpers/orientation';
import FireBallEffect from '../objects/fireBallEffect';
import globalState from "../worldstate";
import PlayerCharacterToken from '../objects/playerCharacterToken'
import MainScene from "../scenes/mainScene";

export default class Enemy extends NPC {
  fireballEffect: FireBallEffect | undefined;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  lastFacing: Facings = Facings.SOUTH;
  scene: MainScene;

  constructor(scene: MainScene, x: number, y: number, definerID: number) {
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
        this.proximity = 100;
        break;
    }
  }
  //update from main Scene
  public update(player: Player, time: number, playerToken: PlayerCharacterToken) {
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
          player.health -= 0.01;
        }
        else {
          player.slowFactor = 1;
        }
        //follows you only if you're close enough, then runs straight at you.
        if (this.proximity < distance && distance < this.vision && this.attackedAt + 100 < time) {

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
        break;
        case 9:
          const xSpeed = (px - this.x) / (Math.abs(px - this.x) + Math.abs(py - this.y)) * this.movementSpeed;
          const ySpeed = (py - this.y) / (Math.abs(px - this.x) + Math.abs(py - this.y)) * this.movementSpeed;          
          const newFacing = getFacing(xSpeed, ySpeed);
          if (newFacing !== this.lastFacing) {
            this.play(`red-link-walk-${facingToSpriteNameMap[newFacing]}`);
          }
          this.lastFacing = newFacing;
          if (this.proximity < distance && distance < this.vision && this.attackedAt + 100 < time) {
            this.setVelocityX(xSpeed);
            this.setVelocityY(ySpeed);
          }
          else {
            this.setVelocityX(0);
            this.setVelocityY(0);
            this.play(`red-link-idle-${facingToSpriteNameMap[this.lastFacing]}`);
          }
          break;
    }
    if(distance < this.proximity)
        this.attack(player, time, playerToken);

  }

  //destroy the enemy
  destroy() {
    if (this.id === 10) {
      this.emitter.stopFollow();
      this.emitter.stop();
    }
    super.destroy();
  }

  //attack out hero
  attack(player: Player, time: number, playerToken: PlayerCharacterToken) {
    switch (this.id) {
      case 10:
        if (this.attackedAt + 3000 < time) {
          this.setVelocityX(0);
          this.setVelocityY(0);
          this.attackedAt = time;
          player.health -= 5;
          console.log("player health=", player.health);
        }
        break;
      case 9:
        console.log("range attacker");
        if (this.attackedAt + 5000 < time) {
          this.setVelocityX(0);
          this.setVelocityY(0);
          this.attackedAt = time;
          const fireballVelocities = getVelocitiesForFacing(this.lastFacing)!;
          this.fireballEffect = new FireBallEffect(
            this.scene,
            this.x + (16 * fireballVelocities.x),
            this.y + (16 * fireballVelocities.y)
          );
          this.fireballEffect.setVelocity(fireballVelocities.x, fireballVelocities.y);
          this.fireballEffect.body.velocity.normalize().scale(300);
          this.scene.physics.add.collider(this.fireballEffect, this.scene.tileLayer, (effect) => {
            effect.destroy();
            this.fireballEffect = undefined;
          });
          this.scene.physics.add.collider(this.fireballEffect, playerToken, (effect, target) => {
            effect.destroy();
            this.fireballEffect = undefined;
            player.health -= 5;
          console.log("enemy health=", this.health);
        });
        break;
      }
    }
  }
}