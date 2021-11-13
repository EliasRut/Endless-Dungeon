import { NpcScript } from '../../../../typings/custom';
import { Faction } from '../../helpers/constants';
import Character from '../../worldstate/Character';

export default class CharacterToken extends Phaser.Physics.Arcade.Sprite {
	stateObject: Character;
	id: string;
	type: string;
	script?: NpcScript;
	faction: Faction;
	isBeingMoved?: boolean;
	lastMovedTimestamp: number;
	lastNecroticEffectTimestamp: number;
	necroticEffectStacks: number;

	constructor(
			scene: Phaser.Scene,
			x: number,
			y: number,
			tileName: string,
			type: string,
			id: string
		) {
		super(scene, x, y, tileName);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.type = type;
		this.id = id;
		this.lastMovedTimestamp = -Infinity;
		this.lastNecroticEffectTimestamp = -Infinity;
		this.necroticEffectStacks = 0;
	}

	public onCollide(withEnemy: boolean) {}

	public getDistance(px: number, py: number) {
		const x = this.x - px;
		const y = this.y - py;
		return Math.hypot(x, y);
	}
}
