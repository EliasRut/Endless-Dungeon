import 'phaser';
import React, { useState } from 'react';
import styled from 'styled-components';
import { ColorEffectValue } from '../../types/AbilityType';

export interface EmitterTintInputBlockProps {
	inputName: string;
	onValidChange: (value: ColorEffectValue) => void;
}

type EmitterValueType = 'numeric' | 'min-max' | 'start-end';

export const EmitterTintInputBlock = ({ inputName, onValidChange }: EmitterTintInputBlockProps) => {
	const [valueRedMin, setValueRedMin] = useState<string>('1');
	const [valueGreenMin, setValueGreenMin] = useState<string>('1');
	const [valueBlueMin, setValueBlueMin] = useState<string>('1');
	const [valueRedDiff, setValueRedDiff] = useState<string>('1');
	const [valueGreenDiff, setValueGreenDiff] = useState<string>('1');
	const [valueBlueDiff, setValueBlueDiff] = useState<string>('1');

	return (
		<Block>
			<Column>{inputName}</Column>
			<Column>
				<div>
					Red Min
					<br />
					<input
						value={valueRedMin}
						onChange={(e) => {
							const newValue = parseFloat(e.target.value);

							const floatValueGreenMin = parseFloat(valueGreenMin);
							const floatValueBlueMin = parseFloat(valueBlueMin);
							const floatValueRedDiff = parseFloat(valueRedDiff);
							const floatValueGreenDiff = parseFloat(valueGreenDiff);
							const floatValueBlueDiff = parseFloat(valueBlueDiff);
							if (
								!isNaN(newValue) &&
								!isNaN(floatValueGreenMin) &&
								!isNaN(floatValueBlueMin) &&
								!isNaN(floatValueRedDiff) &&
								!isNaN(floatValueGreenDiff) &&
								!isNaN(floatValueBlueDiff)
							) {
								onValidChange({
									redMin: newValue,
									greenMin: floatValueGreenMin,
									blueMin: floatValueBlueMin,
									redDiff: floatValueRedDiff,
									greenDiff: floatValueGreenDiff,
									blueDiff: floatValueBlueDiff,
								});
							}
							setValueRedMin(e.target.value);
						}}
					/>
				</div>
				<div>
					Green Min
					<br />
					<input
						value={valueGreenMin}
						onChange={(e) => {
							const newValue = parseFloat(e.target.value);

							const floatValueRedMin = parseFloat(valueRedMin);
							const floatValueBlueMin = parseFloat(valueBlueMin);
							const floatValueRedDiff = parseFloat(valueRedDiff);
							const floatValueGreenDiff = parseFloat(valueGreenDiff);
							const floatValueBlueDiff = parseFloat(valueBlueDiff);
							if (
								!isNaN(newValue) &&
								!isNaN(floatValueRedMin) &&
								!isNaN(floatValueBlueMin) &&
								!isNaN(floatValueRedDiff) &&
								!isNaN(floatValueGreenDiff) &&
								!isNaN(floatValueBlueDiff)
							) {
								onValidChange({
									greenMin: newValue,
									redMin: floatValueRedMin,
									blueMin: floatValueBlueMin,
									redDiff: floatValueRedDiff,
									greenDiff: floatValueGreenDiff,
									blueDiff: floatValueBlueDiff,
								});
							}
							setValueGreenMin(e.target.value);
						}}
					/>
				</div>
				<div>
					Blue Min
					<br />
					<input
						value={valueBlueMin}
						onChange={(e) => {
							const newValue = parseFloat(e.target.value);

							const floatValueRedMin = parseFloat(valueRedMin);
							const floatValueGreenMin = parseFloat(valueGreenMin);
							const floatValueRedDiff = parseFloat(valueRedDiff);
							const floatValueGreenDiff = parseFloat(valueGreenDiff);
							const floatValueBlueDiff = parseFloat(valueBlueDiff);
							if (
								!isNaN(newValue) &&
								!isNaN(floatValueRedMin) &&
								!isNaN(floatValueGreenMin) &&
								!isNaN(floatValueRedDiff) &&
								!isNaN(floatValueGreenDiff) &&
								!isNaN(floatValueBlueDiff)
							) {
								onValidChange({
									blueMin: newValue,
									redMin: floatValueRedMin,
									greenMin: floatValueGreenMin,
									redDiff: floatValueRedDiff,
									greenDiff: floatValueGreenDiff,
									blueDiff: floatValueBlueDiff,
								});
							}
							setValueBlueMin(e.target.value);
						}}
					/>
				</div>
				<div>
					Red Diff
					<br />
					<input
						value={valueRedDiff}
						onChange={(e) => {
							const newValue = parseFloat(e.target.value);

							const floatValueRedMin = parseFloat(valueRedMin);
							const floatValueGreenMin = parseFloat(valueGreenMin);
							const floatValueBlueMin = parseFloat(valueBlueMin);
							const floatValueGreenDiff = parseFloat(valueGreenDiff);
							const floatValueBlueDiff = parseFloat(valueBlueDiff);
							if (
								!isNaN(newValue) &&
								!isNaN(floatValueRedMin) &&
								!isNaN(floatValueGreenMin) &&
								!isNaN(floatValueBlueMin) &&
								!isNaN(floatValueGreenDiff) &&
								!isNaN(floatValueBlueDiff)
							) {
								onValidChange({
									blueMin: floatValueBlueMin,
									redMin: floatValueRedMin,
									greenMin: floatValueGreenMin,
									redDiff: newValue,
									greenDiff: floatValueGreenDiff,
									blueDiff: floatValueBlueDiff,
								});
							}
							setValueRedDiff(e.target.value);
						}}
					/>
				</div>
				<div>
					Green Diff
					<br />
					<input
						value={valueGreenDiff}
						onChange={(e) => {
							const newValue = parseFloat(e.target.value);

							const floatValueRedMin = parseFloat(valueRedMin);
							const floatValueGreenMin = parseFloat(valueGreenMin);
							const floatValueBlueMin = parseFloat(valueBlueMin);
							const floatValueRedDiff = parseFloat(valueRedDiff);
							const floatValueBlueDiff = parseFloat(valueBlueDiff);
							if (
								!isNaN(newValue) &&
								!isNaN(floatValueRedMin) &&
								!isNaN(floatValueGreenMin) &&
								!isNaN(floatValueBlueMin) &&
								!isNaN(floatValueRedDiff) &&
								!isNaN(floatValueBlueDiff)
							) {
								onValidChange({
									blueMin: floatValueBlueMin,
									redMin: floatValueRedMin,
									greenMin: floatValueGreenMin,
									redDiff: floatValueRedDiff,
									greenDiff: newValue,
									blueDiff: floatValueBlueDiff,
								});
							}
							setValueGreenDiff(e.target.value);
						}}
					/>
				</div>
				<div>
					Blue Diff
					<br />
					<input
						value={valueBlueDiff}
						onChange={(e) => {
							const newValue = parseFloat(e.target.value);

							const floatValueRedMin = parseFloat(valueRedMin);
							const floatValueGreenMin = parseFloat(valueGreenMin);
							const floatValueBlueMin = parseFloat(valueBlueMin);
							const floatValueGreenDiff = parseFloat(valueGreenDiff);
							const floatValueBlueDiff = parseFloat(valueBlueDiff);
							if (
								!isNaN(newValue) &&
								!isNaN(floatValueRedMin) &&
								!isNaN(floatValueGreenMin) &&
								!isNaN(floatValueBlueMin) &&
								!isNaN(floatValueGreenDiff) &&
								!isNaN(floatValueBlueDiff)
							) {
								onValidChange({
									blueMin: floatValueBlueMin,
									redMin: floatValueRedMin,
									greenMin: floatValueGreenMin,
									redDiff: newValue,
									greenDiff: floatValueGreenDiff,
									blueDiff: floatValueBlueDiff,
								});
							}
							setValueBlueDiff(e.target.value);
						}}
					/>
				</div>
			</Column>
		</Block>
	);
};

const Block = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: flex-start;
	gap: 8px;
`;

const Column = styled.div`
	display: flex;
	flex-direction: column;
	width: 96px;
`;
