import 'phaser';
import React, { useEffect, useRef, useState } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import firebase from 'firebase';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import '../App.css';
import { UserInformation } from '../../scripts/helpers/UserInformation';
import AbilityEditor from '../../scripts/scenes/AbilityEditor';

const showGame = true;

export interface AbilityEditorScreenProps {
	user: UserInformation;
}

const abilityData = {
	projectiles: 1,
	delay: 0,
	minSpread: 0,
	maxSpread: 0,
	velocity: 200,
	drag: 0,
};

const getData = () => abilityData;

export const AbilityEditorScreen = ({ user }: AbilityEditorScreenProps) => {
	const phaserRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveMode(MODE.ABILITY_EDITOR);
		const config = getGameConfig(phaserRef.current!, MODE.ABILITY_EDITOR);
		const game = new Phaser.Game(config);
		const callbackIntervalId = setInterval(() => {
			const abilityEditorScene = game.scene.getScene('AbilityEditor') as AbilityEditor | null;
			if (abilityEditorScene) {
				abilityEditorScene.registerReactBridge({
					getData,
				});
				clearInterval(callbackIntervalId);
			}
		}, 100);
	}, [showGame]);

	const [projectiles, setProjectiles] = useState<number>(1);
	const [delay, setDelay] = useState<number>(0);
	const [minSpread, setMinSpread] = useState<string>('0');
	const [maxSpread, setMaxSpread] = useState<string>('0');
	const [velocity, setVelocity] = useState<number>(200);
	const [drag, setDrag] = useState<number>(0);

	return (
		<PageContainer>
			<NavigationWrapper>
				<StyledLink to="/mapEditor">Map Editor</StyledLink>
				<StyledLink to="/npcEditor">NPC Editor</StyledLink>
				<StyledLink to="/questEditor">Quest Editor</StyledLink>
				<StyledLink to="/abilityEditor">Ability Editor</StyledLink>
				<StyledLink to="/game">Game</StyledLink>
			</NavigationWrapper>
			<PageWrapper>
				<AbilityEditorWrapper>
					<div>
						Projectiles
						<br />
						<input
							value={projectiles}
							onChange={(e) => {
								const newProjectiles = parseInt(e.target.value, 10);
								abilityData.projectiles = newProjectiles;
								setProjectiles(newProjectiles);
							}}
						/>
					</div>
					<div>
						Delay
						<br />
						<input
							value={delay}
							onChange={(e) => {
								const newDelay = parseInt(e.target.value, 10);
								abilityData.delay = newDelay;
								setDelay(newDelay);
							}}
						/>
					</div>
					<div>
						Spread from
						<br />
						<input
							value={minSpread}
							onChange={(e) => {
								setMinSpread(e.target.value);
								const newMinSpread = parseFloat(e.target.value);
								if (!isNaN(newMinSpread)) {
									abilityData.minSpread = newMinSpread;
								}
							}}
						/>
					</div>
					<div>
						Spread to
						<br />
						<input
							value={maxSpread}
							onChange={(e) => {
								setMaxSpread(e.target.value);
								const newMaxSpread = parseFloat(e.target.value);
								if (!isNaN(newMaxSpread)) {
									abilityData.maxSpread = newMaxSpread;
								}
							}}
						/>
					</div>
					<div>
						Velocity
						<br />
						<input
							value={velocity}
							onChange={(e) => {
								const newVelocity = parseInt(e.target.value, 10);
								abilityData.velocity = newVelocity;
								setVelocity(newVelocity);
							}}
						/>
					</div>
					<div>
						Drag
						<br />
						<input
							value={drag}
							onChange={(e) => {
								const newDrag = parseInt(e.target.value, 10);
								abilityData.drag = newDrag;
								setDrag(newDrag);
							}}
						/>
					</div>
				</AbilityEditorWrapper>
				<GameWrapper ref={phaserRef}></GameWrapper>
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

const GameWrapper = styled.div`
	flex-grow: 1;
`;

const AbilityEditorWrapper = styled.div`
	width: 200px;
	color: white;
	padding: 16px;
`;
