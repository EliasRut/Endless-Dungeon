import styled from 'styled-components';
import React, { useEffect, useRef } from 'react';
import { AspectAwareImage } from '../../site/components/AspectAwareImage';

export const DialogScreen = () => {
	const SCALING_FACTOR_PORTRAIT = 6;

	return (
		<DialogContainer>
			<LeftImageContainer>
				<AspectAwareImage
					imageName="portrait_hilda.png"
					width={64 * SCALING_FACTOR_PORTRAIT}
					height={96 * SCALING_FACTOR_PORTRAIT}
				/>
			</LeftImageContainer>
			<DialogBoxesContainer>
				<SpeechBubble>
					Look who the cat dragged in. I assume you two decided to ''complete'' yesterday's mission?
				</SpeechBubble>
				<SpeechBubbleRight>
					Come on, you won't complain about a few plantlings leaves and a little dirt. I have looked
					worse.
				</SpeechBubbleRight>
			</DialogBoxesContainer>
			<RightImageContainer>
				<AspectAwareImage
					imageName="portrait_agnes.png"
					width={64 * SCALING_FACTOR_PORTRAIT}
					height={96 * SCALING_FACTOR_PORTRAIT}
				/>
			</RightImageContainer>
		</DialogContainer>
	);
};

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
	/* width: 20%; */
`;

const DialogBoxesContainer = styled.div`
	display: flex;
	align-items: flex-end;
	padding: 0 2rem 2rem;
`;

const RightImageContainer = styled.div`
	display: flex;
	justify-content: center;
	/* width: 20%; */
`;

const SpeechBubble = styled.div`
	font-family: 'endlessDungeon';
	font-size: 1.5em;
	line-height: 1.2em;
	width: 300px;
	background: #000000eb;
	border-radius: 5px;
	border: 3px double #999;
	box-shadow: 2px 2px 2px 2px #4b4949b5;
	padding: 1em;
	text-align: center;
	color: #fff;
	height: fit-content;
`;

const SpeechBubbleRight = styled.div`
	font-family: 'endlessDungeon';
	font-size: 1.5em;
	line-height: 1.2em;
	width: 300px;
	background: #000000eb;
	border-radius: 5px;
	border: 3px double #999;
	box-shadow: 2px 2px 2px 2px #4b4949b5;
	padding: 1em;
	text-align: center;
	color: #fff;
	margin: 0 0 2em 8em;
	height: fit-content;
`;

// const SpeechBubble = styled.div`
// 	width: 0px;
// 	height: 0px;
// 	position: absolute;
// 	border-left: 24px solid #fff;
// 	border-right: 12px solid transparent;
// 	border-top: 12px solid #fff;
// 	border-bottom: 20px solid transparent;
// 	left: 32px;
// 	bottom: -24px;
// `;

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
