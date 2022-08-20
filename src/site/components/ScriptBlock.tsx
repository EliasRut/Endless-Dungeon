import React from 'react';
import { ScriptEntry } from '../../../typings/custom';
import { ScriptBlockContainer } from './ScriptBlockContainer';
import { Condition } from './ScriptBlockTypes/Condition';
import { Dialog } from './ScriptBlockTypes/Dialog';
import { Move } from './ScriptBlockTypes/Move';
import { PausedCondition } from './ScriptBlockTypes/PausedCondition';
import { SetFollowerData } from './ScriptBlockTypes/SetFollowerData';
import { SetQuestState } from './ScriptBlockTypes/SetQuestState';
import { Wait } from './ScriptBlockTypes/Wait';
import { ScriptTypeDropdown } from './ScriptTypeDropdown';

export interface ScriptBlockProps {
	scriptBlock: Partial<ScriptEntry>;
	onChange: (value: string) => void;
	onRemove: () => void;
	knownQuests: {
		id: string;
		name: string;
	}[];
}

export const ScriptBlock: (props: ScriptBlockProps) => JSX.Element = ({
	scriptBlock,
	onChange,
	onRemove,
	knownQuests,
}) => {
	const type = scriptBlock.type;
	switch (type) {
		case 'wait': {
			return (
				<Wait
					currentData={{ time: 1000, ...scriptBlock, type: 'wait' }}
					updateData={onChange}
					removeData={onRemove}
				/>
			);
		}
		case 'condition': {
			return (
				<Condition
					currentData={{
						itemId: '',
						scriptId: '',
						scriptState: 'none',
						...scriptBlock,
						type: 'condition',
					}}
					updateData={onChange}
					removeData={onRemove}
				/>
			);
		}
		case 'pauseUntilCondition': {
			return (
				<PausedCondition
					currentData={{
						itemIds: [],
						itemQuantities: [],
						questIds: [],
						questStates: ['none'],
						scriptIds: [],
						scriptStates: ['none'],
						roomName: '',
						...scriptBlock,
						type: 'pauseUntilCondition',
					}}
					updateData={onChange}
					removeData={onRemove}
				/>
			);
		}
		case 'dialog': {
			return (
				<Dialog
					currentData={{
						speaker: '',
						portrait: '',
						text: [],
						...scriptBlock,
						type: 'dialog',
					}}
					updateData={onChange}
					removeData={onRemove}
				/>
			);
		}
		case 'move': {
			return (
				<Move
					currentData={{
						target: '',
						posX: 0,
						posY: 0,
						facingX: 0,
						facingY: 0,
						...scriptBlock,
						type: 'move',
					}}
					updateData={onChange}
					removeData={onRemove}
				/>
			);
		}
		case 'setQuestState': {
			return (
				<SetQuestState
					currentData={{
						questId: '',
						questState: 'new',
						...scriptBlock,
						type: 'setQuestState',
					}}
					availableQuests={knownQuests}
					updateData={onChange}
					removeData={onRemove}
				/>
			);
		}
		case 'setFollowerData': {
			return (
				<SetFollowerData
					currentData={{
						id: '',
						animationBase: '',
						health: 0,
						damage: 0,
						movementSpeed: 0,
						level: 0,
						ability: '',
						...scriptBlock,
						type: 'setFollowerData',
					}}
					// availableFollowerAbilities={knownFollowerAbilities}
					updateData={onChange}
					removeData={onRemove}
				/>
			);
		}
		default:
			return (
				<ScriptBlockContainer>
					<ScriptTypeDropdown value="-" onChange={onChange} onRemove={onRemove} />
				</ScriptBlockContainer>
			);
	}
};
