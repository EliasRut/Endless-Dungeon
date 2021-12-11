import 'phaser';
import React, { useEffect, useRef } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import firebase from 'firebase';
import '../App.css';

const showGame = true;

export interface ScriptEditorScreenProps {
	user: firebase.User;
}

export const ScriptEditorScreen = ({ user }: ScriptEditorScreenProps) => {
	const phaserRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveMode(MODE.NPC_EDITOR);
		const config = getGameConfig(phaserRef.current!, MODE.NPC_EDITOR);
		const game = new Phaser.Game(config);
	}, [showGame]);

	return (
		<PageContainer>
			<NavigationWrapper>
				<StyledLink to="/mapEditor">Map Editor</StyledLink>
				<StyledLink to="/npcEditor">NPC Editor</StyledLink>
				<StyledLink to="/scriptEditor">Script Editor</StyledLink>
				<StyledLink to="/game">Game</StyledLink>
			</NavigationWrapper>
			<PageWrapper>
				<MenueWrapper id="scriptEditorMenu">
					<div>
						<div>Load Room:</div>
						<Dropdown id="roomDropdown">
							<option>Loading...</option>
						</Dropdown>
						<ButtonWrapper>
							<StyledButton id="loadRoomButton">Load</StyledButton>
						</ButtonWrapper>
					</div>
				</MenueWrapper>
				<ScriptList>
					<ScriptContainer>
						<div>On Entry:</div>
						<div>On Clear:</div>
						<div>On Exit:</div>
					</ScriptContainer>
				</ScriptList>
			</PageWrapper>
		</PageContainer>
	);
};

const PageContainer = styled.div`
	height: 100%;
	width: 100%;
`;

const NavigationWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-content: center;
	padding: 24px 0;
`;

const StyledLink = styled(Link)`
	font-family: 'munro';
	font-size: 2rem;
	padding: 6px 24px;
	cursor: pointer;
	text-decoration: none;
	color: black;
	background-color: white;
	border-style: solid;
	border-radius: 0.5rem;
	margin: 0 24px;
`;

const PageWrapper = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
`;

const MenueWrapper = styled.div`
	background-color: black;
	color: white;
	display: flex;
	flex-direction: column;
	font-family: 'munro';
	font-size: 1.2rem;
	padding: 24px;
`;

const Dropdown = styled.select`
	width: 140px;
	font-family: 'munro';
	font-size: 1rem;
`;

const ButtonWrapper = styled.div`
	margin-top: 18px;
`;

const StyledButton = styled.button`
	width: 120px;
	font-family: 'munro';
	font-size: 1rem;
	margin: 0 10px;
	padding: 8px;
`;

const ScriptList = styled.div`
	margin-top: 48px;
	display: flex;
	flex-direction: row;
`;

const ScriptContainer = styled.div`
	margin-top: 48px;
	display: flex;
	flex-direction: column;
`;
