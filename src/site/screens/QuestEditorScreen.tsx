import 'phaser';
import React, { useEffect, useRef, useState } from 'react';
import { getGameConfig } from '../../scripts/game';
import { MODE, setActiveMode } from '../../scripts/helpers/constants';
import { Link, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import firebase from 'firebase';
import '../App.css';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { NpcData, ItemWithCount, ScriptEntry } from '../../../typings/custom';
import { Wait } from '../components/ScriptBlockTypes/Wait';
import { Condition } from '../components/ScriptBlockTypes/Condition';
import { ScriptTypeDropdown } from '../components/ScriptTypeDropdown';
import { PausedCondition } from '../components/ScriptBlockTypes/PausedCondition';
import { Move } from '../components/ScriptBlockTypes/Move';
import { Dialog } from '../components/ScriptBlockTypes/Dialog';
import { LargeTextArea } from '../components/LargeTextArea';
import { ItemData } from '../../items/itemData';

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
	scriptBlocks: (Partial<ScriptEntry> | { type: undefined })[];
	rewardBlocks: ItemWithCount[];
	preconditionBlocks: {
		previousQuests: string[];
		requiredItems: ItemWithCount[];
		dungeonLevelReached: number;
	};
}

export class QuestEditorScreen extends React.Component<QuestEditorScreenProps, QuestEditorState> {
	state: QuestEditorState = {
		npcs: [],
		questName: '',
		questGiver: '',
		questDescription: '',
		questPreconditions: '',
		scriptBlocks: [],
		rewardBlocks: [],
		preconditionBlocks: {
			previousQuests: [],
			requiredItems: [],
			dungeonLevelReached: 0,
		},
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

	replaceRewardBlockData(index: number, newData: any) {
		this.setState({
			rewardBlocks: [
				...this.state.rewardBlocks.slice(0, index),
				newData,
				...this.state.rewardBlocks.slice(index + 1),
			],
		});
	}

	removeRewardBlockData(index: number) {
		this.setState({
			rewardBlocks: [
				...this.state.rewardBlocks.slice(0, index),
				...this.state.rewardBlocks.slice(index + 1),
			],
		});
	}

	replaceQuestItemPreconditionBlockData(index: number, newData: any) {
		this.setState({
			preconditionBlocks: {
				...this.state.preconditionBlocks,
				requiredItems: [
					...this.state.preconditionBlocks.requiredItems.slice(0, index),
					newData,
					...this.state.preconditionBlocks.requiredItems.slice(index + 1),
				],
			},
		});
	}

	removeQuestItemPreconditionBlockData(index: number) {
		this.setState({
			preconditionBlocks: {
				...this.state.preconditionBlocks,
				requiredItems: [
					...this.state.preconditionBlocks.requiredItems.slice(0, index),
					...this.state.preconditionBlocks.requiredItems.slice(index + 1),
				],
			},
		});
	}

	replacePreviousQuestsPreconditionBlockData(index: number, newData: any) {
		this.setState({
			preconditionBlocks: {
				...this.state.preconditionBlocks,
				previousQuests: [
					...this.state.preconditionBlocks.previousQuests.slice(0, index),
					newData,
					...this.state.preconditionBlocks.previousQuests.slice(index + 1),
				],
			},
		});
	}

	removePreviousQuestsPreconditionBlockData(index: number) {
		this.setState({
			preconditionBlocks: {
				...this.state.preconditionBlocks,
				previousQuests: [
					...this.state.preconditionBlocks.previousQuests.slice(0, index),
					...this.state.preconditionBlocks.previousQuests.slice(index + 1),
				],
			},
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

	renderQuestReward(index: number, rewardBlock: ItemWithCount) {
		return (
			<ScriptBlockContainer>
				<CloseButtonContainer>
					<CloseButton onClick={() => this.removeRewardBlockData(index)}>
						<CloseButtonText>X</CloseButtonText>
					</CloseButton>
				</CloseButtonContainer>
				<ItemIdContainer>
					<Wrapper>
						<TextWrapper>Item Id</TextWrapper>
						<LargeDropdown
							id="questRewardItemId"
							value={rewardBlock.id}
							onChange={(e: any) =>
								this.replaceRewardBlockData(index, { id: e.target.value, count: rewardBlock.count })
							}
						>
							<option value="none"></option>
							{Object.entries(ItemData).map(([itemKey, itemData]) => (
								<option value={itemKey}>{itemData.name}</option>
							))}
						</LargeDropdown>
					</Wrapper>
				</ItemIdContainer>
				<ItemsContainer>
					<Wrapper>
						<TextWrapper>Item Quantity</TextWrapper>
						<Input
							id="questRewardItemQuantity"
							value={rewardBlock.count}
							onChange={(e: any) =>
								this.replaceRewardBlockData(index, { id: rewardBlock.id, count: e.target.value })
							}
						/>
					</Wrapper>
				</ItemsContainer>
			</ScriptBlockContainer>
		);
	}

	renderQuestItemPrecondition(index: number, questItemPreconditionBlock: ItemWithCount) {
		return (
			<ScriptBlockContainer>
				<CloseButtonContainer>
					<CloseButton onClick={() => this.removeQuestItemPreconditionBlockData(index)}>
						<CloseButtonText>X</CloseButtonText>
					</CloseButton>
				</CloseButtonContainer>
				<ItemIdContainer>
					<Wrapper>
						<TextWrapper>Item Id</TextWrapper>
						<LargeDropdown
							id="questItemPreconditionId"
							value={questItemPreconditionBlock.id}
							onChange={(e: any) =>
								this.replaceQuestItemPreconditionBlockData(index, {
									id: e.target.value,
									count: questItemPreconditionBlock.count,
								})
							}
						>
							<option value="none"></option>
							{Object.entries(ItemData).map(([itemKey, itemData]) => (
								<option value={itemKey}>{itemData.name}</option>
							))}
						</LargeDropdown>
					</Wrapper>
				</ItemIdContainer>
				<ItemsContainer>
					<Wrapper>
						<TextWrapper>Item Quantity</TextWrapper>
						<Input
							id="questItemPreconditionQuantity"
							value={questItemPreconditionBlock.count}
							onChange={(e: any) =>
								this.replaceQuestItemPreconditionBlockData(index, {
									id: questItemPreconditionBlock.id,
									count: e.target.value,
								})
							}
						/>
					</Wrapper>
				</ItemsContainer>
			</ScriptBlockContainer>
		);
	}

	// renderPreviousQuestsPrecondition(index: number, previousQuestsPreconditionBlock: string[]) {
	renderPreviousQuestsPrecondition(index: number) {
		return (
			<ScriptBlockContainer>
				<CloseButtonContainer>
					<CloseButton onClick={() => this.removePreviousQuestsPreconditionBlockData(index)}>
						<CloseButtonText>X</CloseButtonText>
					</CloseButton>
				</CloseButtonContainer>
				<ItemIdContainer>
					<Wrapper>
						<TextWrapper>Quest</TextWrapper>
						<LargeDropdown
							id="questItemPreconditionId"
							defaultValue="none"
							// value={previousQuestsPreconditionBlock}
							// onChange={(e: any) =>
							// 	this.replaceQuestItemPreconditionBlockData(index, {
							// 		id: e.target.value,
							// 		count: previousQuestsPreconditionBlock,
							// 	})
							// }
						>
							<option value="none"></option>
							{/* {Object.entries(ItemData).map(([itemKey, itemData]) => (
								<option value={itemKey}>{itemData.name}</option>
							))} */}
						</LargeDropdown>
					</Wrapper>
				</ItemIdContainer>
			</ScriptBlockContainer>
		);
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
								<div>Name</div>
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
								/>
							</InputWrapper>
							<InputWrapper>
								<div>Description</div>
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
								<div>Required Items</div>
								{this.state.preconditionBlocks.requiredItems.length > 0 ? (
									this.state.preconditionBlocks.requiredItems.map((requiredItem, index) => {
										return this.renderQuestItemPrecondition(index, requiredItem);
									})
								) : (
									<></>
								)}
								<AddButton
									onClick={() =>
										this.setState({
											preconditionBlocks: {
												...this.state.preconditionBlocks,
												requiredItems: [
													...this.state.preconditionBlocks.requiredItems,
													{ id: 'none', count: 1 },
												],
											},
										})
									}
								>
									<AddButtonText>+</AddButtonText>
								</AddButton>
							</InputWrapper>
							<InputWrapper>
								<div>Required (Finished) Quests</div>
								{this.state.preconditionBlocks.previousQuests.length > 0 ? (
									this.state.preconditionBlocks.previousQuests.map((previousQuest, index) => {
										return this.renderPreviousQuestsPrecondition(index);
									})
								) : (
									<></>
								)}
								<AddButton
									onClick={() =>
										this.setState({
											preconditionBlocks: {
												...this.state.preconditionBlocks,
												previousQuests: [...this.state.preconditionBlocks.previousQuests, 'new'],
											},
										})
									}
								>
									<AddButtonText>+</AddButtonText>
								</AddButton>
							</InputWrapper>
							<InputWrapper>
								<div>Required Dungeonlevel</div>
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
								<div>Rewards</div>
								{this.state.rewardBlocks.length > 0 ? (
									this.state.rewardBlocks.map((rewardBlocks, index) => {
										return this.renderQuestReward(index, rewardBlocks);
									})
								) : (
									<></>
								)}
								<AddButton
									onClick={() =>
										this.setState({
											rewardBlocks: [...this.state.rewardBlocks, { id: 'none', count: 1 }],
										})
									}
								>
									<AddButtonText>+</AddButtonText>
								</AddButton>
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
								<AddButtonText>+</AddButtonText>
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
`;

const ButtonWrapper = styled.div`
	margin-top: 18px;
`;

const StyledButton = styled.button`
	width: 100%;
	font-family: 'endlessDungeon';
	font-size: 1.8rem;
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
	min-width: 425px;
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
	width: 30px;
	margin-top: 12px;
	background-color: black;
	border: 0.5px solid #2ca831;
	border-radius: 4px;
	cursor: pointer;
`;

const ScriptBlockContainer = styled.div`
	margin-top: 12px;
	border: 2px solid white;
	padding: 0 12px 6px 12px;
	border-radius: 4px;
`;
const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	flex-grow: 1;
`;

const ItemsContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	margin-bottom: 12px;
`;

const ItemIdContainer = styled(ItemsContainer)`
	margin-top: 12px;
`;

const TextWrapper = styled.div`
	width: 200px;
	flex-shrink: 0;
	flex-grow: 0;
`;

const CloseButton = styled.button`
	width: 30px;
	height: 30px;
	background-color: black;
	border: 0.5px solid #9c1309;
	border-radius: 4px;
	cursor: pointer;
`;

const CloseButtonText = styled.p`
	font-family: 'endlessDungeon';
	font-size: 1rem;
	color: #9c1309;
	margin: 0 1px 0 2px;
`;

const AddButtonText = styled.p`
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
	color: #2ca831;
	margin: 0 1px 0 2px;
`;

const CloseButtonContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-left: 48px;
	margin-top: 12px;
`;
