import styled from 'styled-components';
import { LargeDropdown } from '../LargeDropdown';
import { ScriptBlockContainer } from '../ScriptBlockContainer';
import { ScriptTypeDropdown } from '../ScriptTypeDropdown';

export interface SetQuestStateProps {
	currentData: {
		type: 'setQuestState';
		questId: string;
		questState: 'new' | 'ongoing' | 'finished';
	};
	availableQuests: {
		id: string;
		name: string;
	}[];
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const SetQuestState = (props: SetQuestStateProps) => {
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
			<Wrapper>
				<TextWrapper>Quest</TextWrapper>
				<LargeDropdown
					id="questId"
					value={props.currentData.questId}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							questId: e.target.value,
						})
					}
				>
					<option value="none"></option>
					{props.availableQuests.map(({ id, name }) => (
						<option value={id}>{name}</option>
					))}
				</LargeDropdown>
			</Wrapper>
			<Wrapper>
				<TextWrapper>State</TextWrapper>
				<LargeDropdown
					id="questState"
					value={props.currentData.questState}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							questState: e.target.value,
						})
					}
				>
					<option value="none"></option>
					<option value="new">New</option>
					<option value="ongoing">Ongoing</option>
					<option value="finished">Finished</option>
				</LargeDropdown>
			</Wrapper>
		</ScriptBlockContainer>
	);
};

const Wrapper = styled.div`
	margin-top: 12px;
	margin-bottom: 12px;
	display: flex;
	flex-direction: row;
`;

const TextWrapper = styled.div`
	width: 200px;
	flex-shrink: 0;
	flex-grow: 0;
`;
