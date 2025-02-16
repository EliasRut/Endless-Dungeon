import React from 'react';
import styled from 'styled-components';

export interface DropdownMenuProps {
	text: string;
	options: JSX.Element[];
	contentWidth?: number;
}

export const DropdownMenu = (props: DropdownMenuProps) => {
	const [isActive, setActive] = React.useState(false);

	return (
		<Container onClick={() => setActive(!isActive)}>
			<TitleElement $isActive={isActive}>{props.text}</TitleElement>
			<Connector $isActive={isActive} />
			<OptionsContainer $isActive={isActive} $contentWidth={props.contentWidth}>
				{props.options.map((option, index) => (
					<React.Fragment key={index}>{option}</React.Fragment>
				))}
			</OptionsContainer>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
	height: 40px;
`;

const TitleElement = styled.div<{ $isActive: boolean }>`
	background-color: ${(props) => (props.$isActive ? '#222' : '#1c1c1c')};
	border: 1px solid #aaa;
	border-radius: ${(props) => (props.$isActive ? '4px 4px 0 0' : '4px')};
	padding: ${(props) => (props.$isActive ? '8px 16px 16px' : '8px 16px')};
	border-bottom: '1px solid #aaa';
	position: relative;
	z-index: 0;
	cursor: pointer;

	&:hover {
		background-color: #222;
	}
`;

const Connector = styled.div<{ $isActive: boolean }>`
	position: absolute;
	top: 100%;
	left: 0.5px;
	right: 0.5px;
	height: 3px;
	background-color: #222;
	visibility: ${(props) => (props.$isActive ? 'visible' : 'hidden')};
	margin-top: 7px;
	z-index: 1;
`;

const OptionsContainer = styled.div<{ $isActive: boolean; $contentWidth: number | undefined }>`
	visibility: ${(props) => (props.$isActive ? 'visible' : 'hidden')};
	height: ${(props) => (props.$isActive ? 'auto' : '0')};
	position: absolute;
	top: 100%;
	left: 0;
	background-color: #222;
	border-radius: 0 4px 4px 4px;
	border: 1px solid #aaa;
	margin-top: 7px;
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 4px;
	${(props) => (props.$contentWidth ? `width: ${props.$contentWidth}px;` : '')}
`;

export const DropdownMenuOption = styled.div`
	padding: 4px 8px;
	font-family: 'endlessDungeon';
	font-size: 1.3rem;
	cursor: pointer;
	&:hover {
		background-color: #444;
	}
`;
