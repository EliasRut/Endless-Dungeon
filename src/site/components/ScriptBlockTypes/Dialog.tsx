import React from 'react';
import styled from 'styled-components';
import { LargeDropdown } from '../LargeDropdown';
import { LargeInput } from '../LargeInput';
import { LargeTextArea } from '../LargeTextArea';
import { ScriptBlockContainer } from '../ScriptBlockContainer';
import { ScriptTypeDropdown } from '../ScriptTypeDropdown';

export interface DialogProps {
	currentData: {
		type: 'dialog';
		speaker: string;
		portrait?: string;
		text: string[];
	};
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const Dialog = (props: DialogProps) => {
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
				<TextWrapper>Speaker</TextWrapper>
				<LargeInput
					id="dialogSpeaker"
					value={props.currentData.speaker}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							speaker: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Portrait</TextWrapper>
				<LargeInput
					id="dialogPortrait"
					value={props.currentData.portrait}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							portrait: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Text</TextWrapper>
				<LargeTextArea
					id="dialogText"
					value={props.currentData.text}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							text: e.target.value,
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
