import { ScriptEntry, ScriptPausedCondition } from '../../../typings/custom';
import MainScene from '../scenes/MainScene';
import worldstate from '../worldState';
import { TILE_HEIGHT, TILE_WIDTH } from './generateDungeon';
import RoomPositioning from '../../types/RoomPositioning';
import { getCharacterSpeed, getFacing8Dir, updateMovingState } from './movement';
import CharacterToken from '../drawables/tokens/CharacterToken';
import fixedItems from '../../items/fixedItems.json';
import Item, { UneqippableItem } from '../../types/Item';
import { generateRandomItem } from './item';
import { Faction, SCALE, NORMAL_ANIMATION_FRAME_RATE } from './constants';

const DIALOG_TEXT_TIME_MS = 5000;

export default class ScriptHelper {
	scene: MainScene;
	currentRoom?: RoomPositioning;

	constructor(scene: MainScene) {
		this.scene = scene;
	}

	getScriptState(name: string) {
		const stateIds = Object.keys(worldstate.scripts.states || []);
		const nameRegExp = new RegExp(name);
		const stateId = stateIds.find((id) => nameRegExp.test(id));
		if (stateId) {
			return worldstate.scripts.states && worldstate.scripts.states[stateId];
		}
		return undefined;
	}

	findRoomForToken(token: CharacterToken) {
		const rooms = worldstate.dungeon.levels[worldstate.currentLevel]?.rooms;
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
		const currentStep = worldstate.scripts.runningScript![worldstate.scripts.scriptStep!];
		let cleanUpStep = false;
		if (!currentStep) {
			worldstate.scripts.runningScript = undefined;
			worldstate.scripts.scriptStep = undefined;
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
				if (!worldstate.scripts.scriptStepStartMs) {
					this.scene.pause();
					worldstate.scripts.scriptStepStartMs = globalTime;
				} else if (worldstate.scripts.scriptStepStartMs + currentStep.time < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'fadeIn': {
				if (!worldstate.scripts.scriptStepStartMs) {
					this.scene.pause();
					worldstate.scripts.scriptStepStartMs = globalTime;
					this.scene.cameras.main.fadeIn(currentStep.time);
				} else if (worldstate.scripts.scriptStepStartMs + currentStep.time < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'fadeOut': {
				if (!worldstate.scripts.scriptStepStartMs) {
					this.scene.pause();
					worldstate.scripts.scriptStepStartMs = globalTime;
					this.scene.cameras.main.fadeOut(currentStep.time);
				} else if (worldstate.scripts.scriptStepStartMs + currentStep.time < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
				}
				break;
			}
			case 'dialog': {
				if (!worldstate.scripts.scriptStepStartMs) {
					this.scene.pause();
					worldstate.scripts.scriptStepStartMs = globalTime;
					worldstate.scripts.scriptSubStep = 0;
					this.scene.overlayScreens!.dialogScreen.setText(
						currentStep.text[worldstate.scripts.scriptSubStep!]
					);
					this.scene.overlayScreens!.dialogScreen.setVisible(true);
				} else if (
					worldstate.scripts.scriptStepStartMs + DIALOG_TEXT_TIME_MS < globalTime ||
					userCancelled
				) {
					worldstate.scripts.scriptSubStep = worldstate.scripts.scriptSubStep! + 1;
					if (currentStep.text.length <= worldstate.scripts.scriptSubStep) {
						this.scene.overlayScreens!.dialogScreen.setVisible(false);
						cleanUpStep = true;
						this.scene.resume();
					} else {
						this.scene.overlayScreens!.dialogScreen.setText(
							currentStep.text[worldstate.scripts.scriptSubStep!]
						);
						worldstate.scripts.scriptStepStartMs = globalTime;
					}
				}
				break;
			}
			case 'animation': {
				if (!worldstate.scripts.scriptStepStartMs) {
					this.scene.pause();
					worldstate.scripts.scriptStepStartMs = globalTime;
					if (currentStep.target === 'player') {
						worldstate.scripts.scriptAnimationFallback =
							this.scene.mainCharacter!.anims.currentAnim!.key;
						this.scene.mainCharacter!.play({
							key: currentStep.animation,
							frameRate: NORMAL_ANIMATION_FRAME_RATE,
						});
					}
				} else if (worldstate.scripts.scriptStepStartMs + currentStep.duration < globalTime) {
					cleanUpStep = true;
					this.scene.resume();
					this.scene.mainCharacter!.play({
						key: worldstate.scripts.scriptAnimationFallback!,
						frameRate: NORMAL_ANIMATION_FRAME_RATE,
					});
				}
				break;
			}
			case 'sceneChange': {
				cleanUpStep = true;
				worldstate.currentLevel = currentStep.target;
				worldstate.playerCharacter.x = 0;
				worldstate.playerCharacter.y = 0;
				this.scene.mainCharacter!.x = 0;
				this.scene.mainCharacter!.y = 0;
				this.scene.scene.start('RoomPreloaderScene');
				break;
			}
			case 'move': {
				cleanUpStep = true;
				if (currentStep.target === 'player') {
					if (!this.currentRoom) {
						this.currentRoom = this.findRoomForToken(this.scene.mainCharacter!);
					}
					this.scene.mainCharacter!.x =
						(this.currentRoom!.x + currentStep.posX) * TILE_WIDTH * SCALE;
					this.scene.mainCharacter!.y =
						(this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT * SCALE;
					const facing = getFacing8Dir(currentStep.facingX, currentStep.facingY);
					const playerAnimation = updateMovingState(
						worldstate.playerCharacter,
						false,
						facing,
						true
					);
					if (playerAnimation) {
						this.scene.mainCharacter!.play({
							key: playerAnimation,
							frameRate: NORMAL_ANIMATION_FRAME_RATE,
						});
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
					const animation = updateMovingState(worldstate.npcs[npcId], false, facing, true);
					if (animation) {
						this.scene.npcMap[npcId].play({
							key: animation,
							frameRate: NORMAL_ANIMATION_FRAME_RATE,
						});
					}
				}
				break;
			}
			case 'cast': {
				cleanUpStep = true;
				this.scene.abilityHelper!.triggerAbility(
					worldstate.playerCharacter,
					worldstate.playerCharacter,
					currentStep.ability,
					1,
					globalTime,
					1
				);
				break;
			}
			case 'walk': {
				if (currentStep.target === 'player') {
					this.scene.blockUserInteraction = true;
					const targetX = (this.currentRoom!.x + currentStep.posX) * TILE_WIDTH;
					const targetY = (this.currentRoom!.y + currentStep.posY) * TILE_HEIGHT;
					const mainCharacter = this.scene.mainCharacter!;
					const totalDistance =
						Math.abs(targetX - mainCharacter.x) + Math.abs(targetY - mainCharacter.y);
					const atTarget = totalDistance / SCALE < TILE_HEIGHT / 2;
					if (!atTarget) {
						const xFactor = (targetX - mainCharacter.x) / totalDistance;
						const yFactor = (targetY - mainCharacter.y) / totalDistance;
						const speed = getCharacterSpeed(worldstate.playerCharacter);
						mainCharacter.setVelocity(speed * xFactor, speed * yFactor);
						mainCharacter.body!.velocity.normalize().scale(speed);
						const newFacing = getFacing8Dir(xFactor, yFactor);
						const playerAnimation = updateMovingState(worldstate.playerCharacter, true, newFacing);
						if (playerAnimation) {
							mainCharacter.play({ key: playerAnimation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
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
					worldstate.dungeon.levels[worldstate.currentLevel].enemyLevel,
					currentStep.facingX || 0,
					currentStep.facingY || 0,
					{
						useSpawnAnimation: !!currentStep.useAnimation,
					}
				);
				break;
			}
			case 'openDoor': {
				cleanUpStep = true;
				this.scene.changeDoorState(
					`${worldstate.currentLevel}_${this.currentRoom!.roomName}_${currentStep.doorId}`,
					true
				);
				break;
			}
			case 'takeItem': {
				cleanUpStep = true;
				if (worldstate.inventory.bag[currentStep.itemId as UneqippableItem]) {
					worldstate.inventory.bag[currentStep.itemId as UneqippableItem]! -= currentStep.amount;
					if (worldstate.inventory.bag[currentStep.itemId as UneqippableItem]! < 0) {
						delete worldstate.inventory.bag[currentStep.itemId as UneqippableItem];
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
				if (!worldstate.scripts.pausedScripts) {
					worldstate.scripts.pausedScripts = [];
				}
				worldstate.scripts.pausedScripts.push({
					script: [...worldstate.scripts.runningScript!],
					scriptStep: worldstate.scripts.scriptStep!,
				});
				worldstate.scripts.runningScript = undefined;
				worldstate.scripts.scriptStep = 0;
				break;
			}
			case 'condition': {
				if (currentStep.conditionType === 'hasItem') {
					const itemId = currentStep.itemId as UneqippableItem;
					const hasMatchingItems = !!worldstate.inventory.bag[itemId!];
					if (hasMatchingItems) {
						cleanUpStep = true;
					} else {
						worldstate.scripts.runningScript = undefined;
						worldstate.scripts.scriptStep = undefined;
						return;
					}
				} else if (currentStep.scriptId) {
					const scriptId = `${worldstate.currentLevel}_${this.currentRoom!.roomName}_${
						currentStep.scriptId
					}`;
					if (currentStep.scriptState === 'new') {
						const state = worldstate.scripts.states && worldstate.scripts.states[scriptId];
						if (!state || state.state === 'new') {
							cleanUpStep = true;
						} else {
							worldstate.scripts.runningScript = undefined;
							worldstate.scripts.scriptStep = undefined;
							return;
						}
					} else if (currentStep.scriptState === 'finished') {
						const state = worldstate.scripts.states && worldstate.scripts.states[scriptId];
						if (!state || state.state !== 'finished') {
							worldstate.scripts.runningScript = undefined;
							worldstate.scripts.scriptStep = undefined;
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
				if (!worldstate.quests) {
					worldstate.quests = {};
				}
				worldstate.quests[currentStep.questId].questFinished =
					currentStep.questState === 'finished';
				worldstate.quests[currentStep.questId].questOngoing = currentStep.questState === 'ongoing';
				break;
			}
			case 'setScriptState': {
				cleanUpStep = true;
				const scriptId = `${worldstate.currentLevel}_${this.currentRoom!.roomName}_${
					currentStep.scriptId
				}`;
				if (!worldstate.scripts.states) {
					worldstate.scripts.states = {};
				}
				worldstate.scripts.states[scriptId] = {
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
					targetX = worldstate.playerCharacter.x * SCALE;
					targetY = worldstate.playerCharacter.y * SCALE;
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
			case 'setFollowerData': {
				cleanUpStep = true;
				worldstate.followers[currentStep.follower.id] = currentStep.follower;
				break;
			}
			case 'spawnFollower': {
				cleanUpStep = true;
				worldstate.activeFollower = currentStep.followerId;
				const playerCharacter = worldstate.playerCharacter;
				this.scene.spawnFollower(
					playerCharacter.x,
					playerCharacter.y,
					currentStep.followerId,
					currentStep.followerId
				);
				break;
			}
			case 'despawnFollower': {
				worldstate.activeFollower = '';
				this.scene.despawnFollower();
				break;
			}
			// To Do's:
			// Implememt item take and drop case (for example wizard scroll)
		}
		if (cleanUpStep) {
			worldstate.scripts.scriptStep = worldstate.scripts.scriptStep! + 1;
			worldstate.scripts.scriptSubStep = undefined;
			worldstate.scripts.scriptStepStartMs = undefined;
			worldstate.scripts.scriptAnimationFallback = undefined;
		}
	}

	handleNpcScriptStep(globalTime: number, token: CharacterToken) {
		const scriptState = worldstate.scripts.npcScriptStates![token.id];
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
						scriptState.animationFallback = token.anims.currentAnim!.key;
						token.play({ key: currentStep.animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
					} else if (scriptState.stepStartMs + currentStep.duration < globalTime) {
						cleanUpStep = true;
						token.play({
							key: worldstate.scripts.scriptAnimationFallback!,
							frameRate: NORMAL_ANIMATION_FRAME_RATE,
						});
					}
				} else {
					cleanUpStep = true;
					token.play({ key: currentStep.animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
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
				const animation = updateMovingState(worldstate.npcs[token.id], false, facing, true);
				if (animation) {
					token.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
				}
				break;
			}
			case 'walk': {
				if (!token || !worldstate.npcs[token.id]) {
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
					const speed = getCharacterSpeed(worldstate.npcs[token.id]);
					token.isBeingMoved = true;
					token.setVelocity(speed * xFactor, speed * yFactor);
					token.body!.velocity.normalize().scale(speed);
					const newFacing = getFacing8Dir(xFactor, yFactor);
					const animation = updateMovingState(worldstate.npcs[token.id], true, newFacing);
					if (animation) {
						token.play({ key: animation, frameRate: NORMAL_ANIMATION_FRAME_RATE });
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
		if (!worldstate.scripts.npcScriptStates) {
			worldstate.scripts.npcScriptStates = {};
		}
		if (!worldstate.scripts.npcScriptStates[token.id]) {
			worldstate.scripts.npcScriptStates[token.id] = {
				repetition: 0,
			};
		}
		const script = token.script!;
		if (
			script.repeat === -1 ||
			worldstate.scripts.npcScriptStates[token.id].repetition < script.repeat
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
		if (!worldstate.scripts.runningScript) {
			const lastRoomName = this.currentRoom?.roomName;
			this.currentRoom = this.findRoomForToken(this.scene.mainCharacter!);
			const currentRooomName = this.currentRoom?.roomName;
			if (lastRoomName !== currentRooomName) {
				if (
					lastRoomName &&
					worldstate.availableRooms[lastRoomName].scripts.onExit &&
					!this.isScriptFinished(`${worldstate.currentLevel}_${lastRoomName}_onExit`)
				) {
					worldstate.scripts.runningScript = worldstate.availableRooms[lastRoomName].scripts.onExit;
					worldstate.scripts.scriptStep = 0;
					const scriptId = `${worldstate.currentLevel}_${lastRoomName}_onExit`;
					worldstate.scripts.runningScriptId = scriptId;
				} else if (
					currentRooomName &&
					worldstate.availableRooms[currentRooomName].scripts.onEntry &&
					!this.isScriptFinished(`${worldstate.currentLevel}_${currentRooomName}_onEntry`)
				) {
					worldstate.scripts.runningScript =
						worldstate.availableRooms[currentRooomName].scripts.onEntry;
					worldstate.scripts.scriptStep = 0;
					const scriptId = `${worldstate.currentLevel}_${currentRooomName}_onEntry`;
					worldstate.scripts.runningScriptId = scriptId;
				}
			} else if (
				currentRooomName &&
				worldstate.availableRooms[currentRooomName].scripts.onClear &&
				!this.hasEnemiesInRoom(currentRooomName) &&
				!this.isScriptFinished(`${worldstate.currentLevel}_${currentRooomName}_onClear`)
			) {
				worldstate.scripts.runningScript =
					worldstate.availableRooms[currentRooomName].scripts.onClear;
				worldstate.scripts.scriptStep = 0;
				const scriptId = `${worldstate.currentLevel}_${currentRooomName}_onClear`;
				worldstate.scripts.runningScriptId = scriptId;
			}
		}
		if (worldstate.scripts.runningScript) {
			this.handleScriptStep(globalTime);
		}
	}

	isScriptRunning() {
		return !!worldstate.scripts.runningScript;
	}

	loadScript(script: ScriptEntry[]) {
		if (this.isScriptRunning()) {
			return false;
		}
		worldstate.scripts.runningScript = script;
		worldstate.scripts.scriptStep = 0;
	}

	handleScripts(globalTime: number) {
		this.handleRoomScripts(globalTime);
		this.handleNpcScripts(globalTime);
	}

	resumePausedScripts() {
		if (this.isScriptRunning()) {
			return;
		}
		if (!worldstate.scripts.pausedScripts || worldstate.scripts.pausedScripts.length === 0) {
			return;
		}
		const firstResumableScriptIndex = worldstate.scripts.pausedScripts.findIndex((pausedScript) => {
			const conditionStep = pausedScript.script[pausedScript.scriptStep] as ScriptPausedCondition;
			let allConditionsFullfilled = true;
			if (conditionStep.roomName) {
				const currentRoom = this.findRoomForToken(this.scene.mainCharacter!);
				if (!currentRoom || currentRoom.roomName !== conditionStep.roomName) {
					allConditionsFullfilled = false;
				}
			}
			(conditionStep.itemIds || []).forEach((itemId, index) => {
				const requiredCount = (conditionStep.itemQuantities || [])[index] || 1;
				const unequipedItemCount = worldstate.inventory.bag[itemId as UneqippableItem] || 0;
				if (unequipedItemCount < requiredCount) {
					allConditionsFullfilled = false;
				}
			});
			(conditionStep.questIds || []).forEach((questId, index) => {
				const requiredState = (conditionStep.questStates || [])[index] || 'started';
				switch (requiredState) {
					case 'startedOrFinished': {
						if (!worldstate.quests[questId]) {
							allConditionsFullfilled = false;
						}
						break;
					}
					case 'started': {
						if (!worldstate.quests[questId] || worldstate.quests[questId].questFinished) {
							allConditionsFullfilled = false;
						}
						break;
					}
					case 'notStarted': {
						if (worldstate.quests[questId]) {
							allConditionsFullfilled = false;
						}
						break;
					}
					case 'finished': {
						if (!worldstate.quests[questId] || !worldstate.quests[questId].questFinished) {
							allConditionsFullfilled = false;
						}
						break;
					}
					case 'notFinished': {
						if (worldstate.quests[questId] && worldstate.quests[questId].questFinished) {
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
		});
		if (firstResumableScriptIndex > -1) {
			worldstate.scripts.runningScript =
				worldstate.scripts.pausedScripts[firstResumableScriptIndex].script;
			worldstate.scripts.scriptStep =
				worldstate.scripts.pausedScripts[firstResumableScriptIndex].scriptStep + 1;
			worldstate.scripts.pausedScripts.splice(firstResumableScriptIndex, 1);
		}
	}
}
