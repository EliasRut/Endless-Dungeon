import React from 'react';
import styled from 'styled-components';
import { LargeDropdown } from '../LargeDropdown';
import { LargeInput } from '../LargeInput';
import { ScriptBlockContainer } from '../ScriptBlockContainer';
import { ScriptTypeDropdown } from '../ScriptTypeDropdown';

export interface ConditionProps {
	currentData: {
		type: 'condition';
		itemId?: string;
		scriptId?: string;
		scriptState?: 'none' | 'new' | 'ongoing' | 'finished';
	};
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const Condition = (props: ConditionProps) => {
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
				<TextWrapper>Item Id</TextWrapper>
				<LargeInput
					id="conditionItemId"
					value={props.currentData.itemId}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							itemId: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Script Id</TextWrapper>
				<LargeInput
					id="conditionScriptId"
					value={props.currentData.scriptId}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							scriptId: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Script State</TextWrapper>
				<LargeDropdown
					id="conditionScriptState"
					value={props.currentData.scriptState}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							scriptState: e.target.value,
						})
					}
				>
					<option value="none"></option>
					<option value="new">new</option>
					<option value="ongoing">ongoing</option>
					<option value="finished">finished</option>
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
