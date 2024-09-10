import React from 'react';
import CenteredContainer from '../components/CenteredContainer';
import { ButtonContainer, SiteHeader } from './StartScreen';
import styled from 'styled-components';
import '../App.css';

interface Props {
	auth: () => void;
}

export const Login: React.FC<Props> = ({ auth }) => {
	return (
		<CenteredContainer>
			<SiteHeader>
				Project <br /> Endless Dungeon
			</SiteHeader>
			<ButtonContainer>
				<StyledButton onClick={auth}>Login</StyledButton>
			</ButtonContainer>
		</CenteredContainer>
	);
};

const StyledButton = styled.button`
	font-family: 'endlessDungeon';
	font-size: 3rem;
	padding: 6px 24px;
	cursor: pointer;
	color: white;
	background-color: black;
	border-style: solid;
	border-radius: 0.5rem;
	border-color: white;
	box-shadow: 2px 2px 8px #c3c3c3;
`;
