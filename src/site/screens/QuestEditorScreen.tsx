import 'phaser';
import React from 'react';
import styled from 'styled-components';
import firebase from 'firebase';
import '../App.css';
import { Input } from '../components/Input';
import { ItemWithCount, ScriptEntry, Quest } from '../../../typings/custom';
import { LargeTextArea } from '../components/LargeTextArea';
import { QuestScripts } from '../../scripts/helpers/quests';
import { ScriptBlock } from '../components/ScriptBlock';
import {
	AddButton,
	ButtonWrapper,
	MenueElementWrapper,
	MenueWrapper,
	NotPaddedButtonWrapper,
	StyledButton,
	StyledLink,
} from '../components/StyledElements';
import { QuestReward } from '../components/QuestReward';
import { Dropdown } from '../components/Dropdown';
import { QuestItemPrecondition } from '../components/QuestItemPrecondition';
import { PreviousQuestPrecondition } from '../components/PreviousQuestPrecondition';
import { UserInformation } from '../../scripts/helpers/UserInformation';

export interface QuestEditorScreenProps {
	user: UserInformation;
}

export interface QuestEditorState {
	knownQuests: {
		id: string;
		name: string;
	}[];
	npcs: {
		name: string;
		id: string;
	}[];
	questName: string;
	questGiverId: string;
	questGiverName: string;
	questDescription: string;
	questPreconditions: string;
	scriptBlocks: (Partial<ScriptEntry> | { type: undefined })[];
	rewardBlocks: ItemWithCount[];
	preconditionBlocks: {
		previousQuests: string[];
		requiredItems: ItemWithCount[];
		dungeonLevelReached: number;
	};
	id?: string;
	scripts: QuestScripts;
}

export class QuestEditorScreen extends React.Component<QuestEditorScreenProps, QuestEditorState> {
	state: QuestEditorState = {
		knownQuests: [],
		npcs: [],
		questName: '',
		questGiverId: '',
		questGiverName: '',
		questDescription: '',
		questPreconditions: '',
		scriptBlocks: [],
		rewardBlocks: [],
		preconditionBlocks: {
			previousQuests: [],
			requiredItems: [],
			dungeonLevelReached: 0,
		},
		scripts: {
			intro: [],
		},
	};

