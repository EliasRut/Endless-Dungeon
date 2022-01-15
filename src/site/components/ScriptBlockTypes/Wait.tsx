import React from 'react';
import styled from 'styled-components';
import { LargeInput } from '../LargeInput';
import { ScriptBlockContainer } from '../ScriptBlockContainer';
import { ScriptTypeDropdown } from '../ScriptTypeDropdown';

export interface WaitProps {
	currentData: {
		type: 'wait';
		time: number;
	};
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const Wait = (props: WaitProps) => {
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
				<TextWrapper>Time</TextWrapper>
				<LargeInput
					id="waitTime"
					value={props.currentData.time}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							time: parseInt(e.target.value, 10) || 0,
						})
					}
				/>
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
