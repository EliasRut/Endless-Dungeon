import { UiDepths, RuneAssignment, ColorsArray, SCALE } from '../../helpers/constants';
import DungeonDoorScene from '../../scenes/DungeonDoorScene';

// const socketPositions = [
// 	[315, 130],
// 	[285, 180],
// 	[345, 180],
// 	[285, 250],
// 	[345, 250],
// ];

const socketPositions = [
	[-4, -66],
	[-36, 0],
	[26, 0],
	[-36, 80],
	[26, 80],
];

const frameWidth = 32;
const frameHeight = 32;

const CENTER_X = window.innerWidth / 2;
const CENTER_Y = window.innerHeight / 2;
export default class DungeonDoor extends Phaser.GameObjects.Image {
	doorknob: Phaser.GameObjects.Image;
	runeSockets: Phaser.GameObjects.Sprite[] = [];
	runes: Phaser.GameObjects.Sprite[] = [];

	constructor(scene: DungeonDoorScene) {
		super(scene, CENTER_X, CENTER_Y, 'dungeon-door');

		this.setScrollFactor(0);
		this.setInteractive();
		this.setDepth(UiDepths.UI_BACKGROUND_LAYER);
		this.setScale(SCALE);

		for (let i = 0; i < 8; i++) {
			const runePositionX = frameWidth * i;
			const runePositionY = frameHeight;
			const rune = scene.add.sprite(runePositionX * SCALE, runePositionY * SCALE, 'runes');
			rune.setVisible(false);
			this.runes.push(rune);
		}

		this.doorknob = scene.add.image(CENTER_X - 70 * SCALE, CENTER_Y + 8 * SCALE, 'doorknob');
		this.doorknob.setScrollFactor(0);
		this.doorknob.setDepth(UiDepths.UI_MAIN_LAYER);
		this.doorknob.setInteractive();
		this.doorknob.setScale(SCALE);
		this.doorknob.on('pointerdown', () => {
			this.openDoor();
		});

		for (let i = 0; i < 5; i++) {
			const [x, y] = socketPositions[i];
			const runeSocket = scene.add.sprite(CENTER_X + x * SCALE, CENTER_Y + y * SCALE, 'runeSocket');
			runeSocket.setScrollFactor(0);
			runeSocket.setScale(SCALE);
			runeSocket.setDepth(UiDepths.UI_MAIN_LAYER);
			runeSocket.play('runeSocket-anim');
			this.runeSockets.push(runeSocket);
		}

		scene.add.existing(this);
	}
	openDoor = () => {
		const usedRunes: number[] = [];
		for (let i = 0; i < 5; i++) {
			const [x, y] = socketPositions[i];
			this.runes[i].x = CENTER_X + x * SCALE;
			this.runes[i].y = CENTER_Y + y * SCALE;
			this.runes[i].setScrollFactor(0);
			this.runes[i].setInteractive();
			this.runes[i].setScale(SCALE);
			this.runes[i].setDepth(UiDepths.UI_FOREGROUND_LAYER);
			this.runes[i].setVisible(true);
			const usedRune = i === 0 ? 5 : i === 1 ? 5 : Math.floor(Math.random() * 8);
			this.runes[i].setFrame(usedRune);
			usedRunes.push(usedRune);
		}

		const runeAssignment: RuneAssignment = {
			primaryContent: ColorsArray[usedRunes[0]],
			secondaryContent: ColorsArray[usedRunes[1]],
			wanderingMonsters: ColorsArray[usedRunes[2]],
			playerBuff: ColorsArray[usedRunes[3]],
			randomNpc: ColorsArray[usedRunes[4]],
		};

		window.setTimeout(() => {
			(this.scene as DungeonDoorScene).enterDungeon(runeAssignment);
		}, 3000);
	};
}
