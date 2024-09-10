import 'phaser';
import { useEffect, useRef, useState } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import styled from 'styled-components';
import { Dropdown } from '../components/Dropdown';
import MapEditor from '../../scripts/scenes/MapEditor';
import { NpcPositioning, NpcScriptStep } from '../../../typings/custom';
import { UserInformation } from '../../scripts/helpers/UserInformation';
import { AppLayout } from '../components/AppLayout';
import { DropdownMenu, DropdownMenuOption } from '../components/DropdownMenu';
import { ToolsBar } from '../components/ToolsBar';
import '../App.css';

export interface MapEditorScreenProps {
	user: UserInformation;
}

const showGame = true;

const renderScriptStep: (props: { step: NpcScriptStep }) => JSX.Element = ({ step }) => {
	switch (step.type) {
		case 'wait': {
			return (
				<div>
					Wait <InlineInput value={step.time} /> ms
				</div>
			);
		}
		case 'move': {
			return (
				<div>
					Move to <InlineInput value={step.posX} />, <InlineInput value={step.posY} />
				</div>
			);
		}
		case 'walk': {
			return (
				<div>
					Walk to <InlineInput value={step.posX} />, <InlineInput value={step.posY} />
				</div>
			);
		}
		case 'animation': {
			return (
				<div>
					Play Animation <InlineInput value={step.animation} /> for{' '}
					<InlineInput value={step.duration} /> ms
				</div>
			);
		}
	}
};

export const MapEditorScreen = ({ user }: MapEditorScreenProps) => {
	const phaserRef = useRef<HTMLDivElement>(null);

	const [activeNpc, setActiveNpc] = useState<NpcPositioning | undefined>(undefined);
	const [isNpcDialogVisible, setNpcDialogVisible] = useState<boolean>(false);

	useEffect(() => {
		setActiveMode(MODE.MAP_EDITOR);
		const config = getGameConfig(phaserRef.current!, MODE.MAP_EDITOR);
		const game = new Phaser.Game(config);
		const callbackIntervalId = setInterval(() => {
			const mapEditorScene = game.scene.getScene('MapEditor') as MapEditor | null;
			if (mapEditorScene) {
				mapEditorScene.registerReactBridge({
					setActiveNpc,
					setNpcDialogVisible,
				});
				clearInterval(callbackIntervalId);
			}
		}, 100);
	}, [showGame]);

	return (
		<AppLayout>
			<ToolsBar>
				<DropdownMenu
					text="File"
					contentWidth={240}
					options={[
						<DropdownMenuOption id="createNewButton">Create New</DropdownMenuOption>,
						<div>
							<LoadRoomHeader>Load Room</LoadRoomHeader>
							<div>
								<Dropdown id="roomDropdown">
									<option>Loading...</option>
								</Dropdown>
								<StyledButton id="loadRoomButton">Load</StyledButton>
								<StyledButton id="loadFromAutosaveRoomButton">Load from Autosave</StyledButton>
							</div>
						</div>,
						<DropdownMenuOption id="exportButton">Save</DropdownMenuOption>,
						<DropdownMenuOption id="showDetailsButton">Show Details</DropdownMenuOption>,
					]}
				/>
				<SelectionWrapper>
					<SelectedLayerHeader>Selected Layer</SelectedLayerHeader>
					<Dropdown id="activeLayerDropdown">
						<option value="base">1 - Base Layer</option>
						<option value="decoration">2 - Decoration Layer</option>
						<option value="overlay">3 - Overlay Layer</option>
						<option value="npcs">4 - NPC Placement</option>
						<option value="items">5 - Item Placement</option>
					</Dropdown>
				</SelectionWrapper>
			</ToolsBar>
			<PageWrapper>
				<MenueWrapper id="mapEditorMenu"></MenueWrapper>
				<GameWrapper ref={phaserRef}></GameWrapper>
			</PageWrapper>
			<NpcDetailsDialog id="npcDetailsDialog" $isVisible={isNpcDialogVisible}>
				<DialogTitle>NPC Details</DialogTitle>
				<TwoColumnLayout>
					<Column>
						<InputWrapper>
							<div>Id</div>
							<Input
								id="npcId"
								value={activeNpc?.id || ''}
								onChange={(e: any) => setActiveNpc({ ...activeNpc!, id: e.target.value! })}
							/>
						</InputWrapper>
						<InputWrapper>
							<div>Type</div>
							<Dropdown
								id="npcType"
								value={activeNpc?.type || ''}
								onChange={(e: any) => setActiveNpc({ ...activeNpc!, type: e.target.value! })}
							>
								<option>Loading...</option>
							</Dropdown>
						</InputWrapper>
						<InputWrapper>
							<div>Level</div>
							<Input
								id="npcLevel"
								value={activeNpc?.level}
								onChange={(e: any) => setActiveNpc({ ...activeNpc!, level: e.target.value! })}
							/>
						</InputWrapper>
						<InputWrapper>
							<div>Tile X Position</div>
							<Input
								id="npcX"
								value={activeNpc?.x || 0}
								onChange={(e: any) =>
									setActiveNpc({ ...activeNpc!, x: parseInt(e.target.value!, 10) })
								}
							/>
						</InputWrapper>
						<InputWrapper>
							<div>Tile Y Position</div>
							<Input
								id="npcY"
								value={activeNpc?.y || 0}
								onChange={(e: any) =>
									setActiveNpc({ ...activeNpc!, y: parseInt(e.target.value!, 10) })
								}
							/>
						</InputWrapper>
					</Column>
					<Column>
						<NpcScriptsContainer>
							<div>Scripts</div>
							{(activeNpc?.script?.steps || []).map((step) => renderScriptStep({ step }))}
						</NpcScriptsContainer>
					</Column>
				</TwoColumnLayout>
				<ButtonWrapper>
					<StyledButton id="npcSaveButton">Save</StyledButton>
				</ButtonWrapper>
				<ButtonWrapper style={{ marginTop: 24 }}>
					<StyledRedButton id="npcDeleteButton">Delete</StyledRedButton>
				</ButtonWrapper>
			</NpcDetailsDialog>
			<ItemDetailsDialog id="itemDetailsDialog">
				<DialogTitle>Item Details</DialogTitle>
				<InputWrapper>
					<div>Type</div>
					<Dropdown id="itemId">
						<option>Loading...</option>
					</Dropdown>
				</InputWrapper>
				<InputWrapper>
					<div>Tile X Position</div>
					<Input id="itemX" />
				</InputWrapper>
				<InputWrapper>
					<div>Tile Y Position</div>
					<Input id="itemY" />
				</InputWrapper>
				<ButtonWrapper>
					<StyledButton id="itemSaveButton">Save</StyledButton>
				</ButtonWrapper>
				<ButtonWrapper style={{ marginTop: 24 }}>
					<StyledRedButton id="itemDeleteButton">Delete</StyledRedButton>
				</ButtonWrapper>
			</ItemDetailsDialog>
			<MapDetailsDialog id="mapDetailsDialog">
				<DialogTitle>Map Details</DialogTitle>
				<TwoColumnLayout>
					<Column>
						<InputWrapper>
							<div>Room Name</div>
							<Input id="roomName" />
						</InputWrapper>
						<InputWrapper>
							<div>Room Width</div>
							<Input id="roomWidth" width={4} />
						</InputWrapper>
						<InputWrapper>
							<div>Room Height</div>
							<Input id="roomHeight" width={4} />
						</InputWrapper>
						<ButtonWrapper>
							<StyledButton id="detailsCancelButton">Cancel</StyledButton>
						</ButtonWrapper>
					</Column>
					<Column>
						<InputWrapper>
							<div>Base TileSet</div>
							<Dropdown id="tilesetDropdown">
								<option>Loading...</option>
							</Dropdown>
						</InputWrapper>
						<InputWrapper>
							<div>Decoration TileSet</div>
							<Dropdown id="tilesetDecorationDropdown">
								<option>Loading...</option>
							</Dropdown>
						</InputWrapper>
						<InputWrapper>
							<div>Overlay TileSet</div>
							<Dropdown id="tilesetOverlayDropdown">
								<option>Loading...</option>
							</Dropdown>
						</InputWrapper>
						<ButtonWrapper>
							<StyledButton id="detailsSaveButton">Create</StyledButton>
						</ButtonWrapper>
					</Column>
				</TwoColumnLayout>
			</MapDetailsDialog>
			<DownloadAnker id="downloadAnchorElem"></DownloadAnker>
		</AppLayout>
	);
};

