import React from 'react';
import styled from 'styled-components';

export const LargeInput = (props: any) => (
	<FormattedInput {...props}>{props.children}</FormattedInput>
);

const FormattedInput = styled.input`
	width: 350px;
	font-family: 'endlessDungeon';
	font-size: 1rem;
`;
