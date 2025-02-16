import styled from 'styled-components';

export const LargeInput = (props: any) => (
	<FormattedInput {...props}>{props.children}</FormattedInput>
);

const FormattedInput = styled.input`
	width: 100%;
	box-sizing: border-box;
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
`;
