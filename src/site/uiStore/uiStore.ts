import { configureStore } from '@reduxjs/toolkit';
import { activeScreenSlice } from './activeScrenSlice';

export const uiStore = configureStore({
	reducer: {
		activeScreen: activeScreenSlice.reducer,
	},
});

export type RootState = ReturnType<typeof uiStore.getState>;

export type UIDispatch = typeof uiStore.dispatch;
