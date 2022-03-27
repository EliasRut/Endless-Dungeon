import React from 'react';
import styled from 'styled-components';

export const LargeTextArea = (props: any) => (
	<FormattedTextArea {...props}>{props.children}</FormattedTextArea>
);

const FormattedTextArea = styled.textarea`
	width: 100%;
	box-sizing: border-box;
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
`;
