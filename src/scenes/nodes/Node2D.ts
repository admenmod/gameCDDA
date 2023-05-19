import { Vector2 } from '@ver/Vector2';
import { Node } from '@/scenes/Node';
import { CanvasItem } from '@/scenes/CanvasItem';
import { LayersList } from '@ver/CanvasLayer';
import { Camera } from '@ver/Camera';


const PARENT_CACHE = Symbol('PARENT_CACHE');

export class Node2D extends CanvasItem {
	public set '%position'(v: Vector2) { this.position.set(v); }
	public get '%position'(): Vector2 { return this.position.buf(); }

	public set '%rotation'(v: number) { this.rotation = v; }
	public get '%rotation'(): number { return this.rotation; }

	public set '%scale'(v: Vector2) { this.scale.set(v); }
	public get '%scale'(): Vector2 { return this.scale.buf(); }


	protected [PARENT_CACHE]: Node2D[] = [];


	public readonly position = new Vector2();
	public readonly axis_offset = new Vector2();
	public readonly scale = new Vector2(1, 1);

	protected _rotation: number = 0;
	public get rotation(): number { return this._rotation; }
	public set rotation(v: number) { this._rotation = v; }


	constructor() {
		super();

		const ontree = () => {
			this[PARENT_CACHE].length = 0;
			this[PARENT_CACHE].push(...this.getChainOwnersOf(Node2D));
		};

		ontree();

		this['@tree_entered'].on(ontree);
		this['@tree_exiting'].on(ontree);
	}


	public get globalPosition(): Vector2 { return this.getRelativePosition(Node.MAX_NESTING); }
	public get globalScale(): Vector2 { return this.getRelativeScale(Node.MAX_NESTING); }
	public get globalRotation(): number { return this.getRelativeRotation(Node.MAX_NESTING); }
	public get globalzIndex(): number { return this.getRelativezIndex(Node.MAX_NESTING); }


	public getRelativePosition(nl: number = 0, arr: Node2D[] = this[PARENT_CACHE]): Vector2 {
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
		}

		if(arr.length) acc.add(arr[arr.length-1].position);

		return acc;
	}

	public getRelativeScale(nl: number = 0, arr: Node2D[] = this[PARENT_CACHE]): Vector2 {
		const l = Math.min(nl, arr.length, Node.MAX_NESTING);
		const acc = this.scale.buf();

		for(let i = 0; i < l; i++) {
			if(!arr[i].scale.isSame(Vector2.ZERO)) acc.inc(arr[i].scale);
		}

		return acc;
	}

	public getRelativeRotation(nl: number = 0, arr: Node2D[] = this[PARENT_CACHE]): number {
		const l = Math.min(nl, arr.length, Node.MAX_NESTING);
		let acc = this.rotation;

		for(let i = 0; i < l; i++) {
			if(arr[i].rotation !== 0) acc += arr[i].rotation;
		}

		return acc;
	}

	public getRelativezIndex(nl: number = 0, arr: Node2D[] = this[PARENT_CACHE]): number {
		const l = Math.min(nl, arr.length, Node.MAX_NESTING);
		let acc = this.zIndex;

		if(!this.zAsRelative) return acc;

		for(let i = 0; i < l; i++) {
			acc += arr[i].zIndex;

			if(arr[i].zAsRelative) return acc;
		}

		return acc;
	}


	protected _draw(ctx: CanvasRenderingContext2D) {}

	protected _render(layers: LayersList, camera: Camera): void {
		const ctx = layers.main;

		ctx.save();
		camera.use(ctx);

		const scale = this.globalScale;
		const pos = this.globalPosition;
		const rot = this.globalRotation;

		ctx.scale(scale.x, scale.y);
		ctx.translate(pos.x, pos.y);

		if(this.axis_offset.x !== 0 || this.axis_offset.y !== 0) {
			ctx.translate(pos.x + this.axis_offset.x, pos.y + this.axis_offset.y);
			ctx.rotate(rot);
			ctx.translate(-(pos.x + this.axis_offset.x), -(pos.y + this.axis_offset.y));
		} else ctx.rotate(rot);

		this._draw(ctx);

		ctx.restore();
	}
}
