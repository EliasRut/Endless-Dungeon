import React from 'react';
import styled from 'styled-components';

export const Dropdown = (props: any) => (
	<FormattedDropdown {...props}>{props.children}</FormattedDropdown>
);

const FormattedDropdown = styled.select`
	width: 100%;
	box-sizing: border-box;
	font-family: 'endlessDungeon';
	font-size: 1.3rem;
`;
