import styled from 'styled-components';
import { LargeDropdown } from './LargeDropdown';

export interface ScriptTypeDropdownProps {
	onChange: (value: string) => void;
	value: string;
	onRemove: () => void;
}

export const ScriptTypeDropdown = (props: ScriptTypeDropdownProps) => (
	<SingleInputWrapper>
		<ButtonContainer>
			<CloseButton onClick={() => props.onRemove()}>
				<ButtonText>X</ButtonText>
			</CloseButton>
		</ButtonContainer>
		<TypeContainer>
			<TextWrapper>Type</TextWrapper>
			<LargeDropdown
				id="scriptType"
				onChange={(e: any) => props.onChange(e.target.value)}
				value={props.value}
			>
				<option value="placeholder">-</option>
				<option value="wait">Wait</option>
				<option value="condition">Condition</option>
				<option value="pauseUntilCondition">Pause Until Condition</option>
				<option value="dialog">Dialog</option>
				<option value="move">Move</option>
				<option value="setQuestState">Set Quest State</option>
				<option value="setFollowerData">Set Follower Data</option>
				<option value="spawnFollower">Spawn Follower</option>
				<option value="despawnFollower">Despawn Follower</option>
			</LargeDropdown>
		</TypeContainer>
	</SingleInputWrapper>
);

const SingleInputWrapper = styled.div`
	margin-top: 12px;
	margin-bottom: 12px;
	display: flex;
	flex-direction: row-reverse;
	align-items: center;
	justify-content: space-between;
`;

const ButtonContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 48px;
`;

const CloseButton = styled.button`
	width: 30px;
	height: 30px;
	background-color: black;
	border: 0.5px solid #9c1309;
	border-radius: 4px;
	cursor: pointer;
`;

const ButtonText = styled.p`
	font-family: 'endlessDungeon';
	font-size: 1rem;
	color: #9c1309;
	margin: 0 1px 0 2px;
`;

const TypeContainer = styled.div`
	display: flex;
	flex-direction: row;
`;

const TextWrapper = styled.div`
	width: 200px;
	flex-shrink: 0;
	flex-grow: 0;
`;
