import { NpcScript, ScriptEntry } from '../../../typings/custom';
import PlayerCharacterToken from '../drawables/tokens/PlayerCharacterToken';
import MainScene from '../scenes/MainScene';
import DialogScreen from '../screens/DialogScreen';
import InventoryScreen from '../screens/InventoryScreen';
import StatScreen from '../screens/StatScreen';
import globalState from '../worldstate';
import { TILE_HEIGHT, TILE_WIDTH } from './generateDungeon';
import RoomPositioning from '../worldstate/RoomPositioning';
import { getCharacterSpeed, getFacing, updateMovingState } from './movement';
import CharacterToken from '../drawables/tokens/CharacterToken';

const DIALOG_TEXT_TIME_MS = 5000;

export interface NpcScriptState {
	repetition: number;
	step?: number;
	stepStartMs?: number;
	animationFallback?: string;
}

export default class ScriptHelper {

	scene: MainScene;
	currentRoom?: RoomPositioning;
	runningScript?: ScriptEntry[];
	scriptStep?: number;
	scriptSubStep?: number;
	scriptStepStartMs?: number;
	scriptAnimationFallback?: string;
	npcScriptStates: {[npcId: string]: NpcScriptState} = {};

	constructor (scene: MainScene) {
		this.scene = scene;
	}

