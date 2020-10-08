import { Facings } from "../helpers/constants";
import AbilityEffect from "./abilityEffect";

export default class DustNovaEffect extends AbilityEffect {
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings) {
    super(scene, x, y, 'empty-tile', facing);
    scene.add.existing(this);
    this.setDepth(1);
    scene.physics.add.existing(this);
    this.body.setCircle(6, 0, 0);
    this.body.setMass(10);

    const particles = scene.add.particles('wind');
    particles.setDepth(1);
    this.emitter = particles.createEmitter({
      alpha: { start: 0.6, end: 0 },
      scale: { start: 0, end: 0.5 },
      // tint: 0x000066,
      // speed: 10,
      // accelerationY: -300,
      // angle: { min: -85, max: -95 },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 400, max: 600 },
      // blendMode: Phaser.BlendModes.DARKEN,
      frequency: 60,
      maxParticles: 20,
    });
    this.emitter.startFollow(this.body.gameObject);
    this.emitter.start();

    setTimeout(() => {
      this.destroy();
    }, 600)
  }

  destroy() {
    this.emitter.stop();

    super.destroy();
  }
}