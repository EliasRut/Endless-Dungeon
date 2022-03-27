import { ScriptEntry, ScriptPausedCondition } from '../../../typings/custom';
import MainScene from '../scenes/MainScene';
import globalState from '../worldstate';
import { TILE_HEIGHT, TILE_WIDTH } from './generateDungeon';
import RoomPositioning from '../worldstate/RoomPositioning';
import { getCharacterSpeed, getFacing8Dir, updateMovingState } from './movement';
import CharacterToken from '../drawables/tokens/CharacterToken';
import fixedItems from '../../items/fixedItems.json';
import Item from '../worldstate/Item';
import { generateRandomItem } from './item';
import { Faction, SCALE } from './constants';
import { ItemData, UneqippableItem } from '../../items/itemData';

const DIALOG_TEXT_TIME_MS = 5000;

export default class ScriptHelper {
	scene: MainScene;
	currentRoom?: RoomPositioning;

	constructor(scene: MainScene) {
		this.scene = scene;
	}

	getScriptState(name: string) {
		const stateIds = Object.keys(globalState.scripts.states || []);
		const nameRegExp = new RegExp(name);
		const stateId = stateIds.find((id) => nameRegExp.test(id));
		if (stateId) {
			return globalState.scripts.states && globalState.scripts.states[stateId];
		}
		return undefined;
	}

	findRoomForToken(token: CharacterToken) {
		const rooms = globalState.dungeon.levels[globalState.currentLevel]?.rooms;
		const currentRoom = rooms?.find((room) => {
			return (
				room.x * TILE_WIDTH < token.x / SCALE &&
				(room.x + room.width) * TILE_WIDTH > token.x / SCALE &&
				room.y * TILE_HEIGHT < token.y / SCALE &&
				(room.y + room.height) * TILE_HEIGHT > token.y / SCALE
			);
		});
		return currentRoom;
	}

