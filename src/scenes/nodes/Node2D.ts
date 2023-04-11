import { Vector2 } from '@ver/Vector2';
import { Node } from '@/scenes/nodes/Node';
import type { Camera } from '@ver/Camera';
import type { LayersList } from '@ver/CanvasLayer';


export class Node2D extends Node {
	public readonly position = new Vector2();
	public readonly scale = new Vector2(1, 1);

	protected _rotation: number = 0;
	public get rotation(): number { return this._rotation; }
	public set rotation(v: number) { this._rotation = v; }

	// protected _zIndex: number = 0;
	// public get zIndex(): number { return this._zIndex; }
	// public set zIndex(v: number) { this._zIndex = v; }
	//
	// public zAsRelative: boolean = true;

	constructor() { super(); }

	/*
	public get globalPosition(): Vector2 { return this.getRelativePosition(Node.MAX_NESTING); }
	public get globalScale(): Vector2 { return this.getRelativeScale(Node.MAX_NESTING); }
	public get globalRotation(): number { return this.getRelativeRotation(Node.MAX_NESTING); }
	public get globalzIndex(): number { return this.getRelativezIndex(Node.MAX_NESTING); }


	public getRelativePosition(nl: number = 0, arr: Node2D[] = this.getChainParents(Node2D)): Vector2 {
		const l = Math.min(nl, arr.length, Node.MAX_NESTING);
		const acc = new Vector2();

		let prev: Node2D = this, next: Node2D | null = null;

		if(!arr.length) acc.add(this.position);

		for(let i = 0; i < l; i++) {
			next = arr[i];

			if(!prev.position.isSame(Vector2.ZERO)) {
				acc.add(prev.position).inc(next.scale);
				if(next.rotation !== 0) acc.angle = next.rotation;
			}

			prev = next;
		};

		if(arr.length) acc.add(arr[arr.length-1].position);

		return acc;
	}

	public getRelativeScale(nl: number = 0, arr: Node2D[] = this.getChainParents(Node2D)): Vector2 {
		const l = Math.min(nl, arr.length, Node.MAX_NESTING);
		const acc = this.scale.buf();

		for(let i = 0; i < l; i++) {
			if(!arr[i].scale.isSame(Vector2.ZERO)) acc.inc(arr[i].scale);
		}

		return acc;
	}

	public getRelativeRotation(nl: number = 0, arr: Node2D[] = this.getChainParents(Node2D)): number {
		const l = Math.min(nl, arr.length, Node.MAX_NESTING);
		let acc = this.rotation;

		for(let i = 0; i < l; i++) {
			if(arr[i].rotation !== 0) acc += arr[i].rotation;
		}

		return acc;
	}

	public getRelativezIndex(nl: number = 0, arr: Node2D[] = this.getChainParents(Node2D)): number {
		const l = Math.min(nl, arr.length, Node.MAX_NESTING);
		let acc = this.zIndex;

		if(!this.zAsRelative) return acc;

		for(let i = 0; i < l; i++) {
			acc += arr[i].zIndex;

			if(arr[i].zAsRelative) return acc;
		}

		return acc;
	}
	*/


	// public getDrawPosition(camera: Camera) {
	// 	return this.globalPosition.inc(camera.scale).inc(camera.pixelDensity).sub(camera.getDrawPosition());
	// }

	public getDrawPosition(camera: Camera) {
		return this.position.buf().inc(camera.scale).inc(camera.pixelDensity).sub(camera.getDrawPosition());
	}


	protected _draw(
		ctx: CanvasRenderingContext2D,
		pos: Vector2,
		scale: Vector2,
		rot: number,
		pixelDensity: number
	) {}


	// public render(this: Node2D, layers: LayersList, camera: Camera): void {
	// 	this._draw(layers.main,
	// 		this.getDrawPosition(camera),
	// 		this.globalScale.inc(camera.scale),
	// 		this.globalRotation - camera.rotation,
	// 		camera.pixelDensity
	// 	);
	//
	// 	super.render(layers, camera);
	// }

	public render(this: Node2D, layers: LayersList, camera: Camera): void {
		this._draw(layers.main,
			this.getDrawPosition(camera),
			this.scale.buf().inc(camera.scale),
			this.rotation - camera.rotation,
			camera.pixelDensity
		);

		super.render(layers, camera);
	}
}
