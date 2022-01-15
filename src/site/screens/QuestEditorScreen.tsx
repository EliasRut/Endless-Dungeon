import 'phaser';
import React, { useEffect, useRef, useState } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import firebase from 'firebase';
import '../App.css';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { NpcData, ScriptEntry } from '../../../typings/custom';
import { Wait } from '../components/ScriptBlockTypes/Wait';
import { Condition } from '../components/ScriptBlockTypes/Condition';
import { ScriptTypeDropdown } from '../components/ScriptTypeDropdown';
import { PausedCondition } from '../components/ScriptBlockTypes/PausedCondition';
import { Move } from '../components/ScriptBlockTypes/Move';
import { Dialog } from '../components/ScriptBlockTypes/Dialog';
import { LargeTextArea } from '../components/LargeTextArea';

const showGame = true;

export interface QuestEditorScreenProps {
	user: firebase.User;
}

export interface QuestEditorState {
	npcs: {
		name: string;
		id: string;
	}[];
	questName: string;
	questGiver: string;
	questDescription: string;
	questPreconditions: string;
	questReward: string;
	scriptBlocks: (Partial<ScriptEntry> | { type: undefined })[];
}

export class QuestEditorScreen extends React.Component<QuestEditorScreenProps, QuestEditorState> {
	state: QuestEditorState = {
		npcs: [],
		questName: '',
		questGiver: '',
		questDescription: '',
		questPreconditions: '',
		questReward: '',
		scriptBlocks: [],
	};

	componentDidMount() {
		firebase
			.firestore()
			.collection('npcs')
			.get()
			.then((npcs) => {
				this.setState({
					npcs: npcs.docs.map((npcDoc) => {
						const npc = npcDoc.data() as NpcData;
						return {
							name: npc.name,
							id: npcDoc.id,
						};
					}),
				});
			});
	}

	replaceScriptBlockData(index: number, newData: any) {
		this.setState({
			scriptBlocks: [
				...this.state.scriptBlocks.slice(0, index),
				newData,
				...this.state.scriptBlocks.slice(index + 1),
			],
		});
	}

	removeScriptBlockData(index: number) {
		this.setState({
			scriptBlocks: [
				...this.state.scriptBlocks.slice(0, index),
				...this.state.scriptBlocks.slice(index + 1),
			],
		});
	}

	renderScriptBlockType(index: number, scriptBlock: Partial<ScriptEntry> | { type: undefined }) {
		if (!scriptBlock.type) {
			return (
				<ScriptBlockContainer>
					<ScriptTypeDropdown
						value="-"
						onChange={(value: string) => this.replaceScriptBlockData(index, { type: value })}
						onRemove={() => this.removeScriptBlockData(index)}
					/>
				</ScriptBlockContainer>
			);
		}
		switch (scriptBlock.type) {
			case 'wait': {
				return (
					<Wait
						currentData={{ type: 'wait', time: 1000, ...scriptBlock }}
						updateData={(newData) => this.replaceScriptBlockData(index, newData)}
						removeData={() => this.removeScriptBlockData(index)}
					/>
				);
			}
			case 'condition': {
				return (
					<Condition
						currentData={{
							type: 'condition',
							itemId: '',
							scriptId: '',
							scriptState: 'none',
							...scriptBlock,
						}}
						updateData={(newData) => this.replaceScriptBlockData(index, newData)}
						removeData={() => this.removeScriptBlockData(index)}
					/>
				);
			}
			case 'pauseUntilCondition': {
				return (
					<PausedCondition
						currentData={{
							type: 'pauseUntilCondition',
							itemIds: [],
							itemQuantities: [],
							questIds: [],
							questStates: ['none'],
							scriptIds: [],
							scriptStates: ['none'],
							roomName: '',
							...scriptBlock,
						}}
						updateData={(newData) => this.replaceScriptBlockData(index, newData)}
						removeData={() => this.removeScriptBlockData(index)}
					/>
				);
			}
			case 'dialog': {
				return (
					<Dialog
						currentData={{
							type: 'dialog',
							speaker: '',
							portrait: '',
							text: [],
							...scriptBlock,
						}}
						updateData={(newData) => this.replaceScriptBlockData(index, newData)}
						removeData={() => this.removeScriptBlockData(index)}
					/>
				);
			}
			case 'move': {
				return (
					<Move
						currentData={{
							type: 'move',
							target: '',
							posX: 0,
							posY: 0,
							facingX: 0,
							facingY: 0,
							...scriptBlock,
						}}
						updateData={(newData) => this.replaceScriptBlockData(index, newData)}
						removeData={() => this.removeScriptBlockData(index)}
					/>
				);
			}
			default: {
				return <></>;
			}
		}
	}

