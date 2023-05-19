import { Event } from '@ver/events';
import { System } from '@ver/System';
import { Node } from '@/scenes/Node';
import type { Camera } from '@ver/Camera';
import type { LayersList } from '@ver/CanvasLayer';
import {gm} from '@/global';


export class RenderSystem extends System<typeof CanvasItem> {
	constructor() {
		super(CanvasItem);

		const zIndex = () => this._items.sort(this._sort);

		this['@add'].on(item => {
			item.on('change%zIndex', zIndex);
			zIndex();
		});

		this['@removing'].on(item => item.off('change%zIndex', zIndex));
	}

	public _sort(a: CanvasItem, b: CanvasItem): number { return a.globalzIndex - b.globalzIndex; }

	public update(layers: Record<string, CanvasRenderingContext2D>, camera: Camera) {
		const ctx = layers.main;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		// layers.main.translate(camera.position.x*camera.scale.x, camera.position.y*camera.scale.y);

		// const center = camera.position.buf().add(camera.size.buf().div(1).inc(1||camera.scale));

		// layers.main.beginPath();
		// layers.main.rect(-gm.screen.x/2, -gm.screen.y/2, gm.screen.x, gm.screen.y);
		// layers.main.clip();


		for(let i = 0; i < this._items.length; i++) {
			this._items[i].render(layers, camera);
		}
	}
}


const PARENT_CACHE = Symbol('PARENT_CACHE');

export class CanvasItem extends Node {
	public set '%visible'(v: boolean) { this.visible = v; }
	public get '%visible'(): boolean { return this.visible; }

	public set '%zAsRelative'(v: boolean) { this.zAsRelative = v; }
	public get '%zAsRelative'(): boolean { return this.zAsRelative; }

	public set '%zIndex'(v: number) { this.zIndex = v; }
	public get '%zIndex'(): number { return this.zIndex; }


	protected [PARENT_CACHE]: CanvasItem[] = [];

	public '@change%zIndex' = new Event<CanvasItem, [CanvasItem]>(this);


	protected _visible: boolean = true;
	public get visible() { return this._visible; }
	public set visible(v) { this._visible = v; }

	protected _zAsRelative: boolean = true;
	public get zAsRelative() { return this._zAsRelative; }
	public set zAsRelative(v) {
		if(v === this._zAsRelative) return;
		this._zAsRelative = v;
		this['@change%zIndex'].emit(this);
	}

	protected _zIndex: number = 0;
	public get zIndex(): number { return this._zIndex; }
	public set zIndex(v: number) {
		if(v === this._zIndex) return;
		this._zIndex = v;
		this['@change%zIndex'].emit(this);
	}


	public get globalzIndex(): number {
		if(!this.zAsRelative) return this.zIndex;

		const chain = this[PARENT_CACHE];
		let acc = 0;
		for(let i = chain.length-1; i >= 0; i--) {
			acc += chain[i].zIndex;
		}
		return acc;
	}


	constructor() {
		super();

		const ontree = () => {
			this[PARENT_CACHE].length = 0;
			this[PARENT_CACHE].push(...this.getChainOwnersOf(CanvasItem));
		};

		ontree();

		this['@tree_entered'].on(ontree);
		this['@tree_exiting'].on(ontree);
	}


	protected _render(layers: LayersList, camera: Camera): void {}

	public render(layers: LayersList, camera: Camera): void {
		if(!this._visible) return;

		this._render(layers, camera);
	}
}
