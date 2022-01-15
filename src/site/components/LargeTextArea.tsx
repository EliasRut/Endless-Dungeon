import React from 'react';
import styled from 'styled-components';

export const LargeTextArea = (props: any) => (
	<FormattedTextArea {...props}>{props.children}</FormattedTextArea>
);

const FormattedTextArea = styled.textarea`
	width: 352px;
	height: 48px;
	font-family: 'endlessDungeon';
	font-size: 1rem;
`;
