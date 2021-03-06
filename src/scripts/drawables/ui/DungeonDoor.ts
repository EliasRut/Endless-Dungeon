import { UiDepths, RuneAssignment, ColorsArray } from '../../helpers/constants';
import DungeonDoorScene from '../../scenes/DungeonDoorScene';

const socketPositions = [
	[315 , 130],
	[285 , 180],
	[345 , 180],
	[285 , 250],
	[345 , 250],
];

const frameWidth = 32;
const frameHeight = 32;

export default class DungeonDoor extends Phaser.GameObjects.Image {
	doorknob: Phaser.GameObjects.Image;
	runeSockets: Phaser.GameObjects.Sprite[] = [];
	runes: Phaser.GameObjects.Sprite[] = [];

	constructor(scene: DungeonDoorScene) {
		super(scene, scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'dungeon-door');

		this.setScrollFactor(0);
		this.setInteractive();
		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);

		for (let i=0; i<8; i++) {
			const runePositionX = frameWidth * i;
			const runePositionY = frameHeight;
			const rune = scene.add.sprite(runePositionX, runePositionY, 'runes');
			this.runes.push(rune);
		};

		this.doorknob = scene.add.image(250, 186, 'doorknob');
		this.doorknob.setScrollFactor(0);
		this.doorknob.setDepth(UiDepths.UI_MAIN_LAYER);
		this.doorknob.setInteractive();
		this.doorknob.on('pointerdown', () => {
			const usedRunes: number[] = [];
			for (let i=0; i < 5; i++) {
				const [x , y] = socketPositions[i];
				this.runes[i].x = x;
				this.runes[i].y = y;
				this.runes[i].setScrollFactor(0);
				this.runes[i].setInteractive();
				this.runes[i].setDepth(UiDepths.UI_FOREGROUND_LAYER);
				const usedRune = (i === 0) ?
					5 :
					((i === 1) ? 5 : Math.floor(Math.random() * 8));
				this.runes[i].setFrame(usedRune);
				usedRunes.push(usedRune);
			}

			const runeAssignment: RuneAssignment = {
				primaryContent: ColorsArray[usedRunes[0]],
				secondaryContent: ColorsArray[usedRunes[1]],
				wanderingMonsters: ColorsArray[usedRunes[2]],
				playerBuff: ColorsArray[usedRunes[3]],
				randomNpc: ColorsArray[usedRunes[4]]
			};

			window.setTimeout(() => {
				(this.scene as DungeonDoorScene).enterDungeon(runeAssignment);
			}, 3000);
		});

		for (let i=0; i<5; i++) {
			const [x , y] = socketPositions[i];
			const runeSocket = scene.add.sprite(x, y, 'runeSocket');
			runeSocket.setScrollFactor(0);
			runeSocket.setDepth(UiDepths.UI_MAIN_LAYER);
			runeSocket.play('runeSocket-anim');
			this.runeSockets.push(runeSocket);
		}

		scene.add.existing(this);
	}
}