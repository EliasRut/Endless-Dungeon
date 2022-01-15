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

const showGame = true;

export interface NPCEditorScreenProps {
	user: firebase.User;
}

export const NPCEditorScreen = ({ user }: NPCEditorScreenProps) => {
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
				<StyledLink to="/questEditor">Quest Editor</StyledLink>
				<StyledLink to="/game">Game</StyledLink>
			</NavigationWrapper>
			<PageWrapper>
				<MenueWrapper id="npcEditorMenu">
					<div>
						<div>Load NPC:</div>
						<Dropdown id="npcDropdown">
							<option>Loading...</option>
						</Dropdown>
						<ButtonWrapper>
							<StyledButton id="loadNpcButton">Load</StyledButton>
						</ButtonWrapper>
					</div>
					<SelectionWrapper>
						<InputWrapper>
							<div>NPC Id</div>
							<Input id="npcId" />
						</InputWrapper>
						<InputWrapper>
							<div>NPC Name</div>
							<Input id="npcName" width={4} />
						</InputWrapper>
						<InputWrapper>
							<div>Body template</div>
							<Dropdown id="bodyDropdown">
								<option value="body-1">body-1</option>
							</Dropdown>
						</InputWrapper>
						<InputWrapper>
							<div>Hair template</div>
							<Dropdown id="hairDropdown">
								<option value="hair-1">hair-1</option>
								<option value="hair-2">hair-2</option>
							</Dropdown>
						</InputWrapper>
						<InputWrapper>
							<div>Shirt dropdown</div>
							<Dropdown id="shirtDropdown">
								<option value="shirt-1">shirt-1</option>
							</Dropdown>
						</InputWrapper>
						<InputWrapper>
							<div>Pants dropdown</div>
							<Dropdown id="pantsDropdown">
								<option value="pants-1">pants-1</option>
							</Dropdown>
						</InputWrapper>
					</SelectionWrapper>
					<ExportButtonWrapper>
						<StyledButton id="exportButton">Save</StyledButton>
					</ExportButtonWrapper>
				</MenueWrapper>
				<GameWrapper ref={phaserRef}></GameWrapper>
				<ColorManagerWrapper>
					<ColorSelectionWrapper>
						<div>Body color</div>
						<Input type="color" id="bodyColor" />
					</ColorSelectionWrapper>
					<ColorSelectionWrapper>
						<div>Eye color</div>
						<Input type="color" id="eyeColor" />
					</ColorSelectionWrapper>
					<ColorSelectionWrapper>
						<div>Hair template</div>
						<Input type="color" id="hairColor" />
					</ColorSelectionWrapper>
					<ColorSelectionWrapper>
						<div>Shirt Color 1</div>
						<Input type="color" id="shirtColor1" />
					</ColorSelectionWrapper>
					<ColorSelectionWrapper>
						<div>Shirt Color 2</div>
						<Input type="color" id="shirtColor2" />
					</ColorSelectionWrapper>
					<ColorSelectionWrapper>
						<div>Pants Color</div>
						<Input type="color" id="pantsColor" />
					</ColorSelectionWrapper>
					<ColorSelectionWrapper>
						<div>Shoes Color</div>
						<Input type="color" id="shoesColor" />
					</ColorSelectionWrapper>
				</ColorManagerWrapper>
			</PageWrapper>
			<DownloadAnker id="downloadAnchorElem"></DownloadAnker>
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

const MenueWrapper = styled.div`
	width: 245px;
	background-color: black;
	color: white;
	display: flex;
	flex-direction: column;
	font-family: 'endlessDungeon';
	font-size: 2rem;
	padding: 24px;
	padding-top: 0;
`;

const ButtonWrapper = styled.div`
	margin-top: 18px;
`;

const StyledButton = styled.button`
	width: 100%;
	font-family: 'endlessDungeon';
	font-size: 1.8rem;
	/* margin: 0 10px; */
	/* padding: 8px; */
`;

const SelectionWrapper = styled.div`
	margin-top: 48px;
	display: flex;
	flex-direction: column;
`;

const InputWrapper = styled.div`
	margin-top: 12px;
`;

const ExportButtonWrapper = styled.div`
	margin-top: 60px;
`;

const GameWrapper = styled.div`
	flex-grow: 1;
`;

const DownloadAnker = styled.a`
	display: none;
`;

const ColorManagerWrapper = styled.div`
	background-color: black;
	color: white;
	display: flex;
	flex-direction: column;
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
	padding: 24px;
`;

const ColorSelectionWrapper = styled.div`
	margin-top: 6px;
`;
