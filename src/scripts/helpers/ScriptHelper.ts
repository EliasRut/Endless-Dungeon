import { ScriptEntry } from '../../../typings/custom';
import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import MainScene from '../scenes/MainScene';
import DialogScreen from '../screens/DialogScreen';
import InventoryScreen from '../screens/InventoryScreen';
import StatScreen from '../screens/StatScreen';
import globalState from '../worldstate';
import { TILE_HEIGHT, TILE_WIDTH } from './generateDungeon';
import RoomPositioning from '../worldstate/RoomPositioning';
import { getFacing } from './orientation';

const DIALOG_TEXT_TIME_MS = 5000;

export default class ScriptHelper {

	scene: MainScene;
	currentRoom?: RoomPositioning;
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
			this.currentRoom = currentRoom;
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
			return;
		}
		switch (currentStep.type) {
			case 'wait': {
				if (!this.scriptStepStartMs) {
					this.scene.pause();
					this.scriptStepStartMs = globalTime;
				} else if ((this.scriptStepStartMs + currentStep.time) < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'fadeIn': {
				if (!this.scriptStepStartMs) {
					this.scene.pause();
					this.scriptStepStartMs = globalTime;
					this.scene.cameras.main.fadeIn(currentStep.time);
				} else if ((this.scriptStepStartMs + currentStep.time) < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'fadeOut': {
				if (!this.scriptStepStartMs) {
					this.scene.pause();
					this.scriptStepStartMs = globalTime;
					this.scene.cameras.main.fadeOut(currentStep.time);
				} else if ((this.scriptStepStartMs + currentStep.time) < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'dialog': {
				if (!this.scriptStepStartMs) {
					this.scene.pause();
					this.scriptStepStartMs = globalTime;
					this.scriptSubStep = 0;
					this.scene.overlayScreens.dialogScreen.setText(currentStep.text[this.scriptSubStep!]);
					this.scene.overlayScreens.dialogScreen.setVisible(true);
				} else if ((this.scriptStepStartMs + DIALOG_TEXT_TIME_MS) < globalTime) {
					this.scriptSubStep = this.scriptSubStep! + 1;
					if (currentStep.text.length <= this.scriptSubStep) {
						this.scene.overlayScreens.dialogScreen.setVisible(false);
						cleanUpStep = true;
						this.scene.resume();
					} else {
						this.scene.overlayScreens.dialogScreen.setText(currentStep.text[this.scriptSubStep!]);
						this.scriptStepStartMs = globalTime;
					}
				}
				break;
			}
			case 'animation': {
				if (!this.scriptStepStartMs) {
					this.scene.pause();
					this.scriptStepStartMs = globalTime;
					if (currentStep.target === 'player') {
						this.scriptAnimationFallback = this.scene.mainCharacter.anims.currentAnim.key;
						this.scene.mainCharacter.play(currentStep.animation);
					}
				} else if ((this.scriptStepStartMs + currentStep.duration) < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
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
			case 'move': {
				cleanUpStep = true;
				if (currentStep.target === 'player') {
					this.scene.mainCharacter.x = (this.currentRoom!.x + currentStep.posX) * TILE_WIDTH;
					this.scene.mainCharacter.y = (this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT;
					const facing = getFacing(currentStep.facingX, currentStep.facingY);
					const playerAnimation =
						globalState.playerCharacter.updateMovingState(false, facing, true);
					if (playerAnimation) {
						this.scene.mainCharacter.play(playerAnimation);
					}
				}
				break;
			}
			case 'walk': {
				if (currentStep.target === 'player') {
					this.scene.blockUserInteraction = true;
					const targetX = (this.currentRoom!.x + currentStep.posX) * TILE_WIDTH;
					const targetY = (this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT;
					const mainCharacter = this.scene.mainCharacter;
					const totalDistance = Math.abs(targetX - mainCharacter.x) +
						Math.abs(targetY - mainCharacter.y);
					const atTarget = totalDistance < (TILE_HEIGHT / 2);
					if (!atTarget) {
						const xFactor = (targetX - mainCharacter.x) / totalDistance;
						const yFactor = (targetY - mainCharacter.y) / totalDistance;
						const speed = globalState.playerCharacter.getSpeed();
						mainCharacter.setVelocity(speed * xFactor, speed * yFactor);
						mainCharacter.body.velocity.normalize().scale(speed);
						const newFacing = getFacing(xFactor, yFactor);
						const playerAnimation = globalState.playerCharacter.updateMovingState(true, newFacing);
						if (playerAnimation) {
							mainCharacter.play(playerAnimation);
						}
					} else {
						cleanUpStep = true;
						this.scene.blockUserInteraction = false;
					}
				}
				break;
			}
			case 'spawn': {
				cleanUpStep = true;
				const targetX = (this.currentRoom!.x + currentStep.posX) * TILE_WIDTH;
				const targetY = (this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT;
				this.scene.addNpc(
					`${this.currentRoom!.roomName}${currentStep.npcId}`,
					currentStep.npcType,
					targetX,
					targetY);
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
			const lastRoomName = this.currentRoom?.roomName;
			this.findCurrentRoom();
			const currentRooomName = this.currentRoom?.roomName;
			if (lastRoomName !== currentRooomName) {
				if (lastRoomName &&
						globalState.availableRooms[lastRoomName].scripts.onExit) {
					this.runningScript = globalState.availableRooms[lastRoomName].scripts.onExit;
					this.scriptStep = 0;
				} else if (currentRooomName &&
						globalState.availableRooms[currentRooomName].scripts.onEntry) {
					this.runningScript = globalState.availableRooms[currentRooomName].scripts.onEntry;
					this.scriptStep = 0;
				}
			}
		}
		if (this.runningScript) {
			this.handleScriptStep(globalTime);
		}
	}
}