import styled from 'styled-components';

export const PaddedContainer = (props: any) => (
	<StyledContainer {...props}>{props.children}</StyledContainer>
);

const StyledContainer = styled.div`
	padding: 48px 0 14px 0;
	min-height: 100%;
`;
