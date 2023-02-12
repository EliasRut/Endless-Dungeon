import styled from 'styled-components';
import React, { useEffect, useRef } from 'react';
import { AspectAwareImage } from '../../site/components/AspectAwareImage';
import firebase from 'firebase';
import { Dialog } from '../../../typings/custom';
import { connect } from 'react-redux';
import { RootState } from '../../site/uiStore/uiStore';

const SCALING_FACTOR_PORTRAIT = 6;

export interface DialogScreenProps {
	activeDialogId: string | undefined;
}

export interface DialogState {
	dialogName?: string;
	leftSpeakerName?: string;
	rightSpeakerName?: string;
	leftSpeakerPortrait?: string;
	rightSpeakerPortrait?: string;
	textBlocks: Array<{
		isLeftSpeaker: boolean;
		text: string;
	}>;
	dialogBlockIndex: number;
	dialogTextIndex: number;
}

export interface DialogScreenProps {}

class DialogScreen extends React.Component<DialogScreenProps, DialogState> {
	state: DialogState = {
		// id: 'xH9R7Y7YTm4sHvFMwxk8',
		textBlocks: [],
		dialogBlockIndex: 0,
		dialogTextIndex: 0,
	};

	async loadDialog() {
		if (!this.props.activeDialogId) {
			return;
		}
		const dialogDoc = await firebase
			.firestore()
			.collection('dialogs')
			.doc(this.props.activeDialogId)
			.get();
		const dialog: Dialog = dialogDoc.data() as Dialog;

		const dialogId = dialog.id;
		let dialogStep;
		const dialogSteps = dialog.steps;
		for (dialogStep of dialogSteps) {
			const dialogStepState = {
				leftSpeakerName: dialogStep.leftSpeakerName,
				rightSpeakerName: dialogStep.rightSpeakerName,
				leftSpeakerPortrait: dialogStep.leftSpeakerPortrait,
				rightSpeakerPortrait: dialogStep.rightSpeakerPortrait,
				textBlocks: dialogStep.textBlocks,
			};
			const dialogState = {
				id: dialogId,
				...dialogStepState,
				dialogBlockIndex: 0,
				dialogTextIndex: 0,
			} as DialogState;
			this.setState(dialogState);
		}
	}

	componentDidUpdate(prevProps: Readonly<DialogScreenProps>): void {
		if (prevProps.activeDialogId !== this.props.activeDialogId) {
			this.loadDialog();
		}
	}

	componentDidMount() {
		this.loadDialog();
	}

	render() {
		return (
			<DialogContainer>
				<LeftImageContainer>
					<AspectAwareImage
						imageName={`${this.state.leftSpeakerPortrait}.png`}
						width={64 * SCALING_FACTOR_PORTRAIT}
						height={96 * SCALING_FACTOR_PORTRAIT}
					/>
				</LeftImageContainer>
				<DialogBoxesContainer>
					{this.state.textBlocks.map((textBlock) => {
						if (textBlock.isLeftSpeaker) {
							return (
								<BubbleLeftContainer>
									<ArrowSpeechBubbleLeft />
									<ArrowSpeechBubbleOutlineLeft />
									<SpeechBubbleLeft>{textBlock.text}</SpeechBubbleLeft>
								</BubbleLeftContainer>
							);
						} else {
							return (
								<BubbleRightContainer>
									<SpeechBubbleRight>{textBlock.text}</SpeechBubbleRight>
									<ArrowSpeechBubbleRight />
									<ArrowSpeechBubbleOutlineRight />
								</BubbleRightContainer>
							);
						}
					})}
				</DialogBoxesContainer>
				<RightImageContainer>
					<AspectAwareImage
						imageName={`${this.state.rightSpeakerPortrait}.png`}
						width={64 * SCALING_FACTOR_PORTRAIT}
						height={96 * SCALING_FACTOR_PORTRAIT}
					/>
				</RightImageContainer>
			</DialogContainer>
		);
	}
}

export default connect((state: RootState) => ({
	activeDialogId: state.dialog.activeDialogId,
}))(DialogScreen);

const DialogContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	position: fixed;
	top: 50%;
	width: 100%;
	height: 50%;
	z-index: 1000000;
