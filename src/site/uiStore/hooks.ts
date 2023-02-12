import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, UIDispatch } from './uiStore';

// Use throughout game instead of plain useDispatch and useSelector
export const useUIDispatch = () => useDispatch<UIDispatch>();
export const useUISelector: TypedUseSelectorHook<RootState> = useSelector;
