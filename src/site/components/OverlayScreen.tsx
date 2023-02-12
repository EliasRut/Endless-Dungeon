import React from 'react';
import styled from 'styled-components';
import ContentManagementScreen from '../../scripts/screens/ContentManagementScreen';
import { DialogScreen } from '../../scripts/screens/DialogScreen';
import EnchantingScreen from '../../scripts/screens/EnchantingScreen';
import InventoryScreen from '../../scripts/screens/InventoryScreen';
import QuestLogScreen from '../../scripts/screens/QuestLogScreen';
import SettingsScreen from '../../scripts/screens/SettingsScreen';
import { UIScreen } from '../uiStore/activeScrenSlice';
import { useUISelector } from '../uiStore/hooks';

export const OverlayScreen = () => {
	const activeScreen = useUISelector((state) => state.activeScreen);

	const getActiveScreen = () => {
		switch (activeScreen) {
			case UIScreen.DIALOG: {
				return <DialogScreen />;
			}
			// case UIScreen.INVENTORY: {
			// 	return InventoryScreen;
			// }
			// case UIScreen.QUEST_LOG: {
			// 	return QuestLogScreen;
			// }
			// case UIScreen.SETTINGS: {
			// 	return SettingsScreen;
			// }
			// case UIScreen.MANAGE_CONTENT: {
			// 	return ContentManagementScreen;
			// }
			// case UIScreen.ENCHANTMENT: {
			// 	return EnchantingScreen;
			// }
			// default: {
			// 	return;
			// }
		}
	};

	return (
		<Container id="overlay" visible={activeScreen !== UIScreen.NONE}>
			{getActiveScreen()}
		</Container>
	);
};

const Container = styled.div<{ visible: boolean }>`
	display: ${(props) => (props.visible ? 'flex' : 'none')};
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 1000000;
`;
