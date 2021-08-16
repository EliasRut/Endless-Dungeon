/*
	The preload scene is the one we use to load the dungeon door. Once it's finished, it brings up 
	the dungeon door scene.
*/
export default class DungeonDoorPreloadScene extends Phaser.Scene {
	constructor() {
		super({ key: 'DungeonDoorPreloadScene' });
	}

	init() {
		const text = new Phaser.GameObjects.Text(this,
			this.cameras.main.centerX,
			this.cameras.main.centerY, 'Loading ...', {
				fontFamily: 'munro',
				color: 'white',
				fontSize: '26px'
			});
		this.add.existing(text);
	}

	preload() {
		// Dungeon Door
		this.load.image('dungeon-door', 'assets/img/dungeon-door.png');
		this.load.image('doorknob', 'assets/img/doorknob.png');
		this.load.spritesheet('runeSocket', `assets/img/socket-animation.png`,
			{ frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('runes', `assets/img/runes.png`,
		{ frameWidth: 32, frameHeight: 32 });

		// load music score
		this.load.audio('score-mage-tower', 'assets/sounds/score-mage-tower.mp3');
	}

	create() {
		this.anims.create({
			key: `runeSocket-anim`,
			frames: this.anims.generateFrameNumbers('runeSocket', {
				start: 0,
				end: 5 /* Currently only 1 drawn */
			}),
			frameRate: 6,
			repeat: -1
		});

		this.scene.start('DungeonDoorScene');
	}
}