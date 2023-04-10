import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import { Node2D } from '@/scenes/nodes/Node2D';
import type { World } from '@/modules/World';


export class NodeCell extends Node2D {
	public '@enter_world' = new Event<NodeCell, [World]>(this);
	public '@exit_world' = new Event<NodeCell, [World]>(this);

	protected _enter_world(world: World): void {}
	protected _exit_world(world: World): void {}

	public cellpos = new Vector2();
	protected _world: World | null = null;

	protected _isInTree: boolean = false;
	public get isInTree(): boolean { return this._isInTree; }

	constructor() {
		super();
	}

	public tryMoveTo(target: Vector2): boolean {
		if(!this._isInTree) return false;

		const has = this._world!.hasNodeMovedTo(this, target);
		console.log(has);


		if(has) {
			this.cellpos.add(target);
			this.position.set(this.cellpos.buf().inc(this._world!.cellsize));
		}

		return has;
	}
}
