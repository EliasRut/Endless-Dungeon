import React from 'react';
import styled from 'styled-components';

export const LargeDropdown = (props: any) => (
	<FormattedDropdown {...props}>{props.children}</FormattedDropdown>
);

const FormattedDropdown = styled.select`
	width: 100%;
	min-width: 197px;
	box-sizing: border-box;
	font-family: 'endlessDungeon';
	font-size: 1.5rem;
`;
