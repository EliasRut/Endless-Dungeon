import 'phaser';
import React, { useEffect, useRef } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import firebase from 'firebase';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import '../App.css';
import { UserInformation } from '../../scripts/helpers/UserInformation';

const showGame = true;

export interface AbilityEditorScreenProps {
	user: UserInformation;
}

export const AbilityEditorScreen = ({ user }: AbilityEditorScreenProps) => {
	const phaserRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveMode(MODE.ABILITY_EDITOR);
		const config = getGameConfig(phaserRef.current!, MODE.ABILITY_EDITOR);
		const game = new Phaser.Game(config);
	}, [showGame]);

	return (
		<PageContainer>
			<NavigationWrapper>
				<StyledLink to="/mapEditor">Map Editor</StyledLink>
				<StyledLink to="/npcEditor">NPC Editor</StyledLink>
				<StyledLink to="/questEditor">Quest Editor</StyledLink>
				<StyledLink to="/abilityEditor">Ability Editor</StyledLink>
				<StyledLink to="/game">Game</StyledLink>
			</NavigationWrapper>
			<PageWrapper></PageWrapper>
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

const StyledLink = styled(NavLink)`
	& {
		font-family: 'endlessDungeon';
		font-size: 2rem;
		padding: 6px 24px;
		cursor: pointer;
		text-decoration: none;
		color: black;
		background-color: #ffffff;
		border-style: solid;
		border-radius: 0.5rem;
		margin: 0 24px;
	}
	&.active {
		background-color: #a09f9f;
	}
`;

const PageWrapper = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
`;
