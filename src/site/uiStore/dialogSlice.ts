import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DialogSliceState {
	activeDialogId: string | undefined;
}

const initialState: DialogSliceState = {
	activeDialogId: undefined,
};

export const dialogSlice = createSlice({
	name: 'activeDialog',
	initialState,
	reducers: {
		setActiveDialog: (state, action: PayloadAction<string | undefined>) => {
			state.activeDialogId = action.payload;
		},
	},
});

export const { setActiveDialog } = dialogSlice.actions;
