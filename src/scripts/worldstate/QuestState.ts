export interface QuestState {
	questGiverId: string;
	questFinished: boolean;
	states: {[name: string]: number | string | boolean};
}