	render() {
		return (
			<PageContainer>
				<NavigationWrapper>
					<StyledLink to="/mapEditor">Map Editor</StyledLink>
					<StyledLink to="/npcEditor">NPC Editor</StyledLink>
					<StyledLink to="/questEditor">Quest Editor</StyledLink>
					<StyledLink to="/game">Game</StyledLink>
				</NavigationWrapper>
				<PageWrapper>
					<MenueWrapper id="questEditorMenu">
						<div>
							<div>Load Quest</div>
							<Dropdown id="questDropdown">
								<option>Loading...</option>
							</Dropdown>
							<ButtonWrapper>
								<StyledButton id="loadQuestButton">Load</StyledButton>
							</ButtonWrapper>
							<ButtonWrapper>
								<StyledButton id="saveQuestButton">Save</StyledButton>
							</ButtonWrapper>
						</div>
					</MenueWrapper>
					<QuestWrapper>
						<QuestContainer>
							<InputWrapper>
								<div>Quest Name</div>
								<LargeInput
									id="questName"
									value={this.state.questName}
									onChange={(e: any) =>
										this.setState({
											questName: e.target.value,
										})
									}
								/>
							</InputWrapper>
							<InputWrapper>
								<div>Quest Giver</div>
								<LargeInput
									id="questGiver"
									value={this.state.questGiver}
									onChange={(e: any) =>
										this.setState({
											questGiver: e.target.value,
										})
									}
								>
									{this.state.npcs.length > 0 ? (
										this.state.npcs.map((npc, index) => (
											<option value={npc.id} key={index}>
												{npc.name}
											</option>
										))
									) : (
										<option>Loading...</option>
									)}
								</LargeInput>
								<InputWrapper>
									<div>Quest Description</div>
									<LargeTextArea
										id="questDescription"
										value={this.state.questDescription}
										onChange={(e: any) =>
											this.setState({
												questDescription: e.target.value,
											})
										}
									/>
								</InputWrapper>
								<InputWrapper>
									<div>Quest Preconditions</div>
									<LargeInput
										id="questPreconditions"
										value={this.state.questPreconditions}
										onChange={(e: any) =>
											this.setState({
												questPreconditions: e.target.value,
											})
										}
									/>
								</InputWrapper>
								<InputWrapper>
									<div>Quest Reward</div>
									<LargeInput
										id="questReward"
										value={this.state.questReward}
										onChange={(e: any) =>
											this.setState({
												questReward: e.target.value,
											})
										}
									/>
								</InputWrapper>
							</InputWrapper>
						</QuestContainer>
						<ScriptContainer>
							<div>Script</div>
							{this.state.scriptBlocks.length > 0 ? (
								this.state.scriptBlocks.map((scriptBlock, index) => {
									return this.renderScriptBlockType(index, scriptBlock);
								})
							) : (
								<></>
							)}
							<AddButton
								onClick={() =>
									this.setState({ scriptBlocks: [...this.state.scriptBlocks, { type: undefined }] })
								}
							>
								<ButtonText>+</ButtonText>
							</AddButton>
						</ScriptContainer>
					</QuestWrapper>
				</PageWrapper>
			</PageContainer>
		);
	}
}

const PageContainer = styled.div`
	height: 100%;
	width: 100%;
	font-size: 2rem;
`;

const NavigationWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-content: center;
	padding: 24px 0;
`;

const StyledLink = styled(Link)`
	font-family: 'endlessDungeon';
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
	width: 245px;
	background-color: black;
	color: white;
	display: flex;
	flex-direction: column;
	font-family: 'endlessDungeon';
	font-size: 2rem;
	padding: 24px;
`;

const ButtonWrapper = styled.div`
	margin-top: 18px;
`;

const StyledButton = styled.button`
	width: 100%;
	font-family: 'endlessDungeon';
	font-size: 1.8rem;
	/* margin: 0; */
	/* padding: 8px; */
`;

const QuestWrapper = styled.div`
	margin-top: 12px;
	margin-left: 48px;
	display: flex;
	flex-direction: row;
	flex-grow: 1;
`;

const QuestContainer = styled.div`
	display: flex;
	flex-direction: column;
	min-width: 300px;
`;

const InputWrapper = styled.div`
	margin-top: 12px;
`;

const LargeInput = styled(Input)`
	width: 100%;
`;

const LargeDropdown = styled(Dropdown)`
	width: 100%;
`;

const ScriptContainer = styled.div`
	margin-left: 96px;
	margin-top: 12px;
	display: flex;
	flex-direction: column;
`;

const AddButton = styled.button`
	width: 24px;
	height: 30px;
	margin-top: 12px;
	background-color: black;
	border: 0.5px solid #2ca831;
	border-radius: 4px;
	cursor: pointer;
`;

const ButtonText = styled.text`
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
	color: #2ca831;
`;

const ScriptBlockContainer = styled.div`
	margin-top: 12px;
	border: 2px solid white;
	padding: 0 12px 6px 12px;
	border-radius: 4px;
	/* font-size: 1.5rem; */
`;
