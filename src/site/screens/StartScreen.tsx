import 'phaser';
import React from 'react';
import CenteredContainer from '../components/CenteredContainer';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const StartScreen = () => {
	return (
		<CenteredContainer>
			<SiteHeader>
				Project <br /> Endless Dungeon
			</SiteHeader>
			<ButtonContainer>
				<StyledButton to="/game">Game</StyledButton>
				<StyledButton to="/mapEditor">Tools</StyledButton>
			</ButtonContainer>
		</CenteredContainer>
	);
};

const SiteHeader = styled.h1`
	font-size: 8rem;
	letter-spacing: 4px;
	text-align: center;
	text-shadow: 4px 4px 4px #c3c3c3;
`;

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-evenly;
	align-items: center;
`;

const StyledButton = styled(Link)`
	font-family: 'munro';
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
