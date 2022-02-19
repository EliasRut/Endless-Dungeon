import React from 'react';
import styled from 'styled-components';
import { LargeInput } from '../LargeInput';
import { ScriptBlockContainer } from '../ScriptBlockContainer';
import { ScriptTypeDropdown } from '../ScriptTypeDropdown';

export interface MoveProps {
	currentData: {
		type: 'move';
		target?: string;
		posX: number;
		posY: number;
		facingX: number;
		facingY: number;
	};
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const Move = (props: MoveProps) => {
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
				<TextWrapper>Target</TextWrapper>
				<LargeInput
					id="moveTarget"
					value={props.currentData.target}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							target: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>X-Position</TextWrapper>
				<LargeInput
					id="moveXPosition"
					value={props.currentData.posX}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							posX: parseInt(e.target.value, 10) || 0,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Y-Position</TextWrapper>
				<LargeInput
					id="moveXPosition"
					value={props.currentData.posY}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							posY: parseInt(e.target.value, 10) || 0,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>X-Facing</TextWrapper>
				<LargeInput
					id="moveXFacing"
					value={props.currentData.facingX}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							facingX: parseInt(e.target.value, 10) || 0,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Y-Facing</TextWrapper>
				<LargeInput
					id="moveYFacing"
					value={props.currentData.facingY}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							facingY: parseInt(e.target.value, 10) || 0,
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
