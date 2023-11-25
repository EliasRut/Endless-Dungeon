import React from 'react';
import styled from 'styled-components';
import { ItemWithCount } from '../../../typings/custom';
import { ItemData } from '../../items/itemData';
import { Input } from './Input';
import {
	CloseButton,
	ItemIdContainer,
	ItemsContainer,
	LargeDropdown,
	ScriptBlockContainer,
	TextWrapper,
	Wrapper,
} from './StyledElements';

export interface QuestRewardProps {
	onRemove: () => void;
	rewardBlock: ItemWithCount;
	onItemIdChange: (value: string) => void;
	onItemCountChange: (value: number) => void;
}

export const QuestReward: (props: QuestRewardProps) => JSX.Element = ({
	onRemove,
	rewardBlock,
	onItemIdChange,
	onItemCountChange,
}) => {
	return (
		<ScriptBlockContainer>
			<CloseButton onClick={onRemove} />
			<ItemIdContainer>
				<Wrapper>
					<TextWrapper>Item Id</TextWrapper>
					<LargeDropdown
						value={rewardBlock.id}
						onChange={(e: any) => onItemIdChange(e.target.value)}
					>
						<option value="none"></option>
						{Object.entries(ItemData).map(([itemKey, itemData]) => (
							<option value={itemKey}>{itemData.name}</option>
						))}
					</LargeDropdown>
				</Wrapper>
			</ItemIdContainer>
			<ItemsContainer>
				<Wrapper>
					<TextWrapper>Item Quantity</TextWrapper>
					<Input
						value={rewardBlock.count}
						onChange={(e: any) => onItemCountChange(e.target.value)}
					/>
				</Wrapper>
			</ItemsContainer>
		</ScriptBlockContainer>
	);
};
