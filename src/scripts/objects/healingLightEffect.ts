import { Facings } from "../helpers/constants";
import AbilityEffect from "./abilityEffect";
import globalState from '../worldstate/index';

export default class HealingLightEffect extends AbilityEffect {
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  constructor(scene: Phaser.Scene, x: number, y: number, spriteName: string, facing: Facings) {
    super(scene, x, y, 'empty-tile', facing);
    scene.add.existing(this);
    this.setDepth(1);
    scene.physics.add.existing(this);
    this.body.setCircle(6, 0, 0);
    this.body.setMass(0);

    const particles = scene.add.particles('fire');
    particles.setDepth(1);
    this.emitter = particles.createEmitter({
      alpha: { start: 0.4, end: 0 },
      scale: { start: 0, end: 0.8 },
      // tint: 0x000066,
      speed: 40,
      // accelerationY: -300,
      angle: { min: -180, max: 180 },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 200, max: 240 },
      blendMode: Phaser.BlendModes.LUMINOSITY,
      frequency: 20,
      maxParticles: 40,
    });
    this.emitter.startFollow(this.body.gameObject);
    this.emitter.start();

    globalState.playerCharacter.health = Math.min(
      globalState.playerCharacter.health + 20,
      globalState.playerCharacter.maxHealth
    );

    setTimeout(() => {
      this.destroy();
    }, 300)
  }

  destroy() {
    this.emitter.stop();

    super.destroy();
  }

    update() {
      this.setPosition(
        globalState.playerCharacter.x,
        globalState.playerCharacter.y
      );
    }
}