import 'phaser';
import React from 'react';
import CenteredContainer from '../components/CenteredContainer';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import { UserInformation } from '../../scripts/helpers/UserInformation';

export interface StartScreenProps {
	auth: () => void;
	user: UserInformation | undefined;
}

export const StartScreen = ({ auth, user }: StartScreenProps) => {
	return (
		<CenteredContainer>
			<SiteHeader>
				Project <br /> Endless Dungeon
			</SiteHeader>
			<ButtonContainer>
				<StyledLinkButton to="/game">Game</StyledLinkButton>
				{user ? (
					<StyledLinkButton to="/mapEditor">Tools</StyledLinkButton>
				) : (
					<StyledButton onClick={auth}>Login</StyledButton>
				)}
			</ButtonContainer>
		</CenteredContainer>
	);
};

export const SiteHeader = styled.h1`
	font-size: 8rem;
	letter-spacing: 4px;
	text-align: center;
	text-shadow: 4px 4px 4px #c3c3c3;
`;

export const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-evenly;
	align-items: center;
`;

const StyledButton = styled.button`
	font-family: 'endlessDungeon';
	font-size: 3rem;
	padding: 6px 24px;
	cursor: pointer;
	text-decoration: none;
	color: white;
	border-style: solid;
	border-radius: 0.5rem;
	border-color: white;
	box-shadow: 2px 2px 8px #c3c3c3;
	background-color: #000;
`;

const StyledLinkButton = styled(Link)`
	font-family: 'endlessDungeon';
	font-size: 3rem;
	padding: 6px 24px;
	cursor: pointer;
	text-decoration: none;
	color: white;
	border-style: solid;
	border-radius: 0.5rem;
	border-color: white;
	box-shadow: 2px 2px 8px #c3c3c3;
`;