	componentDidMount() {
		firebase
			.firestore()
			.collection('quests')
			.get()
			.then((quests) => {
				this.setState({
					knownQuests: quests.docs.map((questDoc) => {
						const quest = questDoc.data() as Quest;
						return {
							name: quest.name,
							id: questDoc.id,
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

	saveQuest() {
		const quest: Quest = {
			questGiverId: this.state.questGiverId,
			questGiverName: this.state.questGiverName,
			preconditions: this.state.preconditionBlocks,
			name: this.state.questName,
			goal: this.state.questDescription,
			rewards: this.state.rewardBlocks,
			scripts: {
				intro: this.state.scriptBlocks as ScriptEntry[],
			},
		};
		if (this.state.id) {
			firebase.firestore().collection('quests').doc(this.state.id).update(quest);
		} else {
			const questDoc = firebase.firestore().collection('quests').doc();
			const questId = questDoc.id;
			questDoc.set(quest);
			this.setState({ id: questId });
		}
	}

	async loadQuest() {
		if (!this.state.id) {
			return;
		}
		const questDoc = await firebase.firestore().collection('quests').doc(this.state.id).get();
		const quest: Quest = questDoc.data() as Quest;

		const questState = {
			questGiverId: quest.questGiverId!,
			questGiverName: quest.questGiverName!,
			preconditionBlocks: {
				previousQuests: quest.preconditions?.previousQuests || [],
				requiredItems: quest.preconditions?.requiredItems || [],
				dungeonLevelReached: quest.preconditions?.dungeonLevelReached || 0,
			},
			questName: quest.name,
			questDescription: quest.goal,
			rewardBlocks: quest.rewards || [],
			scriptBlocks: quest.scripts?.intro || [],
		};
		this.setState(questState);
	}

	clearFields() {
		if (!this.state.id) {
			return;
		}

		const clearedQuestState = {
			id: undefined,
			questGiverId: '',
			questGiverName: '',
			preconditionBlocks: {
				previousQuests: [],
				requiredItems: [],
				dungeonLevelReached: 0,
			},
			questName: '',
			questDescription: '',
			rewardBlocks: [],
			scriptBlocks: [],
		};

		this.setState(clearedQuestState);
	}

	render() {
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
					<MenueWrapper id="questEditorMenu">
						<MenueElementWrapper>
							<div>New Quest</div>
							<NotPaddedButtonWrapper>
								<StyledButton id="newQuestButton" onClick={() => this.clearFields()}>
									Create
								</StyledButton>
							</NotPaddedButtonWrapper>
						</MenueElementWrapper>
						<div>
							<div>Load Quest</div>
							<Dropdown
								id="questDropdown"
								onChange={(e: any) => this.setState({ id: e.target.value })}
							>
								<option value="">-</option>

								{this.state.knownQuests.map(({ id, name }) => (
									<option value={id}>{name}</option>
								))}
							</Dropdown>
							<ButtonWrapper>
								<StyledButton id="loadQuestButton" onClick={() => this.loadQuest()}>
									Load
								</StyledButton>
							</ButtonWrapper>
							<ButtonWrapper>
								<StyledButton
									id="saveQuestButton"
									onClick={() => {
										this.saveQuest();
										this.componentDidMount();
									}}
								>
									Save
								</StyledButton>
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
								<div>Quest Giver Id</div>
								<LargeInput
									id="questGiverId"
									value={this.state.questGiverId}
									onChange={(e: any) =>
										this.setState({
											questGiverId: e.target.value,
										})
									}
								/>
							</InputWrapper>
							<InputWrapper>
								<div>Quest Giver Name</div>
								<LargeInput
									id="questGiverName"
									value={this.state.questGiverName}
									onChange={(e: any) =>
										this.setState({
											questGiverName: e.target.value,
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
									this.state.preconditionBlocks.requiredItems.map((requiredItem, index) => (
										<QuestItemPrecondition
											onRemove={() => this.removeQuestItemPreconditionBlockData(index)}
											onItemIdChange={(newId: string) =>
												this.replaceQuestItemPreconditionBlockData(index, {
													id: newId,
													count: requiredItem.count,
												})
											}
											onItemCountChange={(newCount: number) =>
												this.replaceQuestItemPreconditionBlockData(index, {
													id: requiredItem.id,
													count: newCount,
												})
											}
											preconditionBlock={requiredItem}
										/>
									))
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
								/>
							</InputWrapper>
							<InputWrapper>
								<div>Required (Finished) Quests</div>
								{this.state.preconditionBlocks.previousQuests.length > 0 ? (
									this.state.preconditionBlocks.previousQuests.map((previousQuest, index) => (
										<PreviousQuestPrecondition
											onRemove={() => this.removePreviousQuestsPreconditionBlockData(index)}
											previousQuest={previousQuest}
											onQuestChange={(newQuest) =>
												this.replacePreviousQuestsPreconditionBlockData(index, newQuest)
											}
											knownQuests={this.state.knownQuests}
										/>
									))
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
								/>
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
									this.state.rewardBlocks.map((rewardBlock, index) => (
										<QuestReward
											rewardBlock={rewardBlock}
											onRemove={() => this.removeRewardBlockData(index)}
											onItemIdChange={(newId) =>
												this.replaceRewardBlockData(index, { id: newId, count: rewardBlock.count })
											}
											onItemCountChange={(newCount) =>
												this.replaceRewardBlockData(index, { id: rewardBlock.id, count: newCount })
											}
										/>
									))
								) : (
									<></>
								)}
								<AddButton
									onClick={() =>
										this.setState({
											rewardBlocks: [...this.state.rewardBlocks, { id: 'none', count: 1 }],
										})
									}
								/>
							</InputWrapper>
						</QuestContainer>
						<ScriptContainer>
							<div>Script</div>
							{this.state.scriptBlocks.length > 0 ? (
								this.state.scriptBlocks.map((scriptBlock, index) => (
									<ScriptBlock
										scriptBlock={scriptBlock}
										onChange={(value: string) =>
											this.replaceScriptBlockData(index, { type: value })
										}
										onRemove={() => this.removeScriptBlockData(index)}
										knownQuests={this.state.knownQuests}
									/>
								))
							) : (
								<></>
							)}
							<AddButton
								onClick={() =>
									this.setState({ scriptBlocks: [...this.state.scriptBlocks, { type: undefined }] })
								}
							/>
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

const PageWrapper = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: row;
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

const ScriptContainer = styled.div`
	margin-left: 96px;
	margin-top: 12px;
	display: flex;
	flex-direction: column;
`;
