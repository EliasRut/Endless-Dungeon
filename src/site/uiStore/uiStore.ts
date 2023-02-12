import { configureStore } from '@reduxjs/toolkit';
import { activeScreenSlice } from './activeScrenSlice';
import { dialogSlice } from './dialogSlice';

export const uiStore = configureStore({
	reducer: {
		activeScreen: activeScreenSlice.reducer,
		dialog: dialogSlice.reducer,
	},
});

export type RootState = ReturnType<typeof uiStore.getState>;

export type UIDispatch = typeof uiStore.dispatch;
