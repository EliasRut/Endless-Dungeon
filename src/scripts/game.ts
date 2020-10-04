import 'phaser'
import MainScene from './scenes/mainScene'
import PreloadScene from './scenes/preloadScene'

const DEFAULT_WIDTH = 640
const DEFAULT_HEIGHT = 360

// This is the configuration for Phaser
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#020202',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: Phaser.Scale.ZOOM_4X,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadScene, MainScene],
  // We are using Phasers arcade physics library
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: false
  }
}

// This will create the phaser game object once the window finishes loading.
window.addEventListener('load', () => {
  const game = new Phaser.Game(config)
})