	findRoomForToken(token: CharacterToken) {
		const rooms = globalState.dungeon.levels[globalState.currentLevel]?.rooms;
		const currentRoom = rooms?.find((room) => {
			return room.x * TILE_WIDTH < token.x &&
				(room.x + room.width) * TILE_WIDTH > token.x &&
				room.y * TILE_HEIGHT < token.y &&
				(room.y + room.height) * TILE_HEIGHT > token.y;
		});
		return currentRoom;
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
					const playerAnimation = updateMovingState(
						globalState.playerCharacter,
						false,
						facing,
						true);
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
						const speed = getCharacterSpeed(globalState.playerCharacter);
						mainCharacter.setVelocity(speed * xFactor, speed * yFactor);
						mainCharacter.body.velocity.normalize().scale(speed);
						const newFacing = getFacing(xFactor, yFactor);
						const playerAnimation = updateMovingState(
							globalState.playerCharacter,
							true,
							newFacing);
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
			case 'openDoor': {
				cleanUpStep = true;
				this.scene.changeDoorState(
					`${globalState.currentLevel}_${this.currentRoom!.roomName}_${currentStep.doorId}`,
					true);
				break;
			}
			case 'takeItem': {
				cleanUpStep = true;
				this.scene.overlayScreens.inventory.removeFromInventory(
					currentStep.itemId, currentStep.amount);
				break;
			}
			case 'condition': {
				if (currentStep.conditionType === 'hasItem') {
					const hasMatchingItems = !!globalState.inventory.unequippedItemList.find(
						(item) => item.item.id === currentStep.itemId);
					if (hasMatchingItems) {
						cleanUpStep = true;
					} else {
						this.runningScript = undefined;
						this.scriptStep = undefined;
						return;
					}
				} else if (currentStep.conditionType === 'scriptState') {
					const scriptId =
						`${globalState.currentLevel}_${this.currentRoom!.roomName}_${currentStep.scriptId}`;
					if (currentStep.scriptState === 'new') {
						if (!globalState.scripts[scriptId] || globalState.scripts[scriptId].state === 'new') {
							cleanUpStep = true;
						} else {
							this.runningScript = undefined;
							this.scriptStep = undefined;
							return;
						}
					} else if (currentStep.scriptState === 'finished') {
						if (!globalState.scripts[scriptId]
								|| globalState.scripts[scriptId].state !== 'finished') {
							this.runningScript = undefined;
							this.scriptStep = undefined;
							return;
						} else {
							cleanUpStep = true;
						}
					}
				}
				break;
			}
			case 'setScriptState': {
				cleanUpStep = true;
				const scriptId =
					`${globalState.currentLevel}_${this.currentRoom!.roomName}_${currentStep.scriptId}`;
				globalState.scripts[scriptId] = {
					id: scriptId,
					state: currentStep.scriptState
				};
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

	handleNpcScriptStep(globalTime: number, token: CharacterToken) {
		const scriptState = this.npcScriptStates[token.id];
		const script = token.script!;
		const currentStepNumber = scriptState.step || 0;
		const currentStep = script.steps[currentStepNumber];
		let cleanUpStep = false;
		if (!currentStep) {
			scriptState.step = 0;
			scriptState.repetition++;
			return;
		}
		switch (currentStep.type) {
			case 'wait': {
				if (!scriptState.stepStartMs) {
					scriptState.stepStartMs = globalTime;
				} else if ((scriptState.stepStartMs + currentStep.time) < globalTime) {
					cleanUpStep = true;
				}
				break;
			}
			case 'animation': {
				if (currentStep.duration) {
					if (!scriptState.stepStartMs) {
						scriptState.stepStartMs = globalTime;
						scriptState.animationFallback = token.anims.currentAnim.key;
							token.play(currentStep.animation);
					} else if ((scriptState.stepStartMs + currentStep.duration) < globalTime) {
						cleanUpStep = true;
						token.play(this.scriptAnimationFallback!);
					}
				} else {
					cleanUpStep = true;
					token.play(currentStep.animation);
				}
				break;
			}
			case 'move': {
				cleanUpStep = true;
				const tokenRoom = this.findRoomForToken(token);
				if (!tokenRoom) {
					cleanUpStep = true;
					break;
				}
				token.x = (tokenRoom!.x + currentStep.posX) * TILE_WIDTH;
				token.y = (tokenRoom!.y + currentStep.posY) * TILE_HEIGHT;
				const facing = getFacing(currentStep.facingX, currentStep.facingY);
				const animation = updateMovingState(
					globalState.npcs[token.id],
					false,
					facing,
					true);
				if (animation) {
					token.play(animation);
				}
				break;
			}
			case 'walk': {
				const tokenRoom = this.findRoomForToken(token);
				if (!tokenRoom) {
					cleanUpStep = true;
					break;
				}
				const targetX = (tokenRoom!.x + currentStep.posX) * TILE_WIDTH;
				const targetY = (tokenRoom!.y + currentStep.posY) * TILE_HEIGHT;
				const totalDistance = Math.abs(targetX - token.x) +
					Math.abs(targetY - token.y);
				const atTarget = totalDistance < (TILE_HEIGHT / 2);
				if (atTarget) {
					cleanUpStep = true;
					token.isBeingMoved = false;
					token.setVelocity(0);
				} else {
					const xFactor = (targetX - token.x) / totalDistance;
					const yFactor = (targetY - token.y) / totalDistance;
					const speed = getCharacterSpeed(globalState.npcs[token.id]);
					token.isBeingMoved = true;
					token.setVelocity(speed * xFactor, speed * yFactor);
					token.body.velocity.normalize().scale(speed);
					const newFacing = getFacing(xFactor, yFactor);
					const animation = updateMovingState(
						globalState.npcs[token.id],
						true,
						newFacing);
					if (animation) {
						token.play(animation);
					}
				}
				break;
			}
		}
		if (cleanUpStep) {
			scriptState.step = currentStepNumber + 1;
			scriptState.stepStartMs = undefined;
			scriptState.animationFallback = undefined;
		}
	}

	handleNpcScript(globalTime: number, token: CharacterToken) {
		if (!this.npcScriptStates[token.id]) {
			this.npcScriptStates[token.id] = {
				repetition: 0
			};
		}
		const script = token.script!;
		if (script.repeat === -1 || this.npcScriptStates[token.id].repetition < script.repeat) {
			this.handleNpcScriptStep(globalTime, token);
		}
	}

	handleNpcScripts(globalTime: number) {
		Object.values(this.scene.npcMap).forEach((npcToken) => {
			if (npcToken.script) {
				this.handleNpcScript(globalTime, npcToken);
			}
		});
	}

	handleRoomScripts(globalTime: number) {
		if (!this.runningScript) {
			const lastRoomName = this.currentRoom?.roomName;
			this.currentRoom = this.findRoomForToken(this.scene.mainCharacter);
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

	handleScripts(globalTime: number) {
		this.handleRoomScripts(globalTime);
		this.handleNpcScripts(globalTime);
	}
}