import React from 'react';
import styled from 'styled-components';
import { Dropdown } from '../Dropdown';
import { LargeInput } from '../LargeInput';
import { Input } from '../Input';
import { ScriptBlockContainer } from '../ScriptBlockContainer';
import { ScriptTypeDropdown } from '../ScriptTypeDropdown';

export interface PausedConditionProps {
	currentData: {
		type: 'pauseUntilCondition';
		itemIds?: string[];
		itemQuantities?: number[];
		questIds?: string[];
		questStates?: (
			| 'none'
			| 'started'
			| 'notStarted'
			| 'startedOrFinished'
			| 'finished'
			| 'notFinished'
		)[];
		scriptIds?: string[];
		scriptStates?: ('none' | 'new' | 'ongoing' | 'finished')[];
		roomName?: string;
	};
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const PausedCondition = (props: PausedConditionProps) => {
	return (
		<ScriptBlockContainer>
			<ScriptTypeDropdown
				value={props.currentData.type}
				onChange={(value: string) =>
					props.updateData({
						type: value,
					})
				}
				onRemove={() => props.removeData()}
			/>
			<SectionWrapper>
				<HeaderWrapper>Items</HeaderWrapper>
				{(props.currentData.itemIds || []).map((itemId, index) => {
					return (
						<ItemsContainer>
							<Wrapper>
								<TextWrapper>Item Id</TextWrapper>
								<Input
									id="pausedConditionItemId"
									value={itemId}
									onChange={(e: any) =>
										props.updateData({
											...props.currentData,
											itemIds: [
												...props.currentData.itemIds!.slice(0, index),
												e.target.value,
												...props.currentData.itemIds!.slice(index + 1),
											],
										})
									}
								/>
							</Wrapper>
							<RightWrapper>
								<TextWrapper>Item Quantities</TextWrapper>
								<Input
									id="pausedConditionItemQuantity"
									value={props.currentData.itemQuantities![index]}
									onChange={(e: any) =>
										props.updateData({
											...props.currentData,
											itemQuantities: [
												...props.currentData.itemQuantities!.slice(0, index),
												parseInt(e.target.value, 10) || 0,
												...props.currentData.itemQuantities!.slice(index + 1),
											],
										})
									}
								/>
							</RightWrapper>
							<CloseButton
								onClick={() =>
									props.updateData({
										...props.currentData,
										itemIds: [
											...props.currentData.itemIds!.slice(0, index),
											...props.currentData.itemIds!.slice(index + 1),
										],
										itemQuantities: [
											...props.currentData.itemQuantities!.slice(0, index),
											...props.currentData.itemQuantities!.slice(index + 1),
										],
									})
								}
							>
								<CloseButtonText>X</CloseButtonText>
							</CloseButton>
						</ItemsContainer>
					);
				})}
				<AddButton
					onClick={() =>
						props.updateData({
							...props.currentData,
							itemIds: [...(props.currentData.itemIds || []), ''],
							itemQuantities: [...(props.currentData.itemQuantities || []), 1],
						})
					}
				>
					<AddButtonText>+</AddButtonText>
				</AddButton>
			</SectionWrapper>
			<SectionWrapper>
				<HeaderWrapper>Quests</HeaderWrapper>
				{(props.currentData.questIds || []).map((questId, index) => {
					return (
						<ItemsContainer>
							<Wrapper>
								<TextWrapper>Quest Id</TextWrapper>
								<Input
									id="pausedConditionQuestId"
									value={questId}
									onChange={(e: any) =>
										props.updateData({
											...props.currentData,
											questIds: [
												...props.currentData.questIds!.slice(0, index),
												e.target.value,
												...props.currentData.questIds!.slice(index + 1),
											],
										})
									}
								/>
							</Wrapper>
							<RightWrapper>
								<TextWrapper>Quest State</TextWrapper>
								<Dropdown
									id="pausedConditionQuestState"
									value={props.currentData.questStates![index]}
									onChange={(e: any) =>
										props.updateData({
											...props.currentData,
											questStates: [
												...props.currentData.questStates!.slice(0, index),
												e.target.value,
												...props.currentData.questStates!.slice(index + 1),
											],
										})
									}
								>
									<option value="none"></option>
									<option value="started">started</option>
									<option value="notStarted">not started</option>
									<option value="startedOrFinished">started or finished</option>
									<option value="finished">finished</option>
									<option value="notFinished">not finished</option>
								</Dropdown>
							</RightWrapper>
							<CloseButton
								onClick={() =>
									props.updateData({
										...props.currentData,
										questIds: [
											...props.currentData.questIds!.slice(0, index),
											...props.currentData.questIds!.slice(index + 1),
										],
										questStates: [
											...props.currentData.questStates!.slice(0, index),
											...props.currentData.questStates!.slice(index + 1),
										],
									})
								}
							>
								<CloseButtonText>X</CloseButtonText>
							</CloseButton>
						</ItemsContainer>
					);
				})}
				<AddButton
					onClick={() =>
						props.updateData({
							...props.currentData,
							questIds: [...(props.currentData.questIds || []), ''],
							questStates: [...(props.currentData.questStates || []), ''],
						})
					}
				>
					<AddButtonText>+</AddButtonText>
				</AddButton>
			</SectionWrapper>
			<SectionWrapper>
				<HeaderWrapper>Scripts</HeaderWrapper>
				{(props.currentData.scriptIds || []).map((scriptId, index) => {
					return (
						<ItemsContainer>
							<Wrapper>
								<TextWrapper>Script Id</TextWrapper>
								<Input
									id="pausedConditionScriptId"
									value={scriptId}
									onChange={(e: any) =>
										props.updateData({
											...props.currentData,
											scriptIds: [
												...props.currentData.scriptIds!.slice(0, index),
												e.target.value,
												...props.currentData.scriptIds!.slice(index + 1),
											],
										})
									}
								/>
							</Wrapper>
							<RightWrapper>
								<TextWrapper>Script State</TextWrapper>
								<Dropdown
									id="pausedConditionScriptState"
									value={props.currentData.scriptStates![index]}
									onChange={(e: any) =>
										props.updateData({
											...props.currentData,
											scriptStates: [
												...props.currentData.scriptStates!.slice(0, index),
												e.target.value,
												...props.currentData.scriptStates!.slice(index + 1),
											],
										})
									}
								>
									<option value="none"></option>
									<option value="new">new</option>
									<option value="ongoing">ongoing</option>
									<option value="finished">finished</option>
								</Dropdown>
							</RightWrapper>
							<CloseButton
								onClick={() =>
									props.updateData({
										...props.currentData,
										scriptIds: [
											...props.currentData.scriptIds!.slice(0, index),
											...props.currentData.scriptIds!.slice(index + 1),
										],
										scriptStates: [
											...props.currentData.scriptStates!.slice(0, index),
											...props.currentData.scriptStates!.slice(index + 1),
										],
									})
								}
							>
								<CloseButtonText>X</CloseButtonText>
							</CloseButton>
						</ItemsContainer>
					);
				})}
				<AddButton
					onClick={() =>
						props.updateData({
							...props.currentData,
							scriptIds: [...(props.currentData.scriptIds || []), ''],
							scriptStates: [...(props.currentData.scriptStates || []), ''],
						})
					}
				>
					<AddButtonText>+</AddButtonText>
				</AddButton>
			</SectionWrapper>
			<Wrapper>
				<TextWrapper>Room Name</TextWrapper>
				<LargeInput
					id="pausedConditionRoomName"
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							roomName: e.target.value,
						})
					}
				/>
			</Wrapper>
		</ScriptBlockContainer>
	);
};

const SectionWrapper = styled.div`
	margin-top: 12px;
	margin-bottom: 12px;
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
`;

const RightWrapper = styled.div`
	margin: 0 48px 0 96px;
	display: flex;
	flex-direction: row;
`;

const ItemsContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
`;

const AddButton = styled.button`
	width: 24px;
	height: 30px;
	/* margin-top: 12px; */
	background-color: black;
	border: 0.5px solid #2ca831;
	border-radius: 4px;
	cursor: pointer;
`;

const AddButtonText = styled.text`
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
	color: #2ca831;
`;

const TextWrapper = styled.div`
	width: 140px;
`;

const HeaderWrapper = styled.div`
	margin-bottom: 12px;
`;

const CloseButton = styled.button`
	width: 22px;
	height: 24px;
	background-color: black;
	border: 0.5px solid #9c1309;
	border-radius: 4px;
	cursor: pointer;
`;

const CloseButtonText = styled.text`
	font-family: 'endlessDungeon';
	font-size: 1rem;
	color: #9c1309;
`;
