import {
	CloseButton,
	ItemIdContainer,
	LargeDropdown,
	ScriptBlockContainer,
	TextWrapper,
	Wrapper,
} from './StyledElements';

export interface PreviousQuestPreconditionProps {
	onRemove: () => void;
	previousQuest: string;
	onQuestChange: (value: string) => void;
	knownQuests: {
		id: string;
		name: string;
	}[];
}

export const PreviousQuestPrecondition: (props: PreviousQuestPreconditionProps) => JSX.Element = ({
	onRemove,
	previousQuest,
	onQuestChange,
	knownQuests,
}) => {
	return (
		<ScriptBlockContainer>
			<CloseButton onClick={onRemove} />
			<ItemIdContainer>
				<Wrapper>
					<TextWrapper>Quest</TextWrapper>
					<LargeDropdown
						id="questItemPreconditionId"
						value={previousQuest}
						onChange={(e: any) => onQuestChange(e.target.value)}
					>
						<option value="none"></option>
						{knownQuests.map(({ id, name }) => (
							<option value={id}>{name}</option>
						))}
					</LargeDropdown>
				</Wrapper>
			</ItemIdContainer>
		</ScriptBlockContainer>
	);
};
