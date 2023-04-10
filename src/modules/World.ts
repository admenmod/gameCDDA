import { Vector2 } from '@ver/Vector2';
import { EventDispatcher, Event } from '@ver/events';
import { NodeCell } from '@/scenes/nodes/NodeCell';
import { Date } from '@/modules/Date';


export class World extends EventDispatcher {
	public size = new Vector2();
	public cellsize = new Vector2(1, 1);

	public all_nodes: NodeCell[] = [];


	public date: Date = new Date();


	constructor(p: {
		size: Vector2
	}) {
		super();

		this.size.set(p.size);
	}


	public addObject(o: NodeCell): void {
		//@ts-ignore friend
		if(o._isInTree) return;

		//@ts-ignore friend
		o._isInTree = true;
		//@ts-ignore friend
		o._world = this;
		//@ts-ignore friend
		o._enter_world(this);
		o.emit('enter_world', this);

		this.all_nodes.push(o);
	}

	public delObject(o: NodeCell): void {
		//@ts-ignore
		if(!o._isInTree) return;

		//@ts-ignore friend
		o._isInTree = false;
		//@ts-ignore friend
		o._world = null;
		//@ts-ignore friend
		o._exit_world(this);
		o.emit('exit_world', this);

		const l = this.all_nodes.indexOf(o);
		if(~l) this.all_nodes.splice(l, 1);
	}

	public hasNodeMovedTo(node1: NodeCell, target: Vector2): boolean {
		const l = target.module;

		if(l > 2) return false;

		for(let i = 0; i < this.all_nodes.length; i++) {
			const diff = this.all_nodes[i].cellpos.buf().sub(node1.cellpos.buf().add(target));

			if(diff.isSame(Vector2.ZERO)) return false;
		}

		this.date.setSeconds(this.date.getSeconds() + 3);

		return true;
	}

	public getDistance(node1: NodeCell, node2: NodeCell): number {
		return node1.cellpos.getDistance(node2.cellpos);
	}

	public update(dt: number): void {
		for(let i = 0; i < this.all_nodes.length; i++) {
			for(let j = i + 1; j < this.all_nodes.length; j++) {
				const node1 = this.all_nodes[i];
				const node2 = this.all_nodes[j];
			}
		}
	}
}
