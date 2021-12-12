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
				<StyledLink to="/scriptEditor">Quest Editor</StyledLink>
				<StyledLink to="/game">Game</StyledLink>
			</NavigationWrapper>
			<PageWrapper>
				<MenueWrapper id="scriptEditorMenu">
					<div>
						<div>Load Quest:</div>
						<Dropdown id="roomDropdown">
							<option>Loading...</option>
						</Dropdown>
						<ButtonWrapper>
							<StyledButton id="loadRoomButton">Load</StyledButton>
						</ButtonWrapper>
					</div>
				</MenueWrapper>
				<ScriptWrapper>
					<ScriptContainer>
						<DropdownContainer>
							<div>Room</div>
							<Dropdown id="roomDropdown">
								<option>Loading...</option>
							</Dropdown>
						</DropdownContainer>
						<div>NPCs</div>
						<div>On Exit:</div>
					</ScriptContainer>
				</ScriptWrapper>
			</PageWrapper>
		</PageContainer>
	);
};

const PageContainer = styled.div`
	height: 100%;
	width: 100%;
	font-size: 1.2rem;
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
	width: 140px;
	font-family: 'munro';
	font-size: 1rem;
	margin: 0;
	padding: 8px;
`;

const ScriptWrapper = styled.div`
	margin-top: 24px;
	margin-left: 48px;
	display: flex;
	flex-direction: row;
	flex-grow: 1;
`;

const ScriptContainer = styled.div`
	display: flex;
	flex-direction: column;
`;

const DropdownContainer = styled.div`
	margin-bottom: 24px;
	display: flex;
	flex-direction: column;
`;
