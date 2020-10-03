import { Game } from "phaser";
import NPC from "../worldstate/NPC"
import Player from "../worldstate/PlayerCharacter"

export default class Enemy extends NPC {
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y, 'empty-tile');
  scene.add.existing(this);
  scene.physics.add.existing(this);
  this.enemy = 1;
  //this.body.setCircle(10, 10, 12);

    //cool effects!
    const particles = scene.add.particles('fire');
    particles.setDepth(1);
    this.emitter = particles.createEmitter({
      alpha: { start: 0.4, end: 0.0 },
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
    if(this.health <= 0){
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
    if(distance < this.vision){

        const xSpeed = (px-this.x)/(Math.abs(px-this.x)+Math.abs(py-this.y))*this.movementSpeed;
        const ySpeed = (py-this.y)/(Math.abs(px-this.x)+Math.abs(py-this.y))*this.movementSpeed;
        this.setVelocityX(xSpeed);
        this.setVelocityY(ySpeed);
    }
    else {
        this.setVelocityX(0);
        this.setVelocityY(0);
    }
  }

  //destroy the enemy
  destroy() {
    this.emitter.stopFollow();
    this.emitter.stop();

    super.destroy();
  }
}