export default class IceNovaEffect extends Phaser.Physics.Arcade.Image {
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y, 'empty-tile');
      scene.add.existing(this);
      this.setDepth(1);
      scene.physics.add.existing(this);
      this.body.setCircle(3, 0, 0);
      this.body.setMass(1);
  
      const particles = scene.add.particles('ice');
      particles.setDepth(1);
      this.emitter = particles.createEmitter({
        alpha: { start: 1, end: 0 },
        scale: { start: 0.3, end: 0.05 },
        // tint: { start: 0xff945e, end: 0x660000 }, //0x663300
        speed: 20,
        // accelerationY: -300,
        // angle: { min: -85, max: -95 },
        rotate: { min: -180, max: 180 },
        lifespan: { min: 400, max: 600 },
        blendMode: Phaser.BlendModes.ADD,
        frequency: 30,
        maxParticles: 200,
      });
      this.emitter.startFollow(this.body.gameObject);
      this.emitter.start();
    }
  
    destroy() {
      this.emitter.stopFollow();
      this.emitter.setEmitterAngle({min: -180, max: 180});
      this.emitter.setSpeed(100);
      this.emitter.explode(10, this.body.x, this.body.y);
  
      super.destroy();
    }
  }