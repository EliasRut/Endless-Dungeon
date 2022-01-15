import React from 'react';
import styled from 'styled-components';

export const LargeDropdown = (props: any) => (
	<FormattedDropdown {...props}>{props.children}</FormattedDropdown>
);

const FormattedDropdown = styled.select`
	width: 358px;
	height: 24px;
	font-family: 'endlessDungeon';
	font-size: 1rem;
`;
