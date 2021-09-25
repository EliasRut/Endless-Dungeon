import 'phaser';
import React, { useEffect, useRef } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import '../App.css';

const showGame = true;

export const MapEditorScreen = () => {
	const phaserRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setActiveMode(MODE.MAP_EDITOR);
		const config = getGameConfig(phaserRef.current!, MODE.MAP_EDITOR);
		const game = new Phaser.Game(config);
	}, [showGame]);

	return (
		<PageContainer>
			<NavigationWrapper>
				<StyledLink to='/mapEditor'>Map Editor</StyledLink>
				<StyledLink to='/npcEditor'>NPC Editor</StyledLink>
				<StyledLink to='/game'>Game</StyledLink>
			</NavigationWrapper>
			<PageWrapper>
				<MenueWrapper id='mapEditorMenu'>
					<div>
						<div>Load Room:</div>
						<Dropdown
							id='roomDropdown'
						>
							<option>Loading...</option>
						</Dropdown>
						<ButtonWrapper>
							<StyledButton id='loadRoomButton'>Load</StyledButton>
						</ButtonWrapper>
						<ButtonWrapper>
							<StyledButton id='loadFromAutosaveRoomButton'>Load from Autosave</StyledButton>
						</ButtonWrapper>
					</div>
					<SelectionWrapper>
						<InputWrapper>
							<div>Room Name</div>
							<Input id='roomName' />
						</InputWrapper>
						<InputWrapper>
							<div>Room Width</div>
							<Input id='roomWidth' width={4} />
						</InputWrapper>
						<InputWrapper>
							<div>Room Height</div>
							<Input id='roomHeight' width={4} />
						</InputWrapper>
						<InputWrapper>
							<div>Base TileSet</div>
							<Dropdown
								id='tilesetDropdown'
							><option>Loading...</option></Dropdown>
						</InputWrapper>
						<InputWrapper>
							<div>Decoration TileSet</div>
							<Dropdown
								id='tilesetDecorationDropdown'
							><option>Loading...</option></Dropdown>
						</InputWrapper>
						<InputWrapper>
							<div>Overlay TileSet</div>
							<Dropdown
								id='tilesetOverlayDropdown'
							><option>Loading...</option></Dropdown>
						</InputWrapper>
						<ButtonWrapper>
							<StyledButton id='goButton'>Go</StyledButton>
						</ButtonWrapper>
					</SelectionWrapper>
					<SelectionWrapper>
						<div>Selected Layer</div>
						<Dropdown
							id='activeLayerDropdown'
						>
							<option value='base'>Base Layer</option>
							<option value='decoration'>Decoration Layer</option>
							<option value='overlay'>Overlay Layer</option>
						</Dropdown>
					</SelectionWrapper>
					<ExportButtonWrapper>
						<StyledButton id='exportButton'>Export</StyledButton>
					</ExportButtonWrapper>
				</MenueWrapper>
				<GameWrapper ref={phaserRef}></GameWrapper>
			</PageWrapper>
			<DownloadAnker id='downloadAnchorElem'></DownloadAnker>
		</PageContainer>
	);
};

const PageContainer = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
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

const NavigationWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-content: center;
	padding: 24px 0;
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

const SelectionWrapper = styled.div`
	margin-top: 48px;
	display: flex;
	flex-direction: column;
`;

const InputWrapper = styled.div`
	margin-top: 12px;
`;

const Input = styled.input`
	width: 140px;
	font-family: 'munro';
	font-size: 1rem;
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