import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum UIScreen {
	NONE,
	DIALOG,
	INVENTORY,
	QUEST_LOG,
	SETTINGS,
	MANAGE_CONTENT,
	ENCHANTMENT,
}

export const activeScreenSlice = createSlice({
	name: 'activeScreen',
	initialState: UIScreen.DIALOG,
	reducers: {
		setActiveScreen: (state, action: PayloadAction<UIScreen>) => action.payload,
	},
});
