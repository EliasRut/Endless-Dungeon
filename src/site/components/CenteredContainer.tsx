import styled from 'styled-components';

const CenteredContainer = styled.div`
	display: block;
	max-width: 100%;
	width: auto;
	margin-left: 1em;
	margin-right: 1em;

	@media only screen and (max-width: 991px) and (min-width: 768px) {
		width: 723px;
		margin-left: auto;
		margin-right: auto;
	}

	@media only screen and (max-width: 1199px) and (min-width: 992px) {
		width: 992px;
		margin-left: auto;
		margin-right: auto;
	}

	@media only screen and (min-width: 1200px) {
		width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}
`;

export default CenteredContainer;