`;

const LeftImageContainer = styled.div`
	display: flex;
	justify-content: center;
`;

const DialogBoxesContainer = styled.div`
	display: flex;
	align-items: flex-end;
	padding: 0 2rem 2rem;
`;

const RightImageContainer = styled.div`
	display: flex;
	justify-content: center;
`;

const BubbleLeftContainer = styled.div`
	display: flex;
	justify-content: left;
`;

const ArrowSpeechBubbleOutlineLeft = styled.div`
	width: 0;
	height: 0;
	border-top: 13px solid #00000000;
	border-bottom: 13px solid #00000000;
	border-right: 23px solid #ffae00;
	margin-top: 0.75em;
`;

const ArrowSpeechBubbleLeft = styled.div`
	width: 0;
	height: 0;
	border-top: 10px solid #00000000;
	border-bottom: 10px solid #00000000;
	border-right: 22px solid #000000f2;
	margin-top: calc(0.75em + 3px);
	position: absolute;
	margin-left: 4px;
`;

const SpeechBubbleLeft = styled.div`
	font-family: 'endlessDungeon';
	font-size: 2em;
	line-height: 1.2em;
	width: 360px;
	background: #000000eb;
	border-radius: 5px;
	border: 3px solid #ffae00;
	box-shadow: 2px 2px 2px 0 #4b4949b5;
	padding: 0.5em;
	text-align: center;
	color: #fff;
	height: fit-content;
	margin: 0 8em 2em 0;
`;

const BubbleRightContainer = styled.div`
	display: flex;
	justify-content: right;
`;

const ArrowSpeechBubbleOutlineRight = styled.div`
	width: 0;
	height: 0;
	border-top: 13px solid #00000000;
	border-bottom: 13px solid #00000000;
	border-left: 23px solid #ffae00;
	margin-top: 0.75em;
`;

const ArrowSpeechBubbleRight = styled.div`
	width: 0;
	height: 0;
	border-top: 10px solid #00000000;
	border-bottom: 10px solid #00000000;
	border-left: 22px solid #000000f2;
	margin-top: calc(0.75em + 3px);
	position: absolute;
	margin-right: 4px;
`;

const SpeechBubbleRight = styled.div`
	font-family: 'endlessDungeon';
	font-size: 2em;
	line-height: 1.2em;
	width: 360px;
	background: #000000eb;
	border-radius: 5px;
	border: 3px solid #ffae00;
	box-shadow: 2px 2px 2px 2px #4b4949b5;
	padding: 0.5em;
	text-align: center;
	color: #fff;
	height: fit-content;
`;

// export default class DialogScreen extends OverlayScreen {
// 	// dialogText: Phaser.GameObjects.BitmapText;
// 	dialogText: Phaser.GameObjects.Text;

// 	constructor(scene: Phaser.Scene) {
// 		// tslint:disable: no-magic-numbers
// 		super(
// 			scene,
// 			40 * UI_SCALE,
// 			window.innerHeight - 104 * UI_SCALE,
// 			window.innerWidth - 80 * UI_SCALE,
// 			80 * UI_SCALE
// 		);

// 		// this.dialogText = new Phaser.GameObjects.BitmapText(
// 		// 	scene, 24, 308, 'pixelfont', '', 12);
// 		this.dialogText = new Phaser.GameObjects.Text(
// 			scene,
// 			56 * UI_SCALE,
// 			window.innerHeight - 92 * UI_SCALE,
// 			'',
// 			{
// 				fontFamily: 'endlessDungeon',
// 				fontSize: `${12 * UI_SCALE}pt`,
// 				color: 'white',
// 				wordWrap: { width: (window.innerWidth - 112) * UI_SCALE, useAdvancedWrap: true },
// 			}
// 		);
// 		this.dialogText.setOrigin(0);
// 		this.dialogText.setDepth(UiDepths.UI_FOREGROUND_LAYER);
// 		this.dialogText.setScrollFactor(0);
// 		this.add(this.dialogText, true);
// 		// tslint:enable

// 		scene.add.existing(this);
// 		this.setVisible(false);
// 	}

// 	setText(text: string) {
// 		this.dialogText.setText(text);
// 	}
// }
