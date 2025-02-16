import { ScriptEntry } from '../../typings/custom';

export interface NpcScriptState {
	repetition: number;
	step?: number;
	stepStartMs?: number;
	animationFallback?: string;
}

export interface PausedScriptState {
	script: ScriptEntry[];
	scriptStep: number;
}

export interface SingleScriptState {
	id: string;
	state: 'new' | 'finished';
}

export default interface ScriptState {
	runningScriptId?: string;
	runningScript?: ScriptEntry[];
	scriptStep?: number;
	scriptSubStep?: number;
	scriptStepStartMs?: number;
	scriptAnimationFallback?: string;
	npcScriptStates?: { [npcId: string]: NpcScriptState };
	pausedScripts?: PausedScriptState[];
	states?: { [id: string]: SingleScriptState };
}
