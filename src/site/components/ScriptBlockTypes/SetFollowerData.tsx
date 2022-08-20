import React from 'react';
import styled from 'styled-components';
import { AbilityType } from '../../../scripts/abilities/abilityData';
import { LargeInput } from '../LargeInput';
import { ScriptBlockContainer } from '../ScriptBlockContainer';
import { ScriptTypeDropdown } from '../ScriptTypeDropdown';

export interface SetFollowerDataProps {
	currentData: {
		type: 'setFollowerData';
		id: string;
		animationBase: string;
		health: number;
		damage: number;
		movementSpeed: number;
		level: number;
		ability: string;
		// ability: AbilityType;
	};
	updateData: (newData: any) => void;
	removeData: () => void;
}

export const SetFollowerData = (props: SetFollowerDataProps) => {
	return (
		<ScriptBlockContainer>
			<Wrapper>
				<TextWrapper>Id</TextWrapper>
				<LargeInput
					id="followerId"
					value={props.currentData.id}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							id: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Animation Base</TextWrapper>
				<LargeInput
					id="followerAnimationBase"
					value={props.currentData.animationBase}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							animationBase: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Health</TextWrapper>
				<LargeInput
					id="followerHealth"
					value={props.currentData.health}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							health: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Damage</TextWrapper>
				<LargeInput
					id="followerDamage"
					value={props.currentData.damage}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							damage: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Movement Speed</TextWrapper>
				<LargeInput
					id="followerMovementSpeed"
					value={props.currentData.movementSpeed}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							movementSpeed: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Level</TextWrapper>
				<LargeInput
					id="followerLevel"
					value={props.currentData.level}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							level: e.target.value,
						})
					}
				/>
			</Wrapper>
			<Wrapper>
				<TextWrapper>Ability</TextWrapper>
				<LargeInput
					id="followerAbility"
					value={props.currentData.ability}
					onChange={(e: any) =>
						props.updateData({
							...props.currentData,
							ability: e.target.value,
						})
					}
				/>
			</Wrapper>
			{/* <ScriptTypeDropdown
				value={props.currentData.ability}
				onChange={(value: string) =>
					props.updateData({
						ability: value,
					})
				}
				onRemove={() => props.removeData()}
			/> */}
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
