import styled from 'styled-components';
import Follower from '../../../types/Follower';
import { LargeInput } from '../LargeInput';
import { ScriptBlockContainer } from '../ScriptBlockContainer';
import { ScriptTypeDropdown } from '../ScriptTypeDropdown';

export interface SetFollowerDataProps {
	currentData: {
		type: 'setFollowerData';
		follower: Follower;
	};
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const SetFollowerData = (props: SetFollowerDataProps) => {
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
				<TextWrapper>Id</TextWrapper>
				<LargeInput
					id="followerId"
					value={props.currentData.follower.id}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							follower: {
								...props.currentData.follower,
								id: e.target.value,
							},
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Animation Base</TextWrapper>
				<LargeInput
					id="followerAnimationBase"
					value={props.currentData.follower.animationBase}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							follower: {
								...props.currentData.follower,
								animationBase: e.target.value,
							},
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Health</TextWrapper>
				<LargeInput
					id="followerHealth"
					value={props.currentData.follower.health}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							follower: {
								...props.currentData.follower,
								health: parseInt(e.target.value, 10),
							},
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Damage</TextWrapper>
				<LargeInput
					id="followerDamage"
					value={props.currentData.follower.damage}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							follower: {
								...props.currentData.follower,
								damage: parseInt(e.target.value, 10),
							},
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Movement Speed</TextWrapper>
				<LargeInput
					id="followerMovementSpeed"
					value={props.currentData.follower.movementSpeed}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							follower: {
								...props.currentData.follower,
								movementSpeed: parseInt(e.target.value, 10),
							},
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Level</TextWrapper>
				<LargeInput
					id="followerLevel"
					value={props.currentData.follower.level}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							follower: {
								...props.currentData.follower,
								level: e.target.value,
							},
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Ability</TextWrapper>
				<LargeInput
					id="followerAbility"
					value={props.currentData.follower.ability}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							follower: {
								...props.currentData.follower,
								ability: e.target.value,
							},
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
