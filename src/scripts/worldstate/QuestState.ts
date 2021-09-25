export interface QuestState {
	questGiverId: string;
	questOngoing?: boolean;
	questFinished: boolean;
	states: {[name: string]: number | string | boolean};
}