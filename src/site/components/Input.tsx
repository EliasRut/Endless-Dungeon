import React from 'react';
import styled from 'styled-components';

export const Input = (props: any) => <FormattedInput {...props}>{props.children}</FormattedInput>;

const FormattedInput = styled.input`
	width: 140px;
	font-family: 'munro';
	font-size: 1rem;
`;
