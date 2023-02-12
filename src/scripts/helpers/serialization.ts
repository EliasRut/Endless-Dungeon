import { LightingSource, DatabaseRoom, Room } from '../../../typings/custom';

export const deserializeRoom: (room: DatabaseRoom) => Room = (room) => ({
	...room,
	openings: JSON.parse(room.openings),
	layout: JSON.parse(room.layout),
	decorations: JSON.parse(room.decorations),
	overlays: JSON.parse(room.overlays),
	lightingSources: room.lightingSources || ([] as LightingSource[]),
});
