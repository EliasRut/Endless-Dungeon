import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const AppLayout = (props: any) => (
	<Container {...props}>
		<Menu>
			<StyledLink to="/mapEditor">
				<Icon>🗻</Icon> Map Editor
			</StyledLink>
			<StyledLink to="/npcEditor">
				<Icon>🙋</Icon> NPC Editor
			</StyledLink>
			<StyledLink to="/questEditor">
				<Icon>🗹</Icon> Quest Editor
			</StyledLink>
			<StyledLink to="/abilityEditor">
				<Icon>🎇</Icon> Ability Editor
			</StyledLink>
			<StyledLink to="/game">
				<Icon>🎮</Icon> Game
			</StyledLink>
		</Menu>
		<MainContent>{props.children}</MainContent>
	</Container>
);

const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
	box-sizing: border-box;
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
`;

const Icon = styled.div`
	display: inline-block;
	width: 32px;
	text-align: center;
`;

const Menu = styled.div`
	width: 160px;
	display: flex;
	flex-direction: column;
`;

const MainContent = styled.div`
	width: calc(100vw - 140px);
`;

const StyledLink = styled(NavLink)`
	& {
		font-family: 'endlessDungeon';
		font-size: 1.3rem;
		padding: 12px 6px;
		cursor: pointer;
		text-decoration: none;
		color: #ddd;
	}
	&.active {
		color: #fff;
	}
	&:hover {
		background-color: #333;
	}
`;
