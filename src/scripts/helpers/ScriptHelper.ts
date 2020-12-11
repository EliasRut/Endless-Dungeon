import { ScriptEntry } from '../../../typings/custom';
import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import MainScene from '../scenes/MainScene';
import DialogScreen from '../screens/DialogScreen';
import InventoryScreen from '../screens/InventoryScreen';
import StatScreen from '../screens/StatScreen';
import globalState from '../worldstate';
import { TILE_HEIGHT, TILE_WIDTH } from './generateDungeon';

const DIALOG_TEXT_TIME_MS = 5000;

export default class ScriptHelper {

	scene: MainScene;
	currentRoom?: string;
	runningScript?: ScriptEntry[];
	scriptStep?: number;
	scriptSubStep?: number;
	scriptStepStartMs?: number;
	scriptAnimationFallback?: string;

	constructor (scene: MainScene) {
		this.scene = scene;
	}

	findCurrentRoom() {
		const rooms = globalState.dungeon.levels.get(globalState.currentLevel)?.rooms;
		const currentRoom = rooms?.find((room) => {
			return room.x * TILE_WIDTH < globalState.playerCharacter.x &&
				(room.x + room.width) * TILE_WIDTH > globalState.playerCharacter.x &&
				room.y * TILE_HEIGHT < globalState.playerCharacter.y &&
				(room.y + room.height) * TILE_HEIGHT > globalState.playerCharacter.y;
		});
		if (currentRoom) {
			this.currentRoom = currentRoom.roomName;
		} else {
			this.currentRoom = undefined;
		}
	}

	handleScriptStep(globalTime: number) {
		const currentStep = this.runningScript![this.scriptStep!];
		let cleanUpStep = false;
		if (!currentStep) {
			this.runningScript = undefined;
			this.scriptStep = undefined;
			this.scene.resume();
			return;
		}
		switch (currentStep.type) {
			case 'wait': {
				if (!this.scriptStepStartMs) {
					this.scriptStepStartMs = globalTime;
				} else if ((this.scriptStepStartMs + currentStep.time) < globalTime) {
					cleanUpStep = true;
				}
				break;
			}
			case 'fadeIn': {
				if (!this.scriptStepStartMs) {
					this.scriptStepStartMs = globalTime;
					this.scene.cameras.main.fadeIn(currentStep.time);
				} else if ((this.scriptStepStartMs + currentStep.time) < globalTime) {
					cleanUpStep = true;
				}
				break;
			}
			case 'fadeOut': {
				if (!this.scriptStepStartMs) {
					this.scriptStepStartMs = globalTime;
					this.scene.cameras.main.fadeOut(currentStep.time);
				} else if ((this.scriptStepStartMs + currentStep.time) < globalTime) {
					cleanUpStep = true;
				}
				break;
			}
			case 'dialog': {
				if (!this.scriptStepStartMs) {
					this.scriptStepStartMs = globalTime;
					this.scriptSubStep = 0;
					this.scene.overlayScreens.dialogScreen.setText(currentStep.text[this.scriptSubStep!]);
					this.scene.overlayScreens.dialogScreen.setVisible(true);
				} else if ((this.scriptStepStartMs + DIALOG_TEXT_TIME_MS) < globalTime) {
					this.scriptSubStep = this.scriptSubStep! + 1;
					if (currentStep.text.length <= this.scriptSubStep) {
						this.scene.overlayScreens.dialogScreen.setVisible(false);
						cleanUpStep = true;
					} else {
						this.scene.overlayScreens.dialogScreen.setText(currentStep.text[this.scriptSubStep!]);
						this.scriptStepStartMs = globalTime;
					}
				}
				break;
			}
			case 'animation': {
				if (!this.scriptStepStartMs) {
					this.scriptStepStartMs = globalTime;
					if (currentStep.target === 'player') {
						this.scriptAnimationFallback = this.scene.mainCharacter.anims.currentAnim.key;
						this.scene.mainCharacter.play(currentStep.animation);
					}
				} else if ((this.scriptStepStartMs + currentStep.duration) < globalTime) {
					cleanUpStep = true;
					this.scene.mainCharacter.play(this.scriptAnimationFallback!);
				}
				break;
			}
			case 'sceneChange': {
				cleanUpStep = true;
				globalState.currentLevel = currentStep.target;
				this.scene.scene.start('RoomPreloaderScene');
				break;
			}
		}
		if (cleanUpStep) {
			this.scriptStep = this.scriptStep! + 1;
			this.scriptSubStep = undefined;
			this.scriptStepStartMs = undefined;
			this.scriptAnimationFallback = undefined;
		}
	}

	handleScripts(globalTime: number) {
		if (!this.runningScript) {
			const lastRoomName = this.currentRoom;
			this.findCurrentRoom();
			if (lastRoomName !== this.currentRoom) {
				if (lastRoomName &&
						globalState.availableRooms[lastRoomName].scripts.onExit) {
					this.runningScript = globalState.availableRooms[lastRoomName].scripts.onExit;
					this.scriptStep = 0;
				} else if (this.currentRoom &&
						globalState.availableRooms[this.currentRoom].scripts.onEntry) {
					this.runningScript = globalState.availableRooms[this.currentRoom].scripts.onEntry;
					this.scriptStep = 0;
				}
			}
		}
		if (this.runningScript) {
			this.scene.pause();

			this.handleScriptStep(globalTime);
		}
	}
}