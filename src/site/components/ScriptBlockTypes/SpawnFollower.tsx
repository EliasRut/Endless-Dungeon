import React from 'react';
import styled from 'styled-components';
import { LargeInput } from '../LargeInput';
import { ScriptBlockContainer } from '../ScriptBlockContainer';

export interface SpawnFollowerProps {
	currentData: {
		type: 'spawnFollower';
		followerId: string;
	};
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const SpawnFollower = (props: SpawnFollowerProps) => {
	return (
		<ScriptBlockContainer>
			<Wrapper>
				<TextWrapper>Follower Id</TextWrapper>
				<LargeInput
					id="spawnFollowerId"
					value={props.currentData.followerId}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							followerId: e.target.value,
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
