import * as React from 'react';
interface AspectAwareImageProps {
	className?: string;
	imageName: string;
	width: number;
	height: number;
}

export const AspectAwareImage = (props: AspectAwareImageProps) => (
	<img
		className={props.className || ''}
		src={`src/assets/img/dialog/${props.imageName}`}
		style={{
			width: `${props.width}px`,
			aspectRatio: `${props.width / props.height}`,
		}}
	/>
);
