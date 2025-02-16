import 'phaser';
import React, { useState } from 'react';
import { Dropdown } from './Dropdown';
import styled from 'styled-components';
import { MinMaxParticleEffectValue, SimpleParticleEffectValue } from '../../types/AbilityType';

export interface EmitterInputBlockProps {
	inputName: string;
	initialValue?: number;
	minMaxOnly?: boolean;
	onValidChange: (value: SimpleParticleEffectValue | MinMaxParticleEffectValue) => void;
}

type EmitterValueType = 'numeric' | 'min-max' | 'start-end';

export const EmitterInputBlock = ({
	inputName,
	onValidChange,
	minMaxOnly,
	initialValue,
}: EmitterInputBlockProps) => {
	const [valueType, setValueType] = useState<EmitterValueType>('numeric');
	const [valueNumeric, setValueNumeric] = useState<string>(
		`${initialValue === undefined ? 1 : initialValue}`
	);
	const [valueMin, setValueMin] = useState<string>('1');
	const [valueMax, setValueMax] = useState<string>('1');
	const [valueStart, setValueStart] = useState<string>('1');
	const [valueEnd, setValueEnd] = useState<string>('1');

	return (
		<Block>
			<Column>
				{inputName}
				<Dropdown
					value={valueType}
					onChange={(e: any) => {
						const newvalueType = e.target.value;
						setValueType(newvalueType);
					}}
				>
					<option value="numeric">Numeric</option>
					<option value="min-max">Min-Max</option>
					{minMaxOnly ? <></> : <option value="start-end">Start-End</option>}
				</Dropdown>
			</Column>
			<Column>
				{valueType === 'numeric' ? (
					<div>
						Value
						<br />
						<input
							value={valueNumeric}
							onChange={(e) => {
								const newValue = parseFloat(e.target.value);
								if (!isNaN(newValue)) {
									onValidChange(newValue);
								}
								setValueNumeric(e.target.value);
							}}
						/>
					</div>
				) : valueType === 'min-max' ? (
					<div>
						Min
						<br />
						<input
							value={valueMin}
							onChange={(e) => {
								const newValueMin = parseFloat(e.target.value);
								const floatValueMax = parseFloat(valueMax);
								if (!isNaN(newValueMin) && !isNaN(floatValueMax)) {
									onValidChange({
										min: newValueMin,
										max: floatValueMax,
									});
								}
								setValueMin(e.target.value);
							}}
						/>
						Max
						<br />
						<input
							value={valueMax}
							onChange={(e) => {
								const newValueMax = parseFloat(e.target.value);
								const floatValueMin = parseFloat(valueMin);
								if (!isNaN(newValueMax) && !isNaN(floatValueMin)) {
									onValidChange({
										min: floatValueMin,
										max: newValueMax,
									});
								}
								setValueMax(e.target.value);
							}}
						/>
					</div>
				) : (
					<div>
						Start
						<br />
						<input
							value={valueStart}
							onChange={(e) => {
								const newValueStart = parseFloat(e.target.value);
								const floatValueEnd = parseFloat(valueEnd);
								if (!isNaN(newValueStart) && !isNaN(floatValueEnd)) {
									onValidChange({
										start: newValueStart,
										end: floatValueEnd,
									});
								}
								setValueStart(e.target.value);
							}}
						/>
						End
						<br />
						<input
							value={valueEnd}
							onChange={(e) => {
								const newValueEnd = parseFloat(e.target.value);
								const floatValueStart = parseFloat(valueStart);
								if (!isNaN(newValueEnd) && !isNaN(floatValueStart)) {
									onValidChange({
										start: floatValueStart,
										end: newValueEnd,
									});
								}
								setValueEnd(e.target.value);
							}}
						/>
					</div>
				)}
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
