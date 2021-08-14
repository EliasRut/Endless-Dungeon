import { DatabaseRoom, Room } from '../../../typings/custom';

export const deserializeRoom: (room: DatabaseRoom) => Room = (room) => ({
	...room,
	layout: JSON.parse(room.layout),
	decorations: JSON.parse(room.decorations),
	overlays: JSON.parse(room.overlays),
});