import React from 'react';
import styled from 'styled-components';

export const ScriptBlockContainer = (props: any) => (
	<StyledContainer {...props}>{props.children}</StyledContainer>
);

const StyledContainer = styled.div`
	margin-top: 12px;
	border: 2px solid white;
	padding: 0 12px 6px 12px;
	border-radius: 4px;
`;
