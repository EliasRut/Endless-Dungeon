import styled from 'styled-components';
import { Dropdown } from './Dropdown';
import { NavLink } from 'react-router-dom';

const CloseButtonContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-left: 48px;
	margin-top: 12px;
`;

const CloseButtonElement = styled.button`
	width: 30px;
	height: 30px;
	background-color: black;
	border: 0.5px solid #9c1309;
	border-radius: 4px;
	cursor: pointer;
`;

const CloseButtonText = styled.p`
	font-family: 'endlessDungeon';
	font-size: 1rem;
	color: #9c1309;
	margin: 0 1px 0 2px;
`;

export const CloseButton: (props: { onClick: () => void }) => JSX.Element = ({ onClick }) => (
	<CloseButtonContainer>
		<CloseButtonElement onClick={onClick}>
			<CloseButtonText>X</CloseButtonText>
		</CloseButtonElement>
	</CloseButtonContainer>
);

const AddButtonElement = styled.button`
	width: 30px;
	margin-top: 12px;
	background-color: black;
	border: 0.5px solid #2ca831;
	border-radius: 4px;
	cursor: pointer;
`;

const AddButtonText = styled.p`
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
	color: #2ca831;
	margin: 0 1px 0 2px;
`;

export const AddButton: (props: { onClick: () => void }) => JSX.Element = ({ onClick }) => (
	<AddButtonElement onClick={onClick}>
		<AddButtonText>+</AddButtonText>
	</AddButtonElement>
);

export const LargeDropdown = styled(Dropdown)`
	width: 100%;
`;

export const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	flex-grow: 1;
`;

export const TextWrapper = styled.div`
	width: 200px;
	flex-shrink: 0;
	flex-grow: 0;
`;

export const ScriptBlockContainer = styled.div`
	margin-top: 12px;
	border: 2px solid white;
	padding: 0 12px 6px 12px;
	border-radius: 4px;
`;

export const ItemsContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	margin-bottom: 12px;
`;

export const ItemIdContainer = styled(ItemsContainer)`
	margin-top: 12px;
`;

export const StyledLink = styled(NavLink)`
	& {
		font-family: 'endlessDungeon';
		font-size: 2rem;
		padding: 6px 24px;
		cursor: pointer;
		text-decoration: none;
		color: black;
		background-color: #ffffff;
		border-style: solid;
		border-radius: 0.5rem;
		margin: 0 24px;
	}
	&.active {
		background-color: #a09f9f;
	}
`;

export const MenuWrapper = styled.div`
	width: 245px;
	background-color: black;
	color: white;
	display: flex;
	flex-direction: column;
	font-family: 'endlessDungeon';
	font-size: 2rem;
	padding: 24px;
`;

export const MenuElementWrapper = styled.div`
	color: white;
	padding-bottom: 12px;
`;

export const NotPaddedButtonWrapper = styled.div`
	margin-top: 4px;
`;

export const ButtonWrapper = styled.div`
	margin-top: 18px;
`;

export const StyledButton = styled.button`
	width: 100%;
	font-family: 'endlessDungeon';
	font-size: 1.8rem;
	cursor: pointer;
`;