const InlineInput = styled.input`
	display: inline-block;
	width: 60px;
`;

const PageContainer = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
`;

const LoadRoomHeader = styled.div`
	margin-top: 16px;
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
	/* padding: 8px; */
`;

const StyledRedButton = styled(StyledButton)`
	& {
		background-color: #cc0000;
		color: #fff;
		border: 1px solid #fff;
	}
	&:hover {
		background-color: #dd2222;
	}
`;

const SelectionWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

const SelectedLayerHeader = styled.div`
	font-size: 1.2rem;
`;

const InputWrapper = styled.div`
	margin-top: 12px;
`;

const Input = styled.input`
	width: 100%;
	font-family: 'endlessDungeon';
	font-size: 1.4rem;
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

const NpcDetailsDialog = styled.div<{ $isVisible: boolean }>`
	display: ${(props) => (props.$isVisible ? 'flex' : 'none')};
	position: fixed;
	top: 50%;
	right: 5%;
	width: 400px;
	height: 460px;
	margin-top: -230px;
	background-color: #333c;
	border: 2px solid #cccccc;
	box-shadow: 4px 4px 4px 4px #0009;
	flex-direction: column;
	padding: 24px;
`;

const MapDetailsDialog = styled.div`
	display: none;
	position: fixed;
	top: 50%;
	right: 50%;
	width: 420px;
	height: 300px;
	margin-top: -150px;
	margin-left: -210px;
	background-color: #333c;
	border: 2px solid #cccccc;
	box-shadow: 4px 4px 4px 4px #0009;
	flex-direction: column;
	padding: 24px;
`;

const ItemDetailsDialog = styled.div`
	display: none;
	position: fixed;
	top: 50%;
	right: 5%;
	width: 148px;
	height: 360px;
	margin-top: -200px;
	background-color: #333c;
	border: 2px solid #cccccc;
	box-shadow: 4px 4px 4px 4px #0009;
	flex-direction: column;
	padding: 24px;
`;

const DialogTitle = styled.h2`
	color: #fff;
	font-family: 'endlessDungeon';
	font-size: 2rem;
	margin: 0;
`;

const TwoColumnLayout = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;
const Column = styled.div`
	display: flex;
	flex-direction: column;
`;

const NpcScriptsContainer = styled.div`
	width: 200px;
	flex-grow: 1;
	margin-left: 16px;
	max-height: 300px;
`;
