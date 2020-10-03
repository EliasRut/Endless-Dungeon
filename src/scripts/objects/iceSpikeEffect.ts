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
        alpha: 0.6,
        // scale: { start: 0.3, end: 0.05 },
        scale: { start: 0.1, end: 0.5 },
        // tint: 0x3366ff,//{ start: 0xff945e, end: 0x660000 }, //0x663300
        // speed: {start: 100, end: 0},
        // accelerationY: -300,
        // angle: { min: -85, max: -95 },
        // rotate: { min: -120, max: 120 },
        lifespan: { min: 400, max: 600 },
        blendMode: Phaser.BlendModes.ADD,
        frequency: 60,
        maxParticles: 200,
        x: { min: -10, max: 10}
      });
      this.emitter.startFollow(this.body.gameObject);
      this.emitter.start();
    }
  
    destroy() {
      this.emitter.stopFollow();
      this.emitter.setEmitterAngle({min: -180, max: 180});
      this.emitter.setSpeed(100);
      this.emitter.explode(40, this.body.x, this.body.y);
  
      super.destroy();
    }
  }