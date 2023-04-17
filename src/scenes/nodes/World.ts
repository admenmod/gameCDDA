import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import { Scene } from '@ver/Scene';
import { NodeCell } from '@/scenes/nodes/NodeCell';
import { Date } from '@/modules/Date';
import type { Camera } from '@ver/Camera';
import type { LayersList } from '@ver/CanvasLayer';
import { Node2D } from '@/scenes/nodes/Node2D';
import type { getInstanceOf } from '@ver/types';


export class World extends Node2D {
	public size = new Vector2();
	public cellsize = new Vector2(1, 1);

	public all_nodes: NodeCell[] = [];
	public active_nodes: NodeCell[] = [];


	public enter_date: Date = new Date();
	public date: Date = new Date();

	//@ts-ignore
	protected async _init(p: {
		size: Vector2
	}): Promise<void> {
		this.size.set(p.size);
	}

	public getObjectCellUp(target: Vector2): NodeCell | null{
		return this.all_nodes.find(i => i.cellpos.isSame(target)) || null;
	}

	public addObject(o: NodeCell): void {
		//@ts-ignore friend
		if(o._isInTree) return;

		//@ts-ignore friend
		o._isInTree = true;
		//@ts-ignore friend
		o._world = this;

		o.position.set(o.cellpos.buf().inc(this.cellsize));
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

	public hasPickUp(node1: NodeCell, node2: NodeCell): boolean {
		if(node1 === node2) throw new Error('node1 === node2');

		if(node1.inHands) return false;

		if(this.getDistance(node1, node2) > 2) return false;

		if(!node2.isPickupable) return false;

		return true;
	}

	public hasPut(node1: NodeCell, target: Vector2): boolean {
		if(node1.cellpos.getDistance(target) > 2) return false;

		// if(!node2.isPickupable) return true;

		if(this.all_nodes.some(i => i.cellpos.isSame(target))) return false;

		return true;
	}

	public getDistance(node1: NodeCell, node2: NodeCell): number {
		return node1.cellpos.getDistance(node2.cellpos);
	}


	protected _process(dt: number): void {
		for(let i = 0; i < this.all_nodes.length; i++) {
			for(let j = i + 1; j < this.all_nodes.length; j++) {
				const node1 = this.all_nodes[i];
				const node2 = this.all_nodes[j];
			}
		}
	}

	protected _render(layers: LayersList, camera: Camera): void {
		for(let i = 0; i < this.all_nodes.length; i++) {
			this.all_nodes[i].render(layers, camera);
		}
	}
}
