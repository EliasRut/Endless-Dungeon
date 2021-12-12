import React from 'react';
import styled from 'styled-components';

export const Dropdown = (props: any) => (
	<FormattedDropdown {...props}>{props.children}</FormattedDropdown>
);

const FormattedDropdown = styled.select`
	width: 148px;
	height: 24px;
	font-family: 'munro';
	font-size: 1rem;
`;