	handleScriptStep(globalTime: number, userCancelled?: boolean) {
		const currentStep = globalState.scripts.runningScript![globalState.scripts.scriptStep!];
		let cleanUpStep = false;
		if (!currentStep) {
			globalState.scripts.runningScript = undefined;
			globalState.scripts.scriptStep = undefined;
			// if (globalState.scripts.runningScriptId) {
			// 	if (!globalState.scripts.states) {
			// 		globalState.scripts.states = {};
			// 	}
			// 	if (!globalState.scripts.states[globalState.scripts.runningScriptId]) {
			// 		globalState.scripts.states[globalState.scripts.runningScriptId] = {
			// 			id: globalState.scripts.runningScriptId,
			// 			state: 'finished',
			// 		};
			// 	} else {
			// 		globalState.scripts.states[globalState.scripts.runningScriptId].state = 'finished';
			// 	}
			// 	globalState.scripts.runningScriptId = undefined;
			// }
			return;
		}
		switch (currentStep.type) {
			case 'wait': {
				if (!globalState.scripts.scriptStepStartMs) {
					this.scene.pause();
					globalState.scripts.scriptStepStartMs = globalTime;
				} else if (globalState.scripts.scriptStepStartMs + currentStep.time < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'fadeIn': {
				if (!globalState.scripts.scriptStepStartMs) {
					this.scene.pause();
					globalState.scripts.scriptStepStartMs = globalTime;
					this.scene.cameras.main.fadeIn(currentStep.time);
				} else if (globalState.scripts.scriptStepStartMs + currentStep.time < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'fadeOut': {
				if (!globalState.scripts.scriptStepStartMs) {
					this.scene.pause();
					globalState.scripts.scriptStepStartMs = globalTime;
					this.scene.cameras.main.fadeOut(currentStep.time);
				} else if (globalState.scripts.scriptStepStartMs + currentStep.time < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'dialog': {
				if (!globalState.scripts.scriptStepStartMs) {
					this.scene.pause();
					globalState.scripts.scriptStepStartMs = globalTime;
					globalState.scripts.scriptSubStep = 0;
					this.scene.overlayScreens.dialogScreen.setText(
						currentStep.text[globalState.scripts.scriptSubStep!]
					);
					this.scene.overlayScreens.dialogScreen.setVisible(true);
				} else if (
					globalState.scripts.scriptStepStartMs + DIALOG_TEXT_TIME_MS < globalTime ||
					userCancelled
				) {
					globalState.scripts.scriptSubStep = globalState.scripts.scriptSubStep! + 1;
					if (currentStep.text.length <= globalState.scripts.scriptSubStep) {
						this.scene.overlayScreens.dialogScreen.setVisible(false);
						cleanUpStep = true;
						this.scene.resume();
					} else {
						this.scene.overlayScreens.dialogScreen.setText(
							currentStep.text[globalState.scripts.scriptSubStep!]
						);
						globalState.scripts.scriptStepStartMs = globalTime;
					}
				}
				break;
			}
			case 'animation': {
				if (!globalState.scripts.scriptStepStartMs) {
					this.scene.pause();
					globalState.scripts.scriptStepStartMs = globalTime;
					if (currentStep.target === 'player') {
						globalState.scripts.scriptAnimationFallback =
							this.scene.mainCharacter.anims.currentAnim.key;
						this.scene.mainCharacter.play(currentStep.animation);
					}
				} else if (globalState.scripts.scriptStepStartMs + currentStep.duration < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
					this.scene.mainCharacter.play(globalState.scripts.scriptAnimationFallback!);
				}
				break;
			}
			case 'sceneChange': {
				cleanUpStep = true;
				globalState.currentLevel = currentStep.target;
				globalState.playerCharacter.x = 0;
				globalState.playerCharacter.y = 0;
				this.scene.mainCharacter.x = 0;
				this.scene.mainCharacter.y = 0;
				this.scene.scene.start('RoomPreloaderScene');
				break;
			}
			case 'move': {
				cleanUpStep = true;
				if (currentStep.target === 'player') {
					if (!this.currentRoom) {
						this.currentRoom = this.findRoomForToken(this.scene.mainCharacter);
					}
					this.scene.mainCharacter.x =
						(this.currentRoom!.x + currentStep.posX) * TILE_WIDTH * SCALE;
					this.scene.mainCharacter.y =
						(this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT * SCALE;
					const facing = getFacing8Dir(currentStep.facingX, currentStep.facingY);
					const playerAnimation = updateMovingState(
						globalState.playerCharacter,
						false,
						facing,
						true
					);
					if (playerAnimation) {
						this.scene.mainCharacter.play(playerAnimation);
					}
				} else {
					const npcId = `${this.currentRoom!.roomName}-${currentStep.target}`;
					if (!this.scene.npcMap[npcId]) {
						throw new Error(
							`Npc with id ${npcId} not defined. ` +
								`Known npcs are ${Object.keys(this.scene.npcMap)}`
						);
					}
					this.scene.npcMap[npcId].x =
						(this.currentRoom!.x + currentStep.posX) * TILE_WIDTH * SCALE;
					this.scene.npcMap[npcId].y =
						(this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT * SCALE;
					const facing = getFacing8Dir(currentStep.facingX, currentStep.facingY);
					const animation = updateMovingState(globalState.npcs[npcId], false, facing, true);
					if (animation) {
						this.scene.npcMap[npcId].play(animation);
					}
				}
				break;
			}
			case 'cast': {
				cleanUpStep = true;
				this.scene.abilityHelper.triggerAbility(
					globalState.playerCharacter,
					globalState.playerCharacter,
					currentStep.ability,
					1,
					globalTime
				);
				break;
			}
			case 'walk': {
				if (currentStep.target === 'player') {
					this.scene.blockUserInteraction = true;
					const targetX = (this.currentRoom!.x + currentStep.posX) * TILE_WIDTH;
					const targetY = (this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT;
					const mainCharacter = this.scene.mainCharacter;
					const totalDistance =
						Math.abs(targetX - mainCharacter.x) + Math.abs(targetY - mainCharacter.y);
					const atTarget = totalDistance / SCALE < TILE_HEIGHT / 2;
					if (!atTarget) {
						const xFactor = (targetX - mainCharacter.x) / totalDistance;
						const yFactor = (targetY - mainCharacter.y) / totalDistance;
						const speed = getCharacterSpeed(globalState.playerCharacter);
						mainCharacter.setVelocity(speed * xFactor, speed * yFactor);
						mainCharacter.body.velocity.normalize().scale(speed);
						const newFacing = getFacing8Dir(xFactor, yFactor);
						const playerAnimation = updateMovingState(globalState.playerCharacter, true, newFacing);
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
				const targetX = (this.currentRoom!.x + currentStep.posX) * TILE_WIDTH * SCALE;
				const targetY = (this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT * SCALE;
				this.scene.addNpc(
					`${this.currentRoom!.roomName}${currentStep.npcId}`,
					currentStep.npcType,
					targetX,
					targetY,
					globalState.dungeon.levels[globalState.currentLevel].enemyLevel,
					currentStep.facingX || 0,
					currentStep.facingY || 0
				);
				break;
			}
			case 'openDoor': {
				cleanUpStep = true;
				this.scene.changeDoorState(
					`${globalState.currentLevel}_${this.currentRoom!.roomName}_${currentStep.doorId}`,
					true
				);
				break;
			}
			case 'takeItem': {
				cleanUpStep = true;
				if (globalState.inventory.bag[currentStep.itemId as UneqippableItem]) {
					globalState.inventory.bag[currentStep.itemId as UneqippableItem]! -= currentStep.amount;
					if (globalState.inventory.bag[currentStep.itemId as UneqippableItem]! < 0) {
						delete globalState.inventory.bag[currentStep.itemId as UneqippableItem];
					}
				}
				break;
			}
			case 'placeItem': {
				cleanUpStep = true;
				const targetX = (this.currentRoom!.x + currentStep.posX) * TILE_WIDTH;
				const targetY = (this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT;
				this.scene.addFixedItem(currentStep.itemId, targetX, targetY);
				break;
			}
			case 'pauseUntilCondition': {
				if (!globalState.scripts.pausedScripts) {
					globalState.scripts.pausedScripts = [];
				}
				globalState.scripts.pausedScripts.push({
					script: [...globalState.scripts.runningScript!],
					scriptStep: globalState.scripts.scriptStep!,
				});
				globalState.scripts.runningScript = undefined;
				globalState.scripts.scriptStep = 0;
				break;
			}
			case 'condition': {
				if (currentStep.conditionType === 'hasItem') {
					const itemId = currentStep.itemId as UneqippableItem;
					const hasMatchingItems = !!globalState.inventory.bag[itemId!];
					if (hasMatchingItems) {
						cleanUpStep = true;
					} else {
						globalState.scripts.runningScript = undefined;
						globalState.scripts.scriptStep = undefined;
						return;
					}
				} else if (currentStep.scriptId) {
					const scriptId = `${globalState.currentLevel}_${this.currentRoom!.roomName}_${
						currentStep.scriptId
					}`;
					if (currentStep.scriptState === 'new') {
						const state = globalState.scripts.states && globalState.scripts.states[scriptId];
						if (!state || state.state === 'new') {
							cleanUpStep = true;
						} else {
							globalState.scripts.runningScript = undefined;
							globalState.scripts.scriptStep = undefined;
							return;
						}
					} else if (currentStep.scriptState === 'finished') {
						const state = globalState.scripts.states && globalState.scripts.states[scriptId];
						if (!state || state.state !== 'finished') {
							globalState.scripts.runningScript = undefined;
							globalState.scripts.scriptStep = undefined;
							return;
						} else {
							cleanUpStep = true;
						}
					}
				}
				break;
			}
			case 'setQuestState': {
				cleanUpStep = true;
				if (!globalState.quests) {
					globalState.quests = {};
				}
				globalState.quests[currentStep.questId].questFinished =
					currentStep.questState === 'finished';
				globalState.quests[currentStep.questId].questOngoing = currentStep.questState === 'ongoing';
				break;
			}
			case 'setScriptState': {
				cleanUpStep = true;
				const scriptId = `${globalState.currentLevel}_${this.currentRoom!.roomName}_${
					currentStep.scriptId
				}`;
				if (!globalState.scripts.states) {
					globalState.scripts.states = {};
				}
				globalState.scripts.states[scriptId] = {
					id: scriptId,
					state: currentStep.scriptState,
				};
				break;
			}
			case 'spawnItem': {
				cleanUpStep = true;
				let targetX: number;
				let targetY: number;
				if (currentStep.atPlayerPosition) {
					targetX = globalState.playerCharacter.x * SCALE;
					targetY = globalState.playerCharacter.y * SCALE;
				} else {
					targetX = (this.currentRoom!.x + currentStep.posX!) * TILE_WIDTH * SCALE;
					targetY = (this.currentRoom!.y + currentStep.posY!) * TILE_HEIGHT * SCALE;
				}
				if (currentStep.fixedId) {
					this.scene.dropItem(targetX, targetY, currentStep.fixedId);
				} else {
					const { itemKey, level } = generateRandomItem(currentStep.itemOptions || {});
					this.scene.dropItem(targetX, targetY, itemKey, level);
				}
				break;
			}
			// To Do's:
			// Implememt item take and drop case (for example wizard scroll)
		}
		if (cleanUpStep) {
			globalState.scripts.scriptStep = globalState.scripts.scriptStep! + 1;
			globalState.scripts.scriptSubStep = undefined;
			globalState.scripts.scriptStepStartMs = undefined;
			globalState.scripts.scriptAnimationFallback = undefined;
		}
	}

	handleNpcScriptStep(globalTime: number, token: CharacterToken) {
		const scriptState = globalState.scripts.npcScriptStates![token.id];
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
				} else if (scriptState.stepStartMs + currentStep.time < globalTime) {
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
					} else if (scriptState.stepStartMs + currentStep.duration < globalTime) {
						cleanUpStep = true;
						token.play(globalState.scripts.scriptAnimationFallback!);
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
				token.x = (tokenRoom!.x + currentStep.posX) * TILE_WIDTH * SCALE;
				token.y = (tokenRoom!.y + currentStep.posY) * TILE_HEIGHT * SCALE;
				const facing = getFacing8Dir(currentStep.facingX, currentStep.facingY);
				const animation = updateMovingState(globalState.npcs[token.id], false, facing, true);
				if (animation) {
					token.play(animation);
				}
				break;
			}
			case 'walk': {
				if (!token || !globalState.npcs[token.id]) {
					cleanUpStep = true;
					break;
				}
				const tokenRoom = this.findRoomForToken(token);
				if (!tokenRoom) {
					cleanUpStep = true;
					break;
				}
				const targetX = (tokenRoom!.x + currentStep.posX + 0.5) * TILE_WIDTH * SCALE;
				const targetY = (tokenRoom!.y + currentStep.posY + 0.5) * TILE_HEIGHT * SCALE;
				const totalDistance = Math.abs(targetX - token.x) + Math.abs(targetY - token.y);
				const atTarget = totalDistance / SCALE < TILE_HEIGHT / 2;
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
					const newFacing = getFacing8Dir(xFactor, yFactor);
					const animation = updateMovingState(globalState.npcs[token.id], true, newFacing);
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
		if (!globalState.scripts.npcScriptStates) {
			globalState.scripts.npcScriptStates = {};
		}
		if (!globalState.scripts.npcScriptStates[token.id]) {
			globalState.scripts.npcScriptStates[token.id] = {
				repetition: 0,
			};
		}
		const script = token.script!;
		if (
			script.repeat === -1 ||
			globalState.scripts.npcScriptStates[token.id].repetition < script.repeat
		) {
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

	isScriptFinished(scriptName: string) {
		const state = this.getScriptState(scriptName);
		return state && state.state === 'finished';
	}

	hasEnemiesInRoom(roomName: string) {
		const enemies = Object.values(this.scene.npcMap).filter((npc) => {
			if (npc.faction !== Faction.ENEMIES) {
				return false;
			}
			return npc.id.startsWith(roomName);
		});
		return enemies.length > 0;
	}

	handleRoomScripts(globalTime: number) {
		if (!globalState.scripts.runningScript) {
			const lastRoomName = this.currentRoom?.roomName;
			this.currentRoom = this.findRoomForToken(this.scene.mainCharacter);
			const currentRooomName = this.currentRoom?.roomName;
			if (lastRoomName !== currentRooomName) {
				if (
					lastRoomName &&
					globalState.availableRooms[lastRoomName].scripts.onExit &&
					!this.isScriptFinished(`${globalState.currentLevel}_${lastRoomName}_onExit`)
				) {
					globalState.scripts.runningScript =
						globalState.availableRooms[lastRoomName].scripts.onExit;
					globalState.scripts.scriptStep = 0;
					const scriptId = `${globalState.currentLevel}_${lastRoomName}_onExit`;
					globalState.scripts.runningScriptId = scriptId;
				} else if (
					currentRooomName &&
					globalState.availableRooms[currentRooomName].scripts.onEntry &&
					!this.isScriptFinished(`${globalState.currentLevel}_${currentRooomName}_onEntry`)
				) {
					globalState.scripts.runningScript =
						globalState.availableRooms[currentRooomName].scripts.onEntry;
					globalState.scripts.scriptStep = 0;
					const scriptId = `${globalState.currentLevel}_${currentRooomName}_onEntry`;
					globalState.scripts.runningScriptId = scriptId;
				}
			} else if (
				currentRooomName &&
				globalState.availableRooms[currentRooomName].scripts.onClear &&
				!this.hasEnemiesInRoom(currentRooomName) &&
				!this.isScriptFinished(`${globalState.currentLevel}_${currentRooomName}_onClear`)
			) {
				globalState.scripts.runningScript =
					globalState.availableRooms[currentRooomName].scripts.onClear;
				globalState.scripts.scriptStep = 0;
				const scriptId = `${globalState.currentLevel}_${currentRooomName}_onClear`;
				globalState.scripts.runningScriptId = scriptId;
			}
		}
		if (globalState.scripts.runningScript) {
			this.handleScriptStep(globalTime);
		}
	}

	isScriptRunning() {
		return !!globalState.scripts.runningScript;
	}

	loadScript(script: ScriptEntry[]) {
		if (this.isScriptRunning()) {
			return false;
		}
		globalState.scripts.runningScript = script;
		globalState.scripts.scriptStep = 0;
	}

	handleScripts(globalTime: number) {
		this.handleRoomScripts(globalTime);
		this.handleNpcScripts(globalTime);
	}

	resumePausedScripts() {
		if (this.isScriptRunning()) {
			return;
		}
		if (!globalState.scripts.pausedScripts || globalState.scripts.pausedScripts.length === 0) {
			return;
		}
		const firstResumableScriptIndex = globalState.scripts.pausedScripts.findIndex(
			(pausedScript) => {
				const conditionStep = pausedScript.script[pausedScript.scriptStep] as ScriptPausedCondition;
				let allConditionsFullfilled = true;
				if (conditionStep.roomName) {
					const currentRoom = this.findRoomForToken(this.scene.mainCharacter);
					if (!currentRoom || currentRoom.roomName !== conditionStep.roomName) {
						allConditionsFullfilled = false;
					}
				}
				(conditionStep.itemIds || []).forEach((itemId, index) => {
					const requiredCount = (conditionStep.itemQuantities || [])[index] || 1;
					const unequipedItemCount = globalState.inventory.bag[itemId as UneqippableItem] || 0;
					if (unequipedItemCount < requiredCount) {
						allConditionsFullfilled = false;
					}
				});
				(conditionStep.questIds || []).forEach((questId, index) => {
					const requiredState = (conditionStep.questStates || [])[index] || 'started';
					switch (requiredState) {
						case 'startedOrFinished': {
							if (!globalState.quests[questId]) {
								allConditionsFullfilled = false;
							}
							break;
						}
						case 'started': {
							if (!globalState.quests[questId] || globalState.quests[questId].questFinished) {
								allConditionsFullfilled = false;
							}
							break;
						}
						case 'notStarted': {
							if (globalState.quests[questId]) {
								allConditionsFullfilled = false;
							}
							break;
						}
						case 'finished': {
							if (!globalState.quests[questId] || !globalState.quests[questId].questFinished) {
								allConditionsFullfilled = false;
							}
							break;
						}
						case 'notFinished': {
							if (globalState.quests[questId] && globalState.quests[questId].questFinished) {
								allConditionsFullfilled = false;
							}
							break;
						}
					}
				});
				(conditionStep.scriptIds || []).forEach((scriptId, index) => {
					const requiredState = (conditionStep.scriptStates || [])[index] || 'finished';
					const state = this.getScriptState(scriptId);
					switch (requiredState) {
						case 'new': {
							if (state?.state === 'finished') {
								allConditionsFullfilled = false;
							}
							break;
						}
						case 'ongoing': {
							if (state?.state !== 'new') {
								allConditionsFullfilled = false;
							}
							break;
						}
						case 'finished': {
							if (state?.state !== 'finished') {
								allConditionsFullfilled = false;
							}
							break;
						}
					}
				});
				return allConditionsFullfilled;
			}
		);
		if (firstResumableScriptIndex > -1) {
			globalState.scripts.runningScript =
				globalState.scripts.pausedScripts[firstResumableScriptIndex].script;
			globalState.scripts.scriptStep =
				globalState.scripts.pausedScripts[firstResumableScriptIndex].scriptStep + 1;
			globalState.scripts.pausedScripts.splice(firstResumableScriptIndex, 1);
		}
	}
}
