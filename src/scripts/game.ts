import 'phaser'
import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720

// This is the configuration for Phaser
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadScene, MainScene],
  // We are using Phasers arcade physics library
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  }
}

// This will create the phaser game object once the window finishes loading.
window